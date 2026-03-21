from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from auth.password import hash_password, verify_password
from auth.jwt_handler import create_access_token, create_refresh_token, verify_token
from auth.dependencies import get_current_user
from database.queries import create_user, get_user_by_email, get_user_by_id, update_user_profile
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

def safe_user(user: dict) -> dict:
    """Remove password_hash from user dict."""
    return {k: v for k, v in user.items() if k != "password_hash"}

@router.post("/signup", status_code=201)
async def signup(data: SignupRequest):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = await get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = await create_user(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="citizen",
        phone=data.phone,
        address=data.address,
        emergency_contact_name=data.emergency_contact_name,
        emergency_contact_phone=data.emergency_contact_phone,
    )
    clean = safe_user(user)
    return {
        "user": clean,
        "access_token": create_access_token(user["id"], user["role"]),
        "refresh_token": create_refresh_token(user["id"]),
        "token_type": "bearer",
    }

@router.post("/login")
async def login(data: LoginRequest):
    user = await get_user_by_email(data.email)
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    clean = safe_user(user)
    return {
        "user": clean,
        "access_token": create_access_token(user["id"], user["role"]),
        "refresh_token": create_refresh_token(user["id"]),
        "token_type": "bearer",
    }

@router.post("/refresh")
async def refresh(data: RefreshRequest):
    try:
        payload = verify_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "access_token": create_access_token(user["id"], user["role"]),
            "token_type": "bearer",
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return safe_user(user)

@router.put("/profile")
async def update_profile(data: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    fields = {k: v for k, v in data.dict().items() if v is not None}
    updated = await update_user_profile(user["id"], **fields)
    return safe_user(updated)
