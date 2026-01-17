"""
Authentication routes
Handles signup, login, and user verification
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from core.database import get_db
from core.models import User, Candidate
from core.auth import (
    hash_password, 
    verify_password, 
    create_access_token,
    get_current_user,
    security
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Request/Response models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Candidate signup - Step 1 of registration
    Creates user account with email and password
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=request.email,
        name=request.name,
        password_hash=hash_password(request.password),
        role="candidate"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create empty candidate record (to be completed in application form)
    candidate = Candidate(
        user_id=new_user.id,
        application_completed=False
    )
    db.add(candidate)
    db.commit()
    
    # Generate token
    token = create_access_token(data={
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    })
    
    return AuthResponse(
        access_token=token,
        user={
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "role": new_user.role,
            "application_completed": False
        }
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login for both admins and candidates
    Returns JWT token and user information
    """
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Get application status (for candidates)
    application_completed = False
    if user.role == "candidate":
        candidate = db.query(Candidate).filter(Candidate.user_id == user.id).first()
        if candidate:
            application_completed = candidate.application_completed
    
    # Generate token
    token = create_access_token(data={
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })
    
    return AuthResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "application_completed": application_completed
        }
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user information
    """
    candidate_status = "registered"
    full_name = current_user.name
    
    if current_user.role == "candidate":
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if candidate:
            application_completed = candidate.application_completed
            candidate_id = candidate.id
            candidate_status = candidate.overall_status
            if candidate.full_name:
                full_name = candidate.full_name
    
    return {
        "id": candidate_id,
        "user_id": current_user.id,
        "email": current_user.email,
        "name": full_name,
        "role": current_user.role,
        "application_completed": application_completed,
        "candidate_status": candidate_status,
        "full_name": full_name
    }


@router.post("/verify-token")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify if a JWT token is valid
    """
    from core.auth import verify_token as verify_jwt
    
    try:
        payload = verify_jwt(credentials.credentials)
        return {"valid": True, "payload": payload}
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
