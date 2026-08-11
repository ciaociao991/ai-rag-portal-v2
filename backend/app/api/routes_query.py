from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..services.rag import answer_query
from ..services.vector_store import store
from ..core.auth import get_current_user

router = APIRouter(prefix="", tags=["query"])

class QueryRequest(BaseModel):
    question: str
    top_k: int | None = None

class SearchRequest(BaseModel):
    query: str
    top_k: int | None = None

@router.post("/query")
async def query_rag(body: QueryRequest, user=Depends(get_current_user)):
    if not body.question.strip():
        return {"answer": "Domanda vuota.", "sources": []}
    result = await answer_query(body.question, top_k=body.top_k)
    return result

@router.post("/search")
def search(body: SearchRequest, user=Depends(get_current_user)):
    results = store.search(body.query, top_k=body.top_k)
    return {"results": results, "query": body.query}

@router.get("/admin/stats")
def admin_stats(user=Depends(get_current_user)):
    # minimal admin panel data
    from ..services.file_store import file_store
    return {
        "files": file_store.list_all(),
        "vector_store": store.stats(),
        "health": "ok",
    }
