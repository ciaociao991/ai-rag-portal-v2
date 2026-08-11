import tempfile
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.services.vector_store import store
from app.services.file_store import file_store

client = TestClient(app)

def test_upload_index_query_flow():
    # clean state
    store.clear()
    # ensure files cleared
    for f in list(file_store.list_all()):
        file_store.remove(f["id"])
        store.remove_file(f["id"])

    # upload a txt file
    content = b"Il RAG (Retrieval Augmented Generation) combina ricerca semantica e LLM. Il vettore store indicizza i chunk."
    r = client.post("/files/upload", files=[("files", ("test.txt", content, "text/plain"))])
    assert r.status_code == 200, r.text
    fid = r.json()["uploaded"][0]["id"]

    # index
    r = client.post("/files/index", json=[fid])
    assert r.status_code == 200, r.text
    assert r.json()["indexed"][0]["chunks"] > 0

    # search
    r = client.post("/search", json={"query": "cos'e il RAG?"})
    assert r.status_code == 200
    assert len(r.json()["results"]) > 0

    # query (mock answer if no OPENAI key)
    r = client.post("/query", json={"question": "Cos'e il RAG?"})
    assert r.status_code == 200
    assert "answer" in r.json()
    assert len(r.json()["answer"]) > 10

def test_auth_demo_login():
    r = client.post("/auth/login", json={"email": "demo@rag.local", "password": "demo1234"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_invalid_upload_type():
    r = client.post("/files/upload", files=[("files", ("evil.exe", b"xxx", "application/octet-stream"))])
    assert r.status_code == 400
