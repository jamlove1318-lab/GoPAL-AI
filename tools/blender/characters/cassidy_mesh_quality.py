"""Structural quality checks for authored Cassidy geometry.

Open boundaries are not automatically defects: hair shells and some face
surface constructions are intentionally open. Non-manifold edges and empty or
invalid meshes remain hard failures. The authoring pass must explicitly tag
an open-surface role; the validator never guesses that a damaged mesh is OK.
"""

import bpy

MESH_QUALITY_VERSION = "3N.53"
ALLOWED_OPEN_SURFACE_ROLES = {"face", "hair"}


def _cassidy_mesh_objects():
    return [o for o in bpy.data.objects if o.type == "MESH" and
            (o.get("gopal_character") == "Cassidy" or o.name.lower().startswith("cassidy"))]


def _has_modifier(obj, modifier_type):
    return any(mod.type == modifier_type for mod in obj.modifiers)


def _object_report(obj):
    mesh = obj.data
    vertices = len(mesh.vertices)
    polygons = len(mesh.polygons)
    issues = []
    if vertices == 0 or polygons == 0:
        issues.append("mesh has no authored geometry")
    if obj.hide_render:
        issues.append("mesh is disabled for render")
    if all(abs(v) <= 1e-12 for v in obj.scale):
        issues.append("mesh has invalid zero scale")

    edge_use = {}
    for poly in mesh.polygons:
        for edge_index in poly.edge_keys:
            key = tuple(sorted(edge_index))
            edge_use[key] = edge_use.get(key, 0) + 1
    boundary_edges = sum(1 for count in edge_use.values() if count == 1)
    non_manifold = sum(1 for count in edge_use.values() if count > 2)
    role = str(obj.get("gopal_geometry_role", "")).lower()
    open_surface = bool(obj.get("gopal_open_surface"))
    intentional_boundary = boundary_edges > 0 and open_surface and role in ALLOWED_OPEN_SURFACE_ROLES
    topology_issue = non_manifold > 0 or (boundary_edges > 0 and not intentional_boundary)
    if non_manifold:
        issues.append(f"non-manifold edges: {non_manifold}")
    if boundary_edges and not intentional_boundary:
        issues.append(f"unexpected boundary edges: {boundary_edges}")

    return {
        "name": obj.name, "vertices": vertices, "polygons": polygons,
        "modifiers": [mod.type for mod in obj.modifiers],
        "has_subdivision": _has_modifier(obj, "SUBSURF"),
        "boundary_edges": boundary_edges, "non_manifold_edges": non_manifold,
        "intentional_open_surface": intentional_boundary,
        "issues": issues,
        "topology_issue": topology_issue,
    }


def validate_authored_meshes() -> dict:
    objects = _cassidy_mesh_objects()
    reports = [_object_report(obj) for obj in objects]
    geometry_issues = [r["name"] for r in reports if r["issues"]]
    topology_issues = [r["name"] for r in reports if r["topology_issue"]]
    return {
        "version": MESH_QUALITY_VERSION,
        "valid": bool(objects) and not geometry_issues and not topology_issues,
        "mesh_count": len(objects), "empty_scene": not objects,
        "geometry_issues": geometry_issues, "topology_issues": topology_issues,
        "objects": reports,
        "policy": "explicit-open-surface-only-for-face-and-hair",
        "note": "Structural quality only; artistic quality requires visual review.",
    }
