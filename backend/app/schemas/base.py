from datetime import datetime

from pydantic import BaseModel


class BaseSchema(BaseModel):
    """Base schema with common fields"""

    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ResponseSchema(BaseModel):
    """Standard API response schema"""

    success: bool = True
    message: str = "Success"
    data: dict | None = None
    errors: list | None = None
