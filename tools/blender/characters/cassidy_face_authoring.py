"""Facial, eyelid, eye-gaze and expression authoring helpers."""

import bpy

FACE_AUTHORING_VERSION = "3N.20"
EXPRESSION_CONTROLS = ("neutral", "happy", "curious", "surprised", "thoughtful", "excited", "concerned", "playful")
GAZE_CONTROLS = ("gaze_x", "gaze_y", "blink_l", "blink_r", "squint_l", "squint_r")
REQUIRED_FACE_NODES = ("Cassidy_Face", "Cassidy_Eye_L", "Cassidy_Eye_R", "Cassidy_Eyelid_L", "Cassidy_Eyelid_R")


def _find(name):
    return bpy.data.objects.get(name)


def find_face_meshes():
    result = []
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        role = str(obj.get("gopal_geometry_role", "")).lower()
        name = obj.name.lower()
        if role in {"face", "head", "eye", "eyes", "eyelid"} or any(token in name for token in ("face", "head", "eye", "eyelid")):
            result.append(obj)
    return result


def validate_face_nodes():
    missing = [name for name in REQUIRED_FACE_NODES if _find(name) is None]
    return {"valid": not missing, "missing": missing, "required": list(REQUIRED_FACE_NODES)}


def mark_face_mesh(obj, role):
    if obj is None or obj.type != "MESH":
        raise ValueError("mark_face_mesh requires an authored mesh")
    obj["gopal_character"] = "Cassidy"
    obj["gopal_geometry_role"] = role
    obj["gopal_face_authoring_version"] = FACE_AUTHORING_VERSION
    return obj


def ensure_expression_contract(mesh_obj):
    if mesh_obj is None or mesh_obj.type != "MESH":
        raise ValueError("Expression contract requires the authored face mesh")
    shape_keys = mesh_obj.data.shape_keys
    names = set(shape_keys.key_blocks.keys()) if shape_keys else set()
    required = {f"expression_{name}" for name in EXPRESSION_CONTROLS}
    missing = sorted(required - names)
    return {"valid": not missing, "missing": missing, "found": sorted(required & names)}


def _actual_gaze_controls(armature):
    if armature is None or armature.type != "ARMATURE":
        return set()
    controls = set(armature.get("gopal_gaze_controls", []))
    if armature.pose:
        controls.update(pbone.name for pbone in armature.pose.bones if pbone.name in GAZE_CONTROLS)
    return controls & set(GAZE_CONTROLS)


def ensure_gaze_contract(armature=None):
    actual = _actual_gaze_controls(armature)
    missing = sorted(set(GAZE_CONTROLS) - actual)
    bpy.context.scene["gopal_cassidy_gaze_controls"] = list(GAZE_CONTROLS)
    return {"valid": not missing, "missing": missing, "found": sorted(actual)}


def prepare_face_authoring(face_mesh=None, armature=None):
    return {
        "version": FACE_AUTHORING_VERSION,
        "nodes": validate_face_nodes(),
        "expressions": ensure_expression_contract(face_mesh) if face_mesh else {"valid": False, "missing": [f"expression_{x}" for x in EXPRESSION_CONTROLS], "found": []},
        "gaze": ensure_gaze_contract(armature),
        "policy": "authored-only",
        "note": "No facial geometry or expression shapes are synthesized by this helper.",
    }
