from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    # Minimal, no dependencies — Railway healthcheck must never throw
    return {"status": "ok"}

@router.get("/")
def root():
    # Keep simple root for sanity check
    return {"status": "ok", "service": "ai-rag-portal-backend"}
