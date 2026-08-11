from ..core.config import settings

def chunk_text(text: str, chunk_size: int | None = None, overlap: int | None = None) -> list[str]:
    """Simple sliding window chunker on characters with word-boundary fallback."""
    if not text:
        return []
    cs = chunk_size or settings.chunk_size
    ov = overlap or settings.chunk_overlap
    chunks: list[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + cs, n)
        # try to avoid cutting mid-word: extend to next space if close to boundary
        if end < n:
            # look back for last space/newline within last 100 chars
            window = text[end-100:end] if end >= 100 else text[start:end]
            # actually prefer to cut at newline/space
            last_space = text.rfind(" ", start, end)
            last_nl = text.rfind("\n", start, end)
            cut = max(last_space, last_nl)
            if cut > start + cs * 0.5:  # only if reasonable
                end = cut
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= n:
            break
        start = end - ov
        if start < 0:
            start = 0
    return chunks
