"""Reusable mobile LOD and asset-budget validation for Cassidy.

This module never decimates or mutates authored geometry. It measures the
three authored LOD tiers and verifies identity-critical components remain
present at every tier.
"""

import bpy

from .cassidy_lod import REQUIRED_LODS, IDENTITY_CRITICAL, find_lod_objects

MOBILE_LOD_VERSION = "3N.26"
# Conservative starting budgets. They are gates, not automatic decimation targets.
VERTEX_BUDGETS = {"LOD0": 30000, "LOD1": 18000, "LOD2": 9000}
MATERIAL_SLOT_BUDGET = 7


def _objects_for_lod(lod):
    names = set(find_lod_objects().get(lod, []))
    return [bpy.data.objects[n] for n in names if n in bpy.data.objects and bpy.data.objects[n].type == "MESH"]


def _mesh_stats(objects):
    vertices = sum(len(o.data.vertices) for o in objects)
    polygons = sum(len(o.data.polygons) for o in objects)
    materials = sum(len(o.data.materials) for o in objects)
    return {"mesh_count": len(objects), "vertices": vertices, "polygons": polygons, "material_slots": materials}


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
        # Identity-critical parts may be represented as separate meshes or as
        # semantic metadata on a combined LOD mesh.
        missing[lod] = [name for name in IDENTITY_CRITICAL if name not in names and not any(o.get("gopal_identity_part") == name for o in objects)]
    issues = [lod for lod, values in missing.items() if values]
    return {"valid": not issues, "missing": missing}


def validate_mobile_lod():
    budgets = validate_lod_budgets()
    identity = validate_identity_preservation()
    return {
        "version": MOBILE_LOD_VERSION,
        "valid": budgets["valid"] and identity["valid"],
        "budgets": budgets,
        "identity": identity,
        "required_lods": list(REQUIRED_LODS),
        "material_slot_budget": MATERIAL_SLOT_BUDGET,
        "policy": "authored-only-no-auto-decimation",
    }
