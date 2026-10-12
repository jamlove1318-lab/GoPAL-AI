"""
GoPAL-AI Blender Production Factory - GLB Roundtrip Validator.
Imports the exported runtime asset back into a pristine scene to verify asset integrity.
"""

from pathlib import Path
from typing import Any, Dict, List

from factory.validation.cassidy_validator import (
    REQUIRED_ANIMATIONS,
    REQUIRED_EXPRESSIONS,
    REQUIRED_NODES,
)


def validate_glb_roundtrip(glb_path: Path) -> Dict[str, Any]:
    """Import GLB file into fresh scene and verify fidelity."""
    import bpy

    if not glb_path.is_file():
        return {
            "valid": False,
            "error": f"GLB file does not exist: {glb_path}",
        }

    # Reset to fresh empty scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    try:
        bpy.ops.import_scene.gltf(filepath=str(glb_path.resolve()))
    except Exception as e:
        return {
            "valid": False,
            "error": f"Failed to import GLB: {e}",
        }

    imported_nodes = {obj.name for obj in bpy.data.objects}
    imported_animations = {act.name for act in bpy.data.actions}
    imported_morphs = set()

    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.data and obj.data.shape_keys:
            for key in obj.data.shape_keys.key_blocks:
                imported_morphs.add(key.name)

    # Note: GLTF exporters may append prefixes or suffix numbers to objects, so check presence
    missing_nodes = []
    for req in REQUIRED_NODES:
        found = any(req in node_name for node_name in imported_nodes)
        if not found:
            missing_nodes.append(req)

    missing_animations = []
    for req in REQUIRED_ANIMATIONS:
        found = any(req in act_name for act_name in imported_animations)
        if not found:
            missing_animations.append(req)

    missing_expressions = []
    for req in REQUIRED_EXPRESSIONS:
        found = any(req in morph_name for morph_name in imported_morphs)
        if not found:
            missing_expressions.append(req)

    is_valid = not (missing_nodes or missing_animations or missing_expressions)

    errors = []
    if missing_nodes:
        errors.append(f"Missing nodes in roundtrip: {', '.join(missing_nodes)}")
    if missing_animations:
        errors.append(f"Missing animations in roundtrip: {', '.join(missing_animations)}")
    if missing_expressions:
        errors.append(f"Missing expressions in roundtrip: {', '.join(missing_expressions)}")

    return {
        "valid": is_valid,
        "errors": errors,
        "imported_objects_count": len(bpy.data.objects),
        "imported_actions_count": len(bpy.data.actions),
        "missing_nodes": missing_nodes,
        "missing_animations": missing_animations,
        "missing_expressions": missing_expressions,
    }
