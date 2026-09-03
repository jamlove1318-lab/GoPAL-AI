"""Full-body rig and deformation-readiness validation for authored Cassidy assets.

This module never creates or binds a rig automatically. It validates that an
artist-authored armature is actually connected to Cassidy geometry.
"""

import bpy

RIG_AUTHORING_VERSION = "3N.29"
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
    return {"valid": not missing, "armature": armature.name, "missing": missing,
            "found": sorted(names & set(REQUIRED_BODY_BONES))}


def _bound_armatures(obj):
    return [mod.object for mod in obj.modifiers if mod.type == "ARMATURE" and mod.object is not None]


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
    required = set(REQUIRED_BODY_BONES)
    for obj in meshes:
        groups = {g.name for g in obj.vertex_groups}
        unknown = sorted(groups - names)
        empty = []
        for group in obj.vertex_groups:
            has_weight = any(any(vg.group == group.index and vg.weight > 0.0 for vg in vertex.groups)
                             for vertex in obj.data.vertices)
            if not has_weight:
                empty.append(group.name)
        bound = _bound_armatures(obj)
        bound_to_expected = any(candidate == armature for candidate in bound)
        missing_required_groups = sorted(required - groups)
        report = {
            "name": obj.name,
            "vertex_groups": len(groups),
            "unknown_bone_groups": unknown,
            "empty_groups": empty,
            "armature_modifiers": [candidate.name for candidate in bound],
            "bound_to_expected_armature": bound_to_expected,
            "missing_required_body_groups": missing_required_groups,
        }
        reports.append(report)
        if unknown or empty or not bound_to_expected or missing_required_groups:
            issues.append(obj.name)

    return {"valid": bool(meshes) and not issues, "meshes": reports, "issues": issues,
            "expected_armature": armature.name}


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
    return {"version": RIG_AUTHORING_VERSION, "valid": skeleton["valid"] and deformation["valid"],
            "skeleton": skeleton, "deformation": deformation, "policy": "authored-only"}
