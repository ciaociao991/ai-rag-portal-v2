from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from .core.config import settings
from .core.logging import setup_logging, logger
from .api.routes_health import router as health_router
from .api.routes_auth import router as auth_router
from .api.routes_files import router as files_router
from .api.routes_query import router as query_router

setup_logging()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="RAG backend: upload -> index -> query",
)

# CORS: allow frontend
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
        duration = (time.time() - start) * 1000
        logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration:.1f}ms)")
        return response
    except Exception as e:
        logger.exception(f"Unhandled error on {request.method} {request.url.path}: {e}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(query_router)

# Fallback health endpoint directly on app (ensures Railway finds /health even if router prefix changes)
@app.get("/health")
def health_direct():
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Starting {settings.app_name} v{settings.version} | data_dir={settings.data_dir}")

# For `python -m app.main` dev
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
