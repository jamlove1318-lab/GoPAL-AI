"""Reusable, non-destructive modeling helpers for authored Cassidy meshes.

No function in this module creates humanoid geometry. Operations are limited
to modifiers, shading state, semantic metadata, and structural inspection.
"""

import bpy

MODEL_TOOL_VERSION = "3N.19"
AUTHORED_COLLECTION = "CASSIDY_AUTHORED"


def authored_meshes():
    collection = bpy.data.collections.get(AUTHORED_COLLECTION)
    if collection is None:
        return []
    return [obj for obj in collection.objects if obj.type == "MESH"]


def tag_authored_mesh(obj, role: str):
    if obj is None or obj.type != "MESH":
        raise ValueError("tag_authored_mesh requires a mesh object")
    obj["gopal_character"] = "Cassidy"
    obj["gopal_geometry_role"] = role
    obj["gopal_modeling_tool_version"] = MODEL_TOOL_VERSION
    return obj


def ensure_mirror_modifier(obj, use_clip=True):
    if obj is None or obj.type != "MESH":
        raise ValueError("Mirror requires an authored mesh")
    modifier = next((m for m in obj.modifiers if m.type == "MIRROR" and m.name == "Cassidy_Mirror"), None)
    if modifier is None:
        modifier = obj.modifiers.new("Cassidy_Mirror", "MIRROR")
    modifier.use_axis[0] = True
    modifier.use_clip = use_clip
    modifier.use_mirror_merge = True
    modifier.merge_threshold = 0.001
    return modifier


def ensure_subdivision_modifier(obj, levels=2, render_levels=2):
    if obj is None or obj.type != "MESH":
        raise ValueError("Subdivision requires an authored mesh")
    levels = max(0, min(int(levels), 4))
    render_levels = max(0, min(int(render_levels), 4))
    modifier = next((m for m in obj.modifiers if m.type == "SUBSURF" and m.name == "Cassidy_Subdivision"), None)
    if modifier is None:
        modifier = obj.modifiers.new("Cassidy_Subdivision", "SUBSURF")
    modifier.subdivision_type = "CATMULL_CLARK"
    modifier.levels = levels
    modifier.render_levels = render_levels
    return modifier


def prepare_smooth_shading(obj):
    if obj is None or obj.type != "MESH":
        raise ValueError("Smooth shading requires an authored mesh")
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    obj["gopal_smooth_shading"] = True
    return obj


def inspect_mesh_for_modeling(obj):
    if obj is None or obj.type != "MESH":
        raise ValueError("Mesh inspection requires a mesh object")
    mesh = obj.data
    uv_layers = len(mesh.uv_layers)
    material_slots = len(obj.material_slots)
    loose_vertices = 0
    for vertex in mesh.vertices:
        if not vertex.link_edges:
            loose_vertices += 1
    return {
        "name": obj.name,
        "role": obj.get("gopal_geometry_role"),
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "triangles": sum(len(poly.vertices) - 2 for poly in mesh.polygons if len(poly.vertices) >= 3),
        "uv_layers": uv_layers,
        "material_slots": material_slots,
        "loose_vertices": loose_vertices,
        "has_mirror": any(m.type == "MIRROR" for m in obj.modifiers),
        "has_subdivision": any(m.type == "SUBSURF" for m in obj.modifiers),
    }


def prepare_authored_mesh(obj, role: str, mirror=True, subdivision_levels=2):
    tag_authored_mesh(obj, role)
    if mirror:
        ensure_mirror_modifier(obj)
    ensure_subdivision_modifier(obj, subdivision_levels, subdivision_levels)
    prepare_smooth_shading(obj)
    return inspect_mesh_for_modeling(obj)


def validate_modeling_readiness():
    meshes = authored_meshes()
    reports = [inspect_mesh_for_modeling(obj) for obj in meshes]
    missing_uv = [r["name"] for r in reports if r["uv_layers"] == 0]
    loose_geometry = [r["name"] for r in reports if r["loose_vertices"] > 0]
    return {
        "version": MODEL_TOOL_VERSION,
        "valid": bool(meshes) and not loose_geometry,
        "mesh_count": len(meshes),
        "missing_uv": missing_uv,
        "loose_geometry": loose_geometry,
        "objects": reports,
        "policy": "authored-only",
        "note": "UVs are reported as readiness information; artistic quality remains a visual-review concern.",
    }
