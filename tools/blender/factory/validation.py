"""Generic Blender production validation primitives."""

import bpy


def validate_scene() -> list[str]:
    errors = []
    if bpy.context.scene is None:
        errors.append("No active Blender scene.")
    for obj in bpy.data.objects:
        if not obj.name:
            errors.append("Scene contains an unnamed object.")
    return errors


def validate_mesh_objects() -> list[str]:
    errors = []
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.data is None:
            errors.append(f"Mesh object has no mesh data: {obj.name}")
    return errors


def validate_production_scene() -> list[str]:
    return validate_scene() + validate_mesh_objects()
