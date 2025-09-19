from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.base import ResponseSchema
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.user_service import UserService

router = APIRouter()


@router.post("/register", response_model=ResponseSchema)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    try:
        # Check if user already exists
        existing_user = UserService.get_user_by_email(db, user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        existing_username = UserService.get_user_by_username(db, user_create.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
            )

        # Create new user
        user = UserService.create_user(db, user_create)
        user_response = UserResponse.from_orm(user)

        return ResponseSchema(
            success=True,
            message="User registered successfully",
            data={"user": user_response.dict()},
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=ResponseSchema)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint"""
    try:
        # Authenticate user
        user = UserService.authenticate_user(
            db, user_login.username, user_login.password
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        # Create access token
        access_token_expires = timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
        access_token = create_access_token(
            subject=user.username, expires_delta=access_token_expires
        )

        user_response = UserResponse.from_orm(user)

        return ResponseSchema(
            success=True,
            message="Login successful",
            data={
                "user": user_response.dict(),
                "access_token": access_token,
                "token_type": "bearer",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.get("/me", response_model=ResponseSchema)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    user_response = UserResponse.from_orm(current_user)

    return ResponseSchema(
        success=True,
        message="User information retrieved",
        data={"user": user_response.dict(), "authenticated": True},
    )


@router.post("/logout", response_model=ResponseSchema)
async def logout():
    """User logout endpoint"""
    # TODO: Implement token blacklisting in Phase 5
    return ResponseSchema(
        success=True, message="Logout successful", data={"status": "logged_out"}
    )
