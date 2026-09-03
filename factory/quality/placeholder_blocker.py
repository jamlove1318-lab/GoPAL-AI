"""Hard production-quality checks for Cassidy.

The legacy factory validators are structural. This module adds the missing
anti-false-positive checks so a primitive scaffold cannot be certified.
"""
from __future__ import annotations
from pathlib import Path
from typing import Any, Dict
import json

REQUIRED_NODES = {"Cassidy_Root","Cassidy_Body","Cassidy_Head","Cassidy_Face","Cassidy_Eye_L","Cassidy_Eye_R","Cassidy_Eyelid_L","Cassidy_Eyelid_R","Cassidy_Hand_L","Cassidy_Hand_R","Cassidy_Charm","Cassidy_Hair_Root"}
REQUIRED_ANIMATIONS = {"idle","walk","run","turn","sit","talk","gesture","point","celebrate","think","react"}
REQUIRED_EXPRESSIONS = {"expression_neutral","expression_happy","expression_curious","expression_surprised","expression_thoughtful","expression_excited","expression_concerned","expression_playful"}


def true_triangle_count(mesh) -> int:
    import bmesh
    bm = bmesh.new()
    try:
        bm.from_mesh(mesh)
        bmesh.ops.triangulate(bm, faces=list(bm.faces))
        return len(bm.faces)
    finally:
        bm.free()


def inspect_scene() -> Dict[str, Any]:
    import bpy
    errors = []
    meshes = []
    total_triangles = 0
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.data:
            continue
        tri = true_triangle_count(obj.data)
        total_triangles += tri
        meshes.append({"name": obj.name, "vertices": len(obj.data.vertices), "polygons": len(obj.data.polygons), "triangles": tri, "materials": [s.material.name for s in obj.material_slots if s.material], "armature_bound": any(m.type == "ARMATURE" and m.object for m in obj.modifiers), "vertex_groups": len(obj.vertex_groups)})
    nodes = {o.name for o in bpy.data.objects}
    actions = {a.name for a in bpy.data.actions}
    face = bpy.data.objects.get("Cassidy_Face")
    expressions = {k.name for k in face.data.shape_keys.key_blocks if k.name != "Basis"} if face and face.data.shape_keys else set()
    arm = bpy.data.objects.get("Cassidy_Armature")
    bones = {b.name for b in arm.data.bones} if arm else set()
    gaze = []
    for side in ("L", "R"):
        eye = bpy.data.objects.get(f"Cassidy_Eye_{side}")
        if eye:
            gaze.extend(c.type for c in eye.constraints)
    if total_triangles < 2500:
        errors.append(f"true triangle count {total_triangles} is below the 2500 production floor")
    missing_nodes = REQUIRED_NODES - nodes
    if missing_nodes: errors.append(f"missing nodes: {sorted(missing_nodes)}")
    missing_actions = REQUIRED_ANIMATIONS - actions
    if missing_actions: errors.append(f"missing animations: {sorted(missing_actions)}")
    missing_expr = REQUIRED_EXPRESSIONS - expressions
    if missing_expr: errors.append(f"missing expressions: {sorted(missing_expr)}")
    if not arm: errors.append("Cassidy_Armature missing")
    if arm:
        required = {"Hips","Spine","Chest","Neck","Head","UpperArm.L","LowerArm.L","Hand.L","UpperArm.R","LowerArm.R","Hand.R","UpperLeg.L","LowerLeg.L","Foot.L","UpperLeg.R","LowerLeg.R","Foot.R"}
        missing_bones = required - bones
        if missing_bones: errors.append(f"missing deform bones: {sorted(missing_bones)}")
    if "TRACK_TO" not in gaze: errors.append("eye gaze TRACK_TO constraints missing")
    unbound = [m["name"] for m in meshes if m["name"].startswith("Cassidy_") and m["name"] not in {"Cassidy_Charm","Cassidy_Hair_Root"} and not m["armature_bound"]]
    if unbound: errors.append(f"deformable meshes not armature-bound: {unbound}")
    return {"valid": not errors, "errors": errors, "total_triangles": total_triangles, "meshes": meshes, "actions": sorted(actions), "expressions": sorted(expressions), "bones": sorted(bones), "gaze_constraints": gaze}


def validate_artifact_manifest(path: Path) -> Dict[str, Any]:
    errors = []
    if not path.is_file(): return {"valid": False, "errors": [f"missing manifest: {path}"]}
    try: data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc: return {"valid": False, "errors": [f"invalid manifest JSON: {exc}"]}
    primary = data.get("primary_asset", {})
    if not primary.get("sha256") or len(primary["sha256"]) != 64: errors.append("invalid primary asset SHA-256")
    if not REQUIRED_ANIMATIONS.issubset(set(data.get("animations", []))): errors.append("package animation contract incomplete")
    if not REQUIRED_EXPRESSIONS.issubset(set(data.get("expressions", []))): errors.append("package expression contract incomplete")
    return {"valid": not errors, "errors": errors}
