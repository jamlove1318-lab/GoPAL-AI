"""Full-body rig and deformation-readiness helpers for authored Cassidy assets.

The module never creates a skeleton automatically. It validates and annotates
an artist-authored armature so the existing Cassidy rig contract remains the
single runtime source of truth.
"""

import bpy

RIG_AUTHORING_VERSION = "3N.23"
REQUIRED_BODY_BONES = (
    "Cassidy_Root", "Cassidy_Spine", "Cassidy_Chest", "Cassidy_Neck", "Cassidy_Head",
    "Cassidy_UpperArm_L", "Cassidy_Forearm_L", "Cassidy_Hand_L",
    "Cassidy_UpperArm_R", "Cassidy_Forearm_R", "Cassidy_Hand_R",
    "Cassidy_Thigh_L", "Cassidy_Shin_L", "Cassidy_Foot_L",
    "Cassidy_Thigh_R", "Cassidy_Shin_R", "Cassidy_Foot_R",
)


def find_armatures():
    return [o for o in bpy.data.objects if o.type == "ARMATURE" and o.get("gopal_character") == "Cassidy"]


def bone_names(armature):
    return {bone.name for bone in armature.data.bones}


def validate_body_skeleton(armature=None):
    if armature is None:
        armatures = find_armatures()
        armature = armatures[0] if armatures else None
    if armature is None:
        return {"valid": False, "armature": None, "missing": list(REQUIRED_BODY_BONES), "found": []}
    names = bone_names(armature)
    missing = sorted(set(REQUIRED_BODY_BONES) - names)
    return {"valid": not missing, "armature": armature.name, "missing": missing, "found": sorted(names & set(REQUIRED_BODY_BONES))}


def validate_deformation_bindings(armature=None):
    if armature is None:
        report = validate_body_skeleton()
        armature = bpy.data.objects.get(report.get("armature")) if report.get("armature") else None
    meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.get("gopal_character") == "Cassidy"]
    issues = []
    reports = []
    if armature is None:
        return {"valid": False, "meshes": [], "issues": ["missing_armature"]}
    names = bone_names(armature)
    for obj in meshes:
        groups = {g.name for g in obj.vertex_groups}
        missing = sorted(groups - names)
        empty = []
        for group in obj.vertex_groups:
            if not any(group.index in [v_group.group for v_group in vertex.groups] for vertex in obj.data.vertices):
                empty.append(group.name)
        reports.append({"name": obj.name, "vertex_groups": len(groups), "unknown_bone_groups": missing, "empty_groups": empty})
        if missing or empty:
            issues.append(obj.name)
    return {"valid": bool(meshes) and not issues, "meshes": reports, "issues": issues}


def mark_rig_as_authored(armature):
    if armature is None or armature.type != "ARMATURE":
        raise ValueError("mark_rig_as_authored requires an armature")
    armature["gopal_character"] = "Cassidy"
    armature["gopal_rig_authoring_version"] = RIG_AUTHORING_VERSION
    armature["gopal_required_body_bones"] = list(REQUIRED_BODY_BONES)
    return armature


def validate_rig_authoring(armature=None):
    skeleton = validate_body_skeleton(armature)
    deformation = validate_deformation_bindings(armature)
    return {
        "version": RIG_AUTHORING_VERSION,
        "valid": skeleton["valid"] and deformation["valid"],
        "skeleton": skeleton,
        "deformation": deformation,
        "policy": "authored-only",
    }
