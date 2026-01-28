from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User, UserCreate, UserOut, UserRole, Token
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate):
    """Register a new user (hospital or patient)."""
    existing = await User.find_one(User.email == user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        full_name=user_in.full_name,
        dob=user_in.dob,
        sex=user_in.sex
    )
    await user.create()
    return UserOut.from_user(user)


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and receive access token with user info."""
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    token = create_access_token(
        str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=token, token_type="bearer", user=UserOut.from_user(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return UserOut.from_user(current_user)


@router.get("/patients", response_model=List[UserOut])
async def list_patients(current_user: User = Depends(get_current_user)):
    """List all patients (hospital access only)."""
    if current_user.role != UserRole.HOSPITAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hospital access required"
        )
    patients = await User.find(User.role == UserRole.PATIENT).to_list()
    return [UserOut.from_user(p) for p in patients]
