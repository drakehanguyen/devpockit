import json
import uuid
from typing import Any

import yaml


class ToolsService:
    """Service class for developer tools functionality"""

    @staticmethod
    def format_json(data: str, minify: bool = False) -> dict[str, Any]:
        """Format JSON data (minify or beautify)"""
        try:
            # Parse JSON to validate
            parsed_data = json.loads(data)

            if minify:
                formatted_data = json.dumps(parsed_data, separators=(",", ":"))
            else:
                formatted_data = json.dumps(parsed_data, indent=2)

            return {
                "formatted_data": formatted_data,
                "original_length": len(data),
                "formatted_length": len(formatted_data),
            }
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")

    @staticmethod
    def convert_yaml(data: str, from_format: str, to_format: str) -> dict[str, Any]:
        """Convert between JSON and YAML formats"""
        try:
            if from_format == "json" and to_format == "yaml":
                # JSON to YAML
                json_data = json.loads(data)
                yaml_data = yaml.dump(json_data, default_flow_style=False)
                return {
                    "converted_data": yaml_data,
                    "from_format": from_format,
                    "to_format": to_format,
                }
            elif from_format == "yaml" and to_format == "json":
                # YAML to JSON
                yaml_data = yaml.safe_load(data)
                json_data = json.dumps(yaml_data, indent=2)
                return {
                    "converted_data": json_data,
                    "from_format": from_format,
                    "to_format": to_format,
                }
            else:
                raise ValueError(
                    f"Unsupported conversion: {from_format} to {to_format}"
                )
        except (json.JSONDecodeError, yaml.YAMLError) as e:
            raise ValueError(f"Conversion error: {str(e)}")

    @staticmethod
    def generate_uuid(
        version: int, count: int = 1, namespace: str = None
    ) -> dict[str, Any]:
        """Generate UUIDs based on version"""
        try:
            uuids = []

            if version == 1:
                for _ in range(count):
                    uuids.append(str(uuid.uuid1()))
            elif version == 4:
                for _ in range(count):
                    uuids.append(str(uuid.uuid4()))
            elif version == 5:
                if not namespace:
                    namespace = str(uuid.uuid4())
                namespace_uuid = uuid.UUID(namespace)
                for _ in range(count):
                    uuids.append(str(uuid.uuid5(namespace_uuid, f"devpockit-{_}")))
            else:
                raise ValueError(f"Unsupported UUID version: {version}")

            return {"uuids": uuids, "version": version, "count": count}
        except ValueError as e:
            raise ValueError(f"UUID generation error: {str(e)}")
