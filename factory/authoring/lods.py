"""Cassidy mobile LOD authoring.

Creates real LOD0/LOD1/LOD2 mesh copies. LOD levels are geometry, not just
metadata. Identity-critical face/eyes/hair objects are preserved at every LOD.
"""
from __future__ import annotations
import bpy

BUDGETS = {"LOD0": 25000, "LOD1": 12000, "LOD2": 5000}
IDENTITY = {"Cassidy_Face", "Cassidy_Eye_L", "Cassidy_Eye_R", "Cassidy_Hair_Root"}


def _collection(name):
    coll = bpy.data.collections.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(coll)
    return coll


def _triangle_count(obj):
    mesh = obj.data
    return sum(len(p.vertices) - 2 for p in mesh.polygons)


def _make_copy(source, level, collection):
    name = f"{level}_{source.name}"
    old = bpy.data.objects.get(name)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    dup = source.copy()
    dup.data = source.data.copy()
    dup.name = name
    collection.objects.link(dup)
    dup["gopal_lod_level"] = level
    dup["gopal_source"] = source.name
    if level != "LOD0" and source.name not in IDENTITY:
        mod = dup.modifiers.new("LOD_Decimate", "DECIMATE")
        mod.ratio = 0.55 if level == "LOD1" else 0.28
        bpy.context.view_layer.objects.active = dup
        dup.select_set(True)
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        finally:
            dup.select_set(False)
    dup.hide_viewport = level != "LOD0"
    dup.hide_render = level != "LOD0"
    return dup


def setup_lods(root_obj):
    """Generate and validate actual LOD geometry for Cassidy."""
    if root_obj is None:
        raise RuntimeError("Cassidy_Root missing for LOD authoring")
    source_meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith("Cassidy_") and not o.name.startswith(("LOD0_", "LOD1_", "LOD2_"))]
    if not source_meshes:
        raise RuntimeError("No Cassidy source meshes available for LOD generation")
    for level in BUDGETS:
        coll = _collection(f"CASSIDY_{level}")
        for source in source_meshes:
            _make_copy(source, level, coll)
    root_obj["lod_levels"] = 3
    root_obj["lod0_budget"] = BUDGETS["LOD0"]
    root_obj["lod1_budget"] = BUDGETS["LOD1"]
    root_obj["lod2_budget"] = BUDGETS["LOD2"]
    for level, budget in BUDGETS.items():
        objs = [o for o in bpy.data.objects if o.name.startswith(level + "_")]
        triangles = sum(_triangle_count(o) for o in objs)
        if triangles > budget:
            raise RuntimeError(f"{level} triangle budget exceeded: {triangles}>{budget}")
        root_obj[f"{level.lower()}_triangles"] = triangles
    print("[GoPAL-FACTORY] Real LOD0/LOD1/LOD2 geometry generated", flush=True)
    return True
