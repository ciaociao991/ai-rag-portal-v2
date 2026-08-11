import httpx
from ..core.config import settings
from ..core.logging import logger
from .vector_store import store

SYSTEM_PROMPT = """Sei un assistente RAG. Rispondi SOLO usando il contesto fornito.
Se la risposta non è nel contesto, dillo esplicitamente e suggerisci di caricare documenti più pertinenti.
Cita sempre i file di origine quando possibile.
Rispondi in italiano se la domanda è in italiano."""

def build_context(chunks: list[dict]) -> str:
    parts = []
    for c in chunks:
        parts.append(f"[Fonte: {c['filename']} | chunk {c['chunk_index']} | score {c['score']:.3f}]\n{c['text']}")
    return "\n\n---\n\n".join(parts)

async def call_openai(prompt: str, context: str) -> str:
    if not settings.openai_api_key:
        return ""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json={
                    "model": settings.openai_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Contesto:\n{context}\n\nDomanda: {prompt}\n\nRispondi in modo conciso e cita le fonti."},
                    ],
                    "temperature": 0.2,
                },
            )
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"OpenAI call failed: {e}")
        return ""

def mock_answer(prompt: str, chunks: list[dict]) -> str:
    if not chunks:
        return "Non ho trovato informazioni pertinenti nei documenti indicizzati. Prova a riformulare la domanda o carica file più rilevanti."
    ctx = build_context(chunks)
    # Simple extractive mock: return top chunk + note
    top = chunks[0]
    return (
        f"Basandomi sui documenti caricati (in particolare **{top['filename']}**), ecco cosa ho trovato:\n\n"
        f"> {top['text'][:600]}...\n\n"
        f"Domanda originale: \"{prompt}\"\n\n"
        f"Contesto utilizzato ({len(chunks)} chunk):\n{ctx[:2000]}\n\n"
        f"_Risposta mock (configura OPENAI_API_KEY per risposte LLM reali)._"
    )

async def answer_query(query: str, top_k: int | None = None) -> dict:
    chunks = store.search(query, top_k=top_k)
    context = build_context(chunks) if chunks else ""
    answer = ""
    if settings.openai_api_key:
        answer = await call_openai(query, context)
    if not answer:
        answer = mock_answer(query, chunks)
    return {
        "answer": answer,
        "sources": [
            {"filename": c["filename"], "chunk_index": c["chunk_index"], "score": c["score"], "text": c["text"][:400]}
            for c in chunks
        ],
        "context_used": bool(chunks),
    }
