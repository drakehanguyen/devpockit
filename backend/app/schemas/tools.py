from typing import Any

from pydantic import BaseModel


class JsonFormatRequest(BaseModel):
    """Request schema for JSON formatting"""

    data: str
    minify: bool = False


class JsonFormatResponse(BaseModel):
    """Response schema for JSON formatting"""

    formatted_data: str
    original_length: int
    formatted_length: int


class YamlConvertRequest(BaseModel):
    """Request schema for JSON/YAML conversion"""

    data: str
    from_format: str  # 'json' or 'yaml'
    to_format: str  # 'json' or 'yaml'


class YamlConvertResponse(BaseModel):
    """Response schema for JSON/YAML conversion"""

    converted_data: str
    from_format: str
    to_format: str


class UuidGenerateRequest(BaseModel):
    """Request schema for UUID generation"""

    version: int = 4  # 1, 4, or 5
    count: int = 1
    namespace: str | None = None  # For v5


class UuidGenerateResponse(BaseModel):
    """Response schema for UUID generation"""

    uuids: list[str]
    version: int
    count: int


class ToolErrorResponse(BaseModel):
    """Error response schema for tools"""

    error: str
    error_type: str
    details: dict[str, Any] | None = None
