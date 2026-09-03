"""Non-destructive structural quality checks for authored Cassidy geometry."""

import bpy

MESH_QUALITY_VERSION = "3N.29"


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
    # Avoid context-dependent visible_get(): this validator also runs headless.
    if obj.hide_render:
        issues.append("mesh is disabled for render")
    if any(abs(v) > 1e-12 for v in obj.scale) is False:
        issues.append("mesh has invalid zero scale")

    edge_use = {}
    for poly in mesh.polygons:
        for edge_index in poly.edge_keys:
            key = tuple(sorted(edge_index))
            edge_use[key] = edge_use.get(key, 0) + 1
    boundary_edges = sum(1 for count in edge_use.values() if count == 1)
    non_manifold = sum(1 for count in edge_use.values() if count > 2)

    return {
        "name": obj.name, "vertices": vertices, "polygons": polygons,
        "modifiers": [mod.type for mod in obj.modifiers],
        "has_subdivision": _has_modifier(obj, "SUBSURF"),
        "boundary_edges": boundary_edges, "non_manifold_edges": non_manifold,
        "issues": issues,
    }


def validate_authored_meshes() -> dict:
    objects = _cassidy_mesh_objects()
    reports = [_object_report(obj) for obj in objects]
    geometry_issues = [r["name"] for r in reports if r["issues"]]
    topology_issues = [r["name"] for r in reports if r["boundary_edges"] or r["non_manifold_edges"]]
    return {
        "version": MESH_QUALITY_VERSION,
        "valid": bool(objects) and not geometry_issues and not topology_issues,
        "mesh_count": len(objects), "empty_scene": not objects,
        "geometry_issues": geometry_issues, "topology_issues": topology_issues,
        "objects": reports,
        "note": "Structural quality only; artistic quality requires visual review.",
    }
