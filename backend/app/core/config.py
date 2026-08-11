from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    app_name: str = "AI RAG Portal API"
    version: str = "1.0.0"
    data_dir: Path = Path("data")
    upload_dir: Path = Path("data/uploads")
    vector_store_path: Path = Path("data/vector_store.json")
    files_db_path: Path = Path("data/files.json")
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "tfidf"  # tfidf | openai
    chunk_size: int = 800
    chunk_overlap: int = 100
    top_k: int = 4
    log_level: str = "INFO"
    cors_origins: str = "*"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
# ensure dirs exist on import (also done at startup)
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.upload_dir.mkdir(parents=True, exist_ok=True)
