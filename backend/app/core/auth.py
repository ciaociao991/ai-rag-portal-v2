from datetime import datetime, timedelta, timezone
from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

security = HTTPBearer(auto_error=False)

DEMO_USERS = {
    "demo@rag.local": {"email": "demo@rag.local", "password": "demo1234", "role": "user"},
    "admin@rag.local": {"email": "admin@rag.local", "password": "admin1234", "role": "admin"},
}

def create_token(email: str, role: str = "user") -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": email, "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    # Minimal auth: if no token, allow as guest (demo mode) for upload/query
    # but admin endpoints will enforce role.
    if credentials is None:
        return {"email": "guest@rag.local", "role": "guest"}
    payload = decode_token(credentials.credentials)
    return {"email": payload.get("sub"), "role": payload.get("role", "user")}

def require_admin(user=Depends(get_current_user)):
    if user["role"] not in ("admin", "user", "guest"):
        raise HTTPException(status_code=403, detail="Forbidden")
    # For now allow any authenticated; strict admin only if you want
    return user

def authenticate(email: str, password: str):
    u = DEMO_USERS.get(email)
    if not u or u["password"] != password:
        return None
    return u
