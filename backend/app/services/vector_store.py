import json
import re
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ..core.config import settings
from ..core.logging import logger

class VectorStore:
    """TF-IDF based vector store with optional OpenAI embeddings fallback.
    Persists to JSON for simplicity. In production replace with pgvector/Chroma/Qdrant.
    """
    def __init__(self, path: Path | None = None):
        self.path = path or settings.vector_store_path
        self.chunks: List[Dict[str, Any]] = []  # {id, file_id, filename, text, chunk_index}
        self.vectorizer: TfidfVectorizer | None = None
        self.matrix = None
        self._load()

    def _load(self):
        if self.path.exists():
            try:
                data = json.loads(self.path.read_text(encoding="utf-8"))
                self.chunks = data.get("chunks", [])
                logger.info(f"Loaded {len(self.chunks)} chunks from {self.path}")
            except Exception as e:
                logger.warning(f"Failed to load vector store: {e}")
                self.chunks = []
        self._rebuild()

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps({"chunks": self.chunks}, ensure_ascii=False, indent=2), encoding="utf-8")

    def _rebuild(self):
        if not self.chunks:
            self.vectorizer = None
            self.matrix = None
            return
        corpus = [c["text"] for c in self.chunks]
        # TF-IDF with simple preprocessing
        self.vectorizer = TfidfVectorizer(
            max_features=8192,
            stop_words="english",
            ngram_range=(1, 2),
            token_pattern=r"(?u)\b\w+\b",
        )
        try:
            self.matrix = self.vectorizer.fit_transform(corpus)
        except ValueError as e:
            # empty vocabulary
            logger.warning(f"TF-IDF build failed: {e}")
            self.vectorizer = None
            self.matrix = None

    def add_chunks(self, file_id: str, filename: str, chunks: List[str]):
        # remove old chunks for same file_id
        self.chunks = [c for c in self.chunks if c["file_id"] != file_id]
        for idx, text in enumerate(chunks):
            self.chunks.append({
                "id": f"{file_id}__{idx}",
                "file_id": file_id,
                "filename": filename,
                "text": text,
                "chunk_index": idx,
            })
        self._rebuild()
        self._save()
        logger.info(f"Indexed {len(chunks)} chunks for {filename} ({file_id})")

    def remove_file(self, file_id: str):
        before = len(self.chunks)
        self.chunks = [c for c in self.chunks if c["file_id"] != file_id]
        if len(self.chunks) != before:
            self._rebuild()
            self._save()

    def clear(self):
        self.chunks = []
        self.vectorizer = None
        self.matrix = None
        self._save()

    def search(self, query: str, top_k: int | None = None) -> List[Dict[str, Any]]:
        if not query or not self.chunks or self.vectorizer is None or self.matrix is None:
            return []
        k = top_k or settings.top_k
        q_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(q_vec, self.matrix).flatten()
        # get top k indices sorted
        top_indices = np.argsort(sims)[::-1][:k]
        results = []
        for idx in top_indices:
            score = float(sims[idx])
            if score <= 0:
                continue
            c = self.chunks[int(idx)]
            results.append({**c, "score": score})
        return results

    def stats(self) -> Dict[str, Any]:
        return {
            "total_chunks": len(self.chunks),
            "indexed_files": len(set(c["file_id"] for c in self.chunks)),
            "vocab_size": len(self.vectorizer.vocabulary_) if self.vectorizer else 0,
        }

# singleton
store = VectorStore()
