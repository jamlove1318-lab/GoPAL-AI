"""Authored facial rig validation for Cassidy.

This layer connects existing face shape-key and gaze contracts without
creating facial geometry or automatically inventing expression shapes.
"""

import bpy

FACIAL_RIG_VERSION = "3N.24"
EXPRESSIONS = (
    "neutral", "happy", "curious", "surprised", "thoughtful", "excited", "concerned", "playful",
)
GAZE = ("gaze_x", "gaze_y", "blink_l", "blink_r", "squint_l", "squint_r")
FACE_NODE = "Cassidy_Face"
EYE_NODES = ("Cassidy_Eye_L", "Cassidy_Eye_R")
EYELID_NODES = ("Cassidy_Eyelid_L", "Cassidy_Eyelid_R")


def find_face_mesh():
    obj = bpy.data.objects.get(FACE_NODE)
    if obj and obj.type == "MESH":
        return obj
    candidates = [o for o in bpy.data.objects if o.type == "MESH" and o.get("gopal_geometry_role") in {"face", "head"}]
    return candidates[0] if len(candidates) == 1 else None


def find_rig():
    named = bpy.data.objects.get("Cassidy_Rig")
    if named and named.type == "ARMATURE":
        return named
    rigs = [o for o in bpy.data.objects if o.type == "ARMATURE" and o.get("gopal_character") == "Cassidy"]
    return rigs[0] if len(rigs) == 1 else None


def validate_face_nodes():
    required = (FACE_NODE,) + EYE_NODES + EYELID_NODES
    missing = [name for name in required if bpy.data.objects.get(name) is None]
    wrong_type = [name for name in required if (bpy.data.objects.get(name) is not None and bpy.data.objects[name].type not in {"MESH", "EMPTY"})]
    return {"valid": not missing and not wrong_type, "missing": missing, "wrong_type": wrong_type}


def validate_expression_shapes(face_mesh=None):
    face_mesh = face_mesh or find_face_mesh()
    if face_mesh is None:
        return {"valid": False, "missing": [f"expression_{x}" for x in EXPRESSIONS], "found": []}
    keys = face_mesh.data.shape_keys
    names = set(keys.key_blocks.keys()) if keys else set()
    required = {f"expression_{x}" for x in EXPRESSIONS}
    return {"valid": not (required - names), "missing": sorted(required - names), "found": sorted(required & names)}


def validate_gaze_controls(rig=None):
    rig = rig or find_rig()
    declared = set(bpy.context.scene.get("gopal_cassidy_gaze_controls", []))
    if rig:
        declared.update(rig.get("gopal_gaze_controls", []))
        if rig.pose:
            declared.update(b.name for b in rig.pose.bones if b.name in GAZE)
    missing = sorted(set(GAZE) - declared)
    return {"valid": not missing, "missing": missing, "found": sorted(set(GAZE) & declared)}


def validate_driver_bindings(face_mesh=None):
    face_mesh = face_mesh or find_face_mesh()
    if face_mesh is None:
        return {"valid": False, "driver_count": 0, "expression_drivers": [], "note": "No authored face mesh"}
    keys = face_mesh.data.shape_keys
    if not keys:
        return {"valid": False, "driver_count": 0, "expression_drivers": [], "note": "No authored shape-key datablock"}
    names = {f"expression_{x}" for x in EXPRESSIONS}
    driven = []
    for key in keys.key_blocks:
        if key.name in names and key.driver_add("value") if False else False:
            driven.append(key.name)
    # Driver APIs are intentionally not mutated here; inspect existing drivers only.
    driver_names = []
    if keys.animation_data and keys.animation_data.drivers:
        for fc in keys.animation_data.drivers:
            target = getattr(fc, "data_path", "")
            if "key_blocks" in target:
                driver_names.append(target)
    return {"valid": True, "driver_count": len(driver_names), "expression_drivers": driver_names}


def mark_facial_rig(armature):
    if armature is None or armature.type != "ARMATURE":
        raise ValueError("mark_facial_rig requires an authored armature")
    armature["gopal_character"] = "Cassidy"
    armature["gopal_facial_rig_version"] = FACIAL_RIG_VERSION
    armature["gopal_expression_controls"] = list(EXPRESSIONS)
    armature["gopal_gaze_controls"] = list(GAZE)
    return armature


def validate_facial_rig():
    nodes = validate_face_nodes()
    expressions = validate_expression_shapes()
    gaze = validate_gaze_controls()
    drivers = validate_driver_bindings()
    return {
        "version": FACIAL_RIG_VERSION,
        "valid": nodes["valid"] and expressions["valid"] and gaze["valid"],
        "nodes": nodes,
        "expressions": expressions,
        "gaze": gaze,
        "drivers": drivers,
        "policy": "authored-only",
        "note": "Facial geometry, expression shapes, and driver design remain artist-authored.",
    }
