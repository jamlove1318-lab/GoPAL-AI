"""Minimal generic Blender scene validation used by Cassidy gates."""
from __future__ import annotations


def validate_scene() -> list[str]:
    import bpy
    errors: list[str] = []
    if bpy.context.scene is None:
        return ["No active Blender scene."]
    for obj in bpy.data.objects:
        if not obj.name:
            errors.append("Scene contains an unnamed object.")
    return errors


def validate_mesh_objects() -> list[str]:
    import bpy
    errors: list[str] = []
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        if obj.data is None:
            errors.append(f"Mesh object has no mesh data: {obj.name}")
            continue
        if len(obj.data.vertices) == 0:
            errors.append(f"Mesh object has zero vertices: {obj.name}")
        if len(obj.data.polygons) == 0:
            errors.append(f"Mesh object has zero polygons: {obj.name}")
    return errors


def validate_production_scene() -> list[str]:
    return validate_scene() + validate_mesh_objects()
