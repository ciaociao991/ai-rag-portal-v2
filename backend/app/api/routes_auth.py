from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.auth import authenticate, create_token

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(body: LoginRequest):
    user = authenticate(body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["email"], user["role"])
    return {"access_token": token, "token_type": "bearer", "email": user["email"], "role": user["role"]}

@router.get("/me")
def me_demo():
    return {
        "demo_accounts": [
            {"email": "demo@rag.local", "password": "demo1234"},
            {"email": "admin@rag.local", "password": "admin1234"},
        ]
    }
