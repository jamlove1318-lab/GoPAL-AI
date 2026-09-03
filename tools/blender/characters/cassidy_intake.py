"""Safe intake helpers for a real authored Cassidy asset.

The factory accepts authored .blend/.glb/.gltf sources but never silently
turns an invalid source into a production asset. Intake is intentionally
separate from authoring so the same pipeline can be reused for future
characters.
"""

from pathlib import Path
from typing import Optional

import bpy

from factory.naming import sanitize_name

SUPPORTED_EXTENSIONS = {".blend", ".glb", ".gltf"}


def inspect_asset_source(path: str) -> dict:
    source = Path(path).expanduser()
    return {
        "path": str(source),
        "exists": source.exists(),
        "is_file": source.is_file(),
        "extension": source.suffix.lower(),
        "supported": source.suffix.lower() in SUPPORTED_EXTENSIONS,
        "size_bytes": source.stat().st_size if source.is_file() else 0,
    }


def require_asset_source(path: str) -> Path:
    info = inspect_asset_source(path)
    if not info["exists"] or not info["is_file"]:
        raise FileNotFoundError(f"Cassidy asset source not found: {path}")
    if not info["supported"]:
        raise ValueError(f"Unsupported Cassidy asset format: {info['extension']}")
    if info["size_bytes"] <= 0:
        raise ValueError(f"Cassidy asset source is empty: {path}")
    return Path(info["path"])


def import_authored_asset(path: str, collection_name: str = "CHARACTERS") -> dict:
    """Import an authored source and report what Blender actually loaded."""
    source = require_asset_source(path)
    collection = bpy.data.collections.get(collection_name)
    if collection is None:
        raise RuntimeError(f"Missing destination collection: {collection_name}")

    before = {obj.as_pointer() for obj in bpy.data.objects}
    ext = source.suffix.lower()

    if ext == ".blend":
        raise ValueError(
            "Direct .blend linking is intentionally not automated here; open or append "
            "the authored scene explicitly so source ownership is preserved."
        )
    if ext in {".glb", ".gltf"}:
        result = bpy.ops.import_scene.gltf(filepath=str(source))
    else:
        raise ValueError(f"Unsupported import format: {ext}")

    if "FINISHED" not in result:
        raise RuntimeError(f"Blender failed to import Cassidy asset: {result}")

    imported = [obj for obj in bpy.data.objects if obj.as_pointer() not in before]
    for obj in imported:
        if obj.name:
            obj.name = sanitize_name(obj.name) or obj.name

    return {
        "source": str(source),
        "imported_object_count": len(imported),
        "imported_objects": [obj.name for obj in imported],
        "result": list(result),
    }
