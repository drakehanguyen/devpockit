from datetime import datetime

from pydantic import BaseModel, EmailStr, validator


class UserBase(BaseModel):
    """Base user schema"""

    email: EmailStr
    username: str
    is_active: bool = True


class UserCreate(UserBase):
    """Schema for creating a user"""

    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @validator("username")
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if not v.isalnum():
            raise ValueError("Username must contain only letters and numbers")
        return v


class UserUpdate(BaseModel):
    """Schema for updating a user"""

    email: EmailStr | None = None
    username: str | None = None
    is_active: bool | None = None

    @validator("username")
    def validate_username(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters long")
            if not v.isalnum():
                raise ValueError("Username must contain only letters and numbers")
        return v


class UserResponse(UserBase):
    """Schema for user response"""

    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""

    username: str
    password: str


class Token(BaseModel):
    """Schema for JWT token response"""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token data"""

    username: str | None = None
