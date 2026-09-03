"""Reusable Cassidy rig, facial, and gaze authoring contract.

The module creates controls only when an authored armature is available. It
never creates a fake humanoid rig or silently claims facial animation support.
"""

import bpy


BODY_BONES = (
    "Cassidy_Root", "Cassidy_Spine", "Cassidy_Chest", "Cassidy_Neck",
    "Cassidy_Head", "Cassidy_UpperArm_L", "Cassidy_Forearm_L", "Cassidy_Hand_L",
    "Cassidy_UpperArm_R", "Cassidy_Forearm_R", "Cassidy_Hand_R",
    "Cassidy_Thigh_L", "Cassidy_Shin_L", "Cassidy_Foot_L",
    "Cassidy_Thigh_R", "Cassidy_Shin_R", "Cassidy_Foot_R",
)

FACIAL_CONTROLS = (
    "expression_neutral", "expression_happy", "expression_curious",
    "expression_surprised", "expression_thoughtful", "expression_excited",
    "expression_concerned", "expression_playful",
)

GAZE_CONTROLS = (
    "gaze_x", "gaze_y", "blink_l", "blink_r", "squint_l", "squint_r",
)


def find_cassidy_armature():
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE" and (
            obj.name == "Cassidy_Rig" or obj.get("gopal_character") == "Cassidy"
        ):
            return obj
    return None


def collect_bone_names(armature=None):
    armature = armature or find_cassidy_armature()
    if armature is None or armature.data is None:
        return set()
    return {bone.name for bone in armature.data.bones}


def validate_rig_contract(armature=None) -> dict:
    armature = armature or find_cassidy_armature()
    bones = collect_bone_names(armature)
    missing_body_bones = sorted(set(BODY_BONES) - bones)

    control_names = set()
    if armature is not None:
        control_names.update(
            name for name in armature.pose.bones.keys()
            if name.startswith("Cassidy_")
        )

    missing_gaze_controls = sorted(set(GAZE_CONTROLS) - control_names)
    return {
        "armature_found": armature is not None,
        "armature": armature.name if armature else None,
        "missing_body_bones": missing_body_bones,
        "missing_gaze_controls": missing_gaze_controls,
        "body_rig_valid": not missing_body_bones,
        "gaze_controls_valid": not missing_gaze_controls,
    }


def mark_rig_as_authored(armature) -> None:
    if armature is None or armature.type != "ARMATURE":
        raise ValueError("A real Cassidy armature is required")
    armature["gopal_character"] = "Cassidy"
    armature["gopal_rig_version"] = "3N.6"
    armature["gopal_facial_controls"] = FACIAL_CONTROLS
    armature["gopal_gaze_controls"] = GAZE_CONTROLS
