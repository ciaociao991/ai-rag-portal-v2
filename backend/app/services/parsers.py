from pathlib import Path
import io

def parse_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")

def parse_pdf(path: Path) -> str:
    from PyPDF2 import PdfReader
    reader = PdfReader(str(path))
    texts = []
    for page in reader.pages:
        try:
            t = page.extract_text() or ""
        except Exception:
            t = ""
        texts.append(t)
    return "\n".join(texts)

def parse_docx(path: Path) -> str:
    import docx
    doc = docx.Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs)

def parse_file(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return parse_pdf(path)
    if suffix == ".docx":
        return parse_docx(path)
    if suffix in (".txt", ".md", ".csv"):
        return parse_txt(path)
    # fallback try utf-8
    try:
        return parse_txt(path)
    except Exception as e:
        raise ValueError(f"Unsupported file type: {suffix}") from e
