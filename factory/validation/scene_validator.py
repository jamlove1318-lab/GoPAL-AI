"""
Generic Blender production scene validation.
Reuses and extends baseline scene validation contracts.
"""

from typing import List


def validate_scene() -> List[str]:
    import bpy

    errors = []

    if bpy.context.scene is None:
        errors.append("No active Blender scene.")
        return errors

    for obj in bpy.data.objects:
        if not obj.name:
            errors.append("Scene contains an unnamed object.")

    return errors


def validate_mesh_objects() -> List[str]:
    import bpy

    errors = []

    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue

        if obj.data is None:
            errors.append(f"Mesh object has no mesh data: {obj.name}")
            continue

        mesh = obj.data
        if len(mesh.vertices) == 0:
            errors.append(f"Mesh object has zero vertices: {obj.name}")
        if len(mesh.polygons) == 0:
            errors.append(f"Mesh object has zero polygons: {obj.name}")

    return errors


def validate_production_scene() -> List[str]:
    return validate_scene() + validate_mesh_objects()
