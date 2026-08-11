from fastapi import APIRouter
from ..core.config import settings
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "ok",
        "version": settings.version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/")
def root():
    return {"name": settings.app_name, "version": settings.version, "docs": "/docs"}
