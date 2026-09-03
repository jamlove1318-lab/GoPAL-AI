"""Facial, eyelid, eye-gaze and expression authoring helpers.

This module describes and validates authored controls. It intentionally does
not synthesize a face, eyes, or expressions from primitives.
"""

import bpy

FACE_AUTHORING_VERSION = "3N.20"
EXPRESSION_CONTROLS = (
    "neutral", "happy", "curious", "surprised", "thoughtful", "excited", "concerned", "playful",
)
GAZE_CONTROLS = ("gaze_x", "gaze_y", "blink_l", "blink_r", "squint_l", "squint_r")
REQUIRED_FACE_NODES = (
    "Cassidy_Face", "Cassidy_Eye_L", "Cassidy_Eye_R", "Cassidy_Eyelid_L", "Cassidy_Eyelid_R",
)


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
    mesh_obj["gopal_expression_controls"] = list(EXPRESSION_CONTROLS)
    return {"valid": not missing, "missing": missing, "found": sorted(required & names)}


def ensure_gaze_contract(armature=None):
    declared = set()
    if armature is not None:
        declared.update(armature.get("gopal_gaze_controls", []))
        if armature.pose:
            declared.update(pbone.name for pbone in armature.pose.bones if pbone.name in GAZE_CONTROLS)
    scene_declared = bpy.context.scene.get("gopal_cassidy_gaze_controls", [])
    declared.update(scene_declared)
    missing = sorted(set(GAZE_CONTROLS) - declared)
    bpy.context.scene["gopal_cassidy_gaze_controls"] = list(GAZE_CONTROLS)
    return {"valid": not missing, "missing": missing, "found": sorted(set(GAZE_CONTROLS) & declared)}


def prepare_face_authoring(face_mesh=None, armature=None):
    node_report = validate_face_nodes()
    expression_report = ensure_expression_contract(face_mesh) if face_mesh else {"valid": False, "missing": list(EXPRESSION_CONTROLS), "found": []}
    gaze_report = ensure_gaze_contract(armature)
    return {
        "version": FACE_AUTHORING_VERSION,
        "nodes": node_report,
        "expressions": expression_report,
        "gaze": gaze_report,
        "policy": "authored-only",
        "note": "No facial geometry or expression shapes are synthesized by this helper.",
    }
