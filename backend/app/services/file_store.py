import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from ..core.config import settings
from ..core.logging import logger

class FileStore:
    def __init__(self, path: Path | None = None):
        self.path = path or settings.files_db_path
        self.files: list[dict] = []
        self._load()

    def _load(self):
        if self.path.exists():
            try:
                self.files = json.loads(self.path.read_text(encoding="utf-8")).get("files", [])
            except Exception as e:
                logger.warning(f"Failed to load files db: {e}")
                self.files = []

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps({"files": self.files}, ensure_ascii=False, indent=2), encoding="utf-8")

    def add(self, filename: str, saved_path: str, size: int, content_type: str | None) -> dict:
        fid = str(uuid.uuid4())
        entry = {
            "id": fid,
            "filename": filename,
            "saved_path": saved_path,
            "size": size,
            "content_type": content_type,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "indexed": False,
            "chunks": 0,
        }
        self.files.append(entry)
        self._save()
        return entry

    def update_indexed(self, file_id: str, chunks: int):
        for f in self.files:
            if f["id"] == file_id:
                f["indexed"] = True
                f["chunks"] = chunks
                f["indexed_at"] = datetime.now(timezone.utc).isoformat()
                break
        self._save()

    def remove(self, file_id: str) -> dict | None:
        for i, f in enumerate(self.files):
            if f["id"] == file_id:
                removed = self.files.pop(i)
                self._save()
                return removed
        return None

    def list_all(self):
        return sorted(self.files, key=lambda x: x["uploaded_at"], reverse=True)

    def get(self, file_id: str):
        for f in self.files:
            if f["id"] == file_id:
                return f
        return None

file_store = FileStore()
