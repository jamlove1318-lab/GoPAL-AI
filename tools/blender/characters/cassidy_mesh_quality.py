"""Non-destructive quality checks for authored Cassidy geometry.

These checks never replace or reshape artist-authored geometry. They provide
objective structural feedback before rigging/export and intentionally avoid
claiming aesthetic approval.
"""

import bpy

MESH_QUALITY_VERSION = "3N.17"
REQUIRED_BODY_MESH_HINTS = ("body", "head", "face", "hair", "outfit")


def _cassidy_mesh_objects():
    result = []
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        character = obj.get("gopal_character")
        if character == "Cassidy" or obj.name.lower().startswith("cassidy"):
            result.append(obj)
    return result


def _has_modifier(obj, modifier_type):
    return any(mod.type == modifier_type for mod in obj.modifiers)


def _object_report(obj):
    mesh = obj.data
    vertices = len(mesh.vertices)
    polygons = len(mesh.polygons)
    issues = []

    if vertices == 0 or polygons == 0:
        issues.append("mesh has no authored geometry")
    if not obj.visible_get():
        issues.append("mesh is hidden in the active scene")
    if obj.scale.length == 0:
        issues.append("mesh has invalid zero scale")

    non_manifold = 0
    boundary_edges = 0
    try:
        mesh.calc_loop_triangles()
        edge_use = {}
        for poly in mesh.polygons:
            for edge_index in poly.edge_keys:
                key = tuple(sorted(edge_index))
                edge_use[key] = edge_use.get(key, 0) + 1
        boundary_edges = sum(1 for count in edge_use.values() if count == 1)
        non_manifold = sum(1 for count in edge_use.values() if count > 2)
    except Exception as exc:
        issues.append(f"topology inspection failed: {exc}")

    return {
        "name": obj.name,
        "vertices": vertices,
        "polygons": polygons,
        "modifiers": [mod.type for mod in obj.modifiers],
        "has_subdivision": _has_modifier(obj, "SUBSURF"),
        "boundary_edges": boundary_edges,
        "non_manifold_edges": non_manifold,
        "issues": issues,
    }


def validate_authored_meshes() -> dict:
    objects = _cassidy_mesh_objects()
    reports = [_object_report(obj) for obj in objects]
    empty = not objects
    topology_issues = [
        report["name"]
        for report in reports
        if report["boundary_edges"] or report["non_manifold_edges"]
    ]
    geometry_issues = [report["name"] for report in reports if report["issues"]]

    return {
        "version": MESH_QUALITY_VERSION,
        "valid": bool(objects) and not geometry_issues and not topology_issues,
        "mesh_count": len(objects),
        "empty_scene": empty,
        "geometry_issues": geometry_issues,
        "topology_issues": topology_issues,
        "objects": reports,
        "note": "Structural quality only; artistic quality requires visual review.",
    }
