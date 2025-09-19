from fastapi import APIRouter

from app.schemas.base import ResponseSchema
from app.schemas.tools import JsonFormatRequest, UuidGenerateRequest, YamlConvertRequest
from app.services.tools_service import ToolsService

router = APIRouter()


@router.post("/json/format", response_model=ResponseSchema)
async def format_json(request: JsonFormatRequest):
    """Format JSON data (minify or beautify)"""
    try:
        result = ToolsService.format_json(request.data, request.minify)
        return ResponseSchema(
            success=True, message="JSON formatted successfully", data=result
        )
    except Exception as e:
        return ResponseSchema(
            success=False, message="JSON formatting failed", errors=[str(e)]
        )


@router.post("/yaml/convert", response_model=ResponseSchema)
async def convert_yaml(request: YamlConvertRequest):
    """Convert between JSON and YAML"""
    try:
        result = ToolsService.convert_yaml(
            request.data, request.from_format, request.to_format
        )
        return ResponseSchema(
            success=True, message="Conversion completed successfully", data=result
        )
    except Exception as e:
        return ResponseSchema(
            success=False, message="Conversion failed", errors=[str(e)]
        )


@router.post("/uuid/generate", response_model=ResponseSchema)
async def generate_uuid(request: UuidGenerateRequest):
    """Generate UUIDs"""
    try:
        result = ToolsService.generate_uuid(
            request.version, request.count, request.namespace
        )
        return ResponseSchema(
            success=True, message="UUIDs generated successfully", data=result
        )
    except Exception as e:
        return ResponseSchema(
            success=False, message="UUID generation failed", errors=[str(e)]
        )


@router.get("/health", response_model=ResponseSchema)
async def tools_health():
    """Health check for tools service"""
    return ResponseSchema(
        success=True, message="Tools service is healthy", data={"status": "operational"}
    )
