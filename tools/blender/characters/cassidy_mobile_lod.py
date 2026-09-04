"""Reusable mobile LOD and asset-budget validation for Cassidy.

The mobile material budget is measured as unique canonical material roles used
by a complete LOD, not the sum of repeated one-slot assignments across every
mesh. Reusing the same material on many meshes is the intended mobile pattern.
Geometry remains authored and identity preservation remains independently
validated.
"""

import bpy

from .cassidy_lod import REQUIRED_LODS, IDENTITY_CRITICAL, find_lod_objects

MOBILE_LOD_VERSION = "3N.55"
VERTEX_BUDGETS = {"LOD0": 30000, "LOD1": 18000, "LOD2": 9000}
MATERIAL_SLOT_BUDGET = 7
CANONICAL_MATERIAL_PREFIX = "Cassidy_MAT_"


def _objects_for_lod(lod):
    names = set(find_lod_objects().get(lod, []))
    return [bpy.data.objects[n] for n in names if n in bpy.data.objects and bpy.data.objects[n].type == "MESH"]


def _mesh_stats(objects):
    vertices = sum(len(o.data.vertices) for o in objects)
    polygons = sum(len(o.data.polygons) for o in objects)
    unique_materials = set()
    for obj in objects:
        for material in obj.data.materials:
            if material is not None:
                role = material.get("gopal_material_slot")
                unique_materials.add(str(role) if role else material.name)
    return {"mesh_count": len(objects), "vertices": vertices, "polygons": polygons,
            "material_slots": len(unique_materials), "unique_material_roles": sorted(unique_materials)}


def validate_lod_budgets():
    records = []
    issues = []
    for lod in REQUIRED_LODS:
        objects = _objects_for_lod(lod)
        stats = _mesh_stats(objects)
        limit = VERTEX_BUDGETS[lod]
        vertex_ok = bool(objects) and stats["vertices"] <= limit
        material_ok = bool(objects) and stats["material_slots"] <= MATERIAL_SLOT_BUDGET
        if not vertex_ok or not material_ok:
            issues.append(lod)
        records.append({"lod": lod, **stats, "vertex_budget": limit, "vertex_ok": vertex_ok, "material_ok": material_ok})
    return {"valid": not issues, "issues": issues, "records": records}


def validate_identity_preservation():
    missing = {}
    for lod in REQUIRED_LODS:
        objects = _objects_for_lod(lod)
        names = {o.name for o in objects}
        missing[lod] = [
            name for name in IDENTITY_CRITICAL
            if name not in names and not any(o.get("gopal_identity_part") == name for o in objects)
        ]
    issues = [lod for lod, values in missing.items() if values]
    return {"valid": not issues, "missing": missing}


def validate_lod_hierarchy():
    records = []
    issues = []
    previous_vertices = None
    for lod in REQUIRED_LODS:
        stats = _mesh_stats(_objects_for_lod(lod))
        vertices = stats["vertices"]
        hierarchy_ok = previous_vertices is None or (vertices > 0 and vertices <= previous_vertices)
        if not hierarchy_ok:
            issues.append(lod)
        records.append({"lod": lod, "vertices": vertices, "hierarchy_ok": hierarchy_ok})
        previous_vertices = vertices
    return {"valid": not issues, "issues": issues, "records": records}


def validate_mobile_lod():
    budgets = validate_lod_budgets()
    identity = validate_identity_preservation()
    hierarchy = validate_lod_hierarchy()
    return {
        "version": MOBILE_LOD_VERSION,
        "valid": budgets["valid"] and identity["valid"] and hierarchy["valid"],
        "budgets": budgets,
        "identity": identity,
        "hierarchy": hierarchy,
        "required_lods": list(REQUIRED_LODS),
        "material_slot_budget": MATERIAL_SLOT_BUDGET,
        "material_budget_policy": "unique-canonical-material-roles-per-lod",
        "policy": "authored-only-no-auto-decimation",
    }
