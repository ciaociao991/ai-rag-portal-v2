# Backend Dockerfile - FastAPI + RAG - Railway compatible
# Build context is repository root (Railway) -> COPY backend/...
# Also works locally via docker-compose (context: .)
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

RUN mkdir -p data/uploads

EXPOSE 8000

# Railway injects PORT; must bind 0.0.0.0 and use $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
