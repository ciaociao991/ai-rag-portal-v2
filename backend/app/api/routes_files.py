import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..core.config import settings
from ..core.logging import logger
from ..services.file_store import file_store
from ..services.parsers import parse_file
from ..services.chunking import chunk_text
from ..services.vector_store import store
from ..core.auth import get_current_user

router = APIRouter(prefix="/files", tags=["files"])

ALLOWED_EXT = {".pdf", ".txt", ".docx", ".md", ".csv"}

@router.get("")
def list_files(user=Depends(get_current_user)):
    return {"files": file_store.list_all()}

@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...), user=Depends(get_current_user)):
    if not files:
        raise HTTPException(400, "No files provided")
    results = []
    for f in files:
        ext = Path(f.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT:
            raise HTTPException(400, f"File type not allowed: {ext} (allowed: {ALLOWED_EXT})")
        # save to disk
        # sanitize filename
        safe_name = Path(f.filename).name
        # prefix with uuid to avoid collisions handled in file_store
        entry = file_store.add(safe_name, "", 0, f.content_type)
        save_path = settings.upload_dir / f"{entry['id']}_{safe_name}"
        with open(save_path, "wb") as out:
            shutil.copyfileobj(f.file, out)
        size = save_path.stat().st_size
        entry["saved_path"] = str(save_path)
        entry["size"] = size
        # persist size/path
        file_store._save()
        logger.info(f"Uploaded {safe_name} -> {save_path} ({size} bytes)")
        results.append(entry)
    return {"uploaded": results}

@router.delete("/{file_id}")
def delete_file(file_id: str, user=Depends(get_current_user)):
    entry = file_store.remove(file_id)
    if not entry:
        raise HTTPException(404, "File not found")
    # remove chunks
    store.remove_file(file_id)
    # remove file on disk
    try:
        p = Path(entry["saved_path"])
        if p.exists():
            p.unlink()
    except Exception:
        pass
    return {"deleted": file_id}

@router.post("/index")
async def index_files(file_ids: list[str] | None = None, user=Depends(get_current_user)):
    """Trigger indexing for given file_ids or all non-indexed files."""
    targets = []
    if file_ids:
        for fid in file_ids:
            e = file_store.get(fid)
            if not e:
                raise HTTPException(404, f"File {fid} not found")
            targets.append(e)
    else:
        targets = [f for f in file_store.list_all() if not f["indexed"]]

    if not targets:
        return {"indexed": [], "message": "Nothing to index"}

    indexed = []
    for entry in targets:
        path = Path(entry["saved_path"])
        if not path.exists():
            logger.warning(f"File missing on disk: {path}")
            continue
        try:
            text = parse_file(path)
        except Exception as e:
            raise HTTPException(500, f"Parse failed for {entry['filename']}: {e}")
        if not text.strip():
            logger.warning(f"Empty text for {entry['filename']}")
            chunks = []
        else:
            chunks = chunk_text(text)
        store.add_chunks(entry["id"], entry["filename"], chunks)
        file_store.update_indexed(entry["id"], len(chunks))
        indexed.append({"file_id": entry["id"], "filename": entry["filename"], "chunks": len(chunks)})
    return {"indexed": indexed}

@router.get("/indices/status")
def indices_status(user=Depends(get_current_user)):
    return {
        "vector_store": store.stats(),
        "files": file_store.list_all(),
    }
