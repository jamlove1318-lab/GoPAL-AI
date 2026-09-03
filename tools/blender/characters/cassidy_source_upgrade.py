"""Deterministic technical upgrade pass for a genuine Cassidy source asset.

This module is intentionally conservative: it never invents a new character.
It preserves the imported source, repairs objective Blender/runtime contracts,
and records every operation as source-derived. Subjective visual quality and
likeness remain blocked by the human visual-review gate.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import bpy
from mathutils import Vector

from .cassidy_face_authoring import EXPRESSION_CONTROLS
from .cassidy_hair_charm import mark_charm, mark_hair, mark_secondary_motion
from .cassidy_modeling_tools import AUTHORED_COLLECTION, tag_authored_mesh
from .cassidy_outfit_authoring import MATERIAL_SLOTS, tag_outfit
from .cassidy_rig import BODY_BONES, GAZE_CONTROLS, mark_rig_as_authored

UPGRADE_VERSION = "3N.50-source-derived"

# The legacy source uses the shorter bone names. Canonical names are adopted
# while action F-curves are migrated in the same transaction.
BONE_ALIASES = {
    "Root": "Cassidy_Root",
    "Hips": "Cassidy_Hips",
    "Spine": "Cassidy_Spine",
    "Chest": "Cassidy_Chest",
    "Neck": "Cassidy_Neck",
    "Head": "Cassidy_Head",
    "Shoulder.L": "Cassidy_Shoulder_L",
    "UpperArm.L": "Cassidy_UpperArm_L",
    "LowerArm.L": "Cassidy_Forearm_L",
    "Hand.L": "Cassidy_Hand_L",
    "Shoulder.R": "Cassidy_Shoulder_R",
    "UpperArm.R": "Cassidy_UpperArm_R",
    "LowerArm.R": "Cassidy_Forearm_R",
    "Hand.R": "Cassidy_Hand_R",
    "UpperLeg.L": "Cassidy_Thigh_L",
    "LowerLeg.L": "Cassidy_Shin_L",
    "Foot.L": "Cassidy_Foot_L",
    "UpperLeg.R": "Cassidy_Thigh_R",
    "LowerLeg.R": "Cassidy_Shin_R",
    "Foot.R": "Cassidy_Foot_R",
}

# Subdivision is applied only to non-face source meshes. The face shape-key
# topology is deliberately preserved because its eight authored expressions
# are part of the identity contract.
DETAIL_NAMES = {
    "Cassidy_Body",
    "Cassidy_Head",
    "Cassidy_Eye_L",
    "Cassidy_Eye_R",
    "Cassidy_Eyelid_L",
    "Cassidy_Eyelid_R",
    "Cassidy_Hair_Root",
    "Cassidy_Hand_L",
    "Cassidy_Hand_R",
    "Cassidy_Charm",
}

ROLE_BY_NAME = {
    "Cassidy_Body": "body",
    "Cassidy_Head": "head",
    "Cassidy_Face": "face",
    "Cassidy_Eye_L": "eye",
    "Cassidy_Eye_R": "eye",
    "Cassidy_Eyelid_L": "eyelid",
    "Cassidy_Eyelid_R": "eyelid",
    "Cassidy_Hair_Root": "hair",
    "Cassidy_Hand_L": "hand",
    "Cassidy_Hand_R": "hand",
    "Cassidy_Charm": "accessory",
}


def _ensure_collection(name: str):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def _link_only(obj, collection) -> None:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    if obj.name not in collection.objects:
        collection.objects.link(obj)


def _find_armature():
    named = bpy.data.objects.get("Cassidy_Armature")
    if named and named.type == "ARMATURE":
        return named
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE" and obj.get("gopal_character") == "Cassidy":
            return obj
    return None


def _migrate_action_paths(old: str, new: str) -> int:
    changed = 0
    needle = f'pose.bones["{old}"]'
    replacement = f'pose.bones["{new}"]'
    for action in bpy.data.actions:
        for fcurve in action.fcurves:
            if needle in fcurve.data_path:
                fcurve.data_path = fcurve.data_path.replace(needle, replacement)
                changed += 1
    return changed


def _canonicalize_bones(armature) -> dict[str, Any]:
    if armature is None:
        return {"valid": False, "renamed": [], "curve_paths_migrated": 0}
    renamed = []
    curves = 0
    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    try:
        # Use temporary names first so a collision can never overwrite a bone.
        pending = []
        for old, new in BONE_ALIASES.items():
            bone = armature.data.edit_bones.get(old)
            if bone is not None and old != new:
                temporary = f"__CassidyMigrate__{old}"
                bone.name = temporary
                pending.append((temporary, old, new))
        for temporary, old, new in pending:
            bone = armature.data.edit_bones.get(temporary)
            if bone is not None:
                bone.name = new
                renamed.append({"from": old, "to": new})
    finally:
        bpy.ops.object.mode_set(mode="OBJECT")
    for item in renamed:
        curves += _migrate_action_paths(item["from"], item["to"])
    armature["gopal_bone_alias_migration"] = renamed
    armature["gopal_rig_upgrade_version"] = UPGRADE_VERSION
    return {"valid": True, "renamed": renamed, "curve_paths_migrated": curves}


def _ensure_canonical_bone_groups(armature) -> None:
    if armature is None:
        return
    canonical = {bone.name for bone in armature.data.bones}
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.get("gopal_character") != "Cassidy":
            continue
        # Existing groups survive the bone migration. Create empty groups only
        # for canonical bones required by the runtime contract.
        for bone_name in canonical & set(BODY_BONES):
            if obj.vertex_groups.get(bone_name) is None:
                obj.vertex_groups.new(name=bone_name)


def _point_segment_distance(point: Vector, head: Vector, tail: Vector) -> float:
    segment = tail - head
    length_sq = segment.length_squared
    if length_sq <= 1e-12:
        return (point - head).length
    t = max(0.0, min(1.0, (point - head).dot(segment) / length_sq))
    return (point - (head + segment * t)).length


def _weighted_rebind(obj, armature) -> dict[str, Any]:
    """Rebuild smooth multi-bone weights from the real source skeleton."""
    if obj.type != "MESH" or armature is None:
        return {"name": obj.name, "valid": False, "weights": 0}
    bones = [b for b in armature.data.bones if b.name in BODY_BONES]
    if not bones:
        return {"name": obj.name, "valid": False, "weights": 0}
    inverse = armature.matrix_world.inverted()
    # Preserve object-space coordinates and calculate against the actual bone
    # segments, giving each vertex up to four blended influences.
    groups = {b.name: obj.vertex_groups.get(b.name) or obj.vertex_groups.new(name=b.name) for b in bones}
    for vertex in obj.data.vertices:
        point = inverse @ (obj.matrix_world @ vertex.co)
        ranked = sorted(
            ((_point_segment_distance(point, b.head_local, b.tail_local), b.name) for b in bones),
            key=lambda item: item[0],
        )[:4]
        if not ranked:
            continue
        raw = [1.0 / max(distance, 0.002) for distance, _ in ranked]
        total = sum(raw)
        for (distance, name), weight in zip(ranked, raw):
            groups[name].add([vertex.index], weight / total, "REPLACE")
    modifier = next((m for m in obj.modifiers if m.type == "ARMATURE" and m.object == armature), None)
    if modifier is None:
        modifier = obj.modifiers.new("Cassidy_Armature_Deform", "ARMATURE")
        modifier.object = armature
    obj["gopal_weighting"] = "source-derived-multibone-v1"
    return {"name": obj.name, "valid": True, "weights": len(obj.data.vertices)}


def _prepare_source_meshes() -> list[dict[str, Any]]:
    authored = _ensure_collection(AUTHORED_COLLECTION)
    reports = []
    for obj in list(bpy.data.objects):
        if obj.type != "MESH":
            continue
        if not (obj.get("gopal_character") == "Cassidy" or obj.name in ROLE_BY_NAME):
            continue
        role = ROLE_BY_NAME.get(obj.name, obj.get("gopal_geometry_role", "body"))
        obj["gopal_character"] = "Cassidy"
        obj["gopal_identity_part"] = obj.name
        obj["gopal_source_derived"] = True
        obj["gopal_source_upgrade_version"] = UPGRADE_VERSION
        tag_authored_mesh(obj, role)
        _link_only(obj, authored)
        if obj.name == "Cassidy_Hair_Root":
            mark_hair(obj)
            mark_secondary_motion(obj)
        elif obj.name == "Cassidy_Charm":
            mark_charm(obj)
        elif obj.name == "Cassidy_Body" and len(obj.material_slots) > 0:
            # The legacy source combines body/clothing geometry. Preserve it as
            # a real source-derived base outfit rather than inventing clothing.
            tag_outfit(obj, "base")
            obj["gopal_combined_body_outfit_source"] = True
        reports.append({"name": obj.name, "role": role, "vertices": len(obj.data.vertices), "polygons": len(obj.data.polygons)})
    return reports


def _apply_detail_pass() -> list[str]:
    changed = []
    for name in sorted(DETAIL_NAMES):
        obj = bpy.data.objects.get(name)
        if obj is None or obj.type != "MESH" or obj.get("gopal_detail_applied"):
            continue
        # Face topology and expression keys are intentionally untouched.
        modifier = obj.modifiers.new("Cassidy_SourceDetail", "SUBSURF")
        modifier.subdivision_type = "CATMULL_CLARK"
        modifier.levels = 1
        modifier.render_levels = 1
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        try:
            bpy.ops.object.modifier_apply(modifier=modifier.name)
            obj["gopal_detail_applied"] = True
            obj["gopal_detail_method"] = "source-derived-subdivision-v1"
            changed.append(obj.name)
        finally:
            obj.select_set(False)
    return changed


def _ensure_root_node() -> dict[str, Any]:
    root = bpy.data.objects.get("Cassidy_Root")
    if root is None:
        root = bpy.data.objects.new("Cassidy_Root", None)
        _ensure_collection(AUTHORED_COLLECTION).objects.link(root)
    root.empty_display_type = "PLAIN_AXES"
    root["gopal_character"] = "Cassidy"
    root["gopal_identity_part"] = "Cassidy_Root"
    root["gopal_source_derived"] = True
    return {"name": root.name, "created": root.name == "Cassidy_Root"}


def _ensure_gaze(armature) -> dict[str, Any]:
    target = bpy.data.objects.get("Gaze_Target") or bpy.data.objects.get("Cassidy_Gaze_Target")
    if target is None:
        target = bpy.data.objects.new("Gaze_Target", None)
        _ensure_collection(AUTHORED_COLLECTION).objects.link(target)
    # Put the target in front of the source face using the aggregate face/head
    # bounding box rather than a hard-coded world location.
    face = bpy.data.objects.get("Cassidy_Face") or bpy.data.objects.get("Cassidy_Head")
    if face and face.type == "MESH":
        corners = [face.matrix_world @ Vector(corner) for corner in face.bound_box]
        center = sum(corners, Vector()) / len(corners)
        target.location = center + Vector((0.0, 0.0, 1.0))
    target["gopal_character"] = "Cassidy"
    target["gopal_gaze_target"] = True
    for side in ("L", "R"):
        eye = bpy.data.objects.get(f"Cassidy_Eye_{side}")
        if eye is None:
            continue
        constraint = next((c for c in eye.constraints if c.type == "TRACK_TO" and c.name == "Cassidy_Gaze"), None)
        if constraint is None:
            constraint = eye.constraints.new(type="TRACK_TO")
            constraint.name = "Cassidy_Gaze"
        constraint.target = target
        constraint.track_axis = "TRACK_NEGATIVE_Z"
        constraint.up_axis = "UP_Y"
    if armature:
        mark_rig_as_authored(armature)
        armature["gopal_gaze_target"] = target.name
        armature["gopal_gaze_controls"] = list(GAZE_CONTROLS)
    return {"target": target.name, "track_to_eyes": [side for side in ("L", "R") if bpy.data.objects.get(f"Cassidy_Eye_{side}")]}


def _create_lods() -> dict[str, Any]:
    # Remove only previous generated LODs from this upgrade family.
    for obj in list(bpy.data.objects):
        if obj.type == "MESH" and obj.get("gopal_generated_lod"):
            bpy.data.objects.remove(obj, do_unlink=True)
    authored = _ensure_collection(AUTHORED_COLLECTION)
    sources = [o for o in bpy.data.objects if o.type == "MESH" and o.get("gopal_character") == "Cassidy" and not o.get("gopal_generated_lod") and not o.name.startswith("LOD")]
    records = []
    for source in sources:
        for lod, ratio in (("LOD0", 1.0), ("LOD1", 0.55), ("LOD2", 0.25)):
            copy = source.copy()
            copy.data = source.data.copy()
            copy.name = f"{lod}_{source.name}"
            copy["gopal_character"] = "Cassidy"
            copy["gopal_lod"] = lod
            copy["gopal_generated_lod"] = True
            copy["gopal_identity_part"] = source.name
            copy["gopal_source_derived"] = True
            authored.objects.link(copy)
            if lod != "LOD0":
                modifier = copy.modifiers.new(f"Cassidy_{lod}_Decimate", "DECIMATE")
                modifier.ratio = ratio
                modifier.use_collapse_triangulate = True
                bpy.context.view_layer.objects.active = copy
                copy.select_set(True)
                try:
                    bpy.ops.object.modifier_apply(modifier=modifier.name)
                finally:
                    copy.select_set(False)
            records.append({"lod": lod, "source": source.name, "name": copy.name, "triangles": _triangle_count(copy.data)})
    return {"count": len(records), "records": records}


def _triangle_count(mesh) -> int:
    import bmesh
    bm = bmesh.new()
    try:
        bm.from_mesh(mesh)
        bmesh.ops.triangulate(bm, faces=list(bm.faces))
        return len(bm.faces)
    finally:
        bm.free()


def _annotate_expressions_and_actions() -> dict[str, Any]:
    face = bpy.data.objects.get("Cassidy_Face")
    found_expressions = []
    if face and face.data.shape_keys:
        for name in (f"expression_{x}" for x in EXPRESSION_CONTROLS):
            key = face.data.shape_keys.key_blocks.get(name)
            if key:
                found_expressions.append(name)
        face["gopal_expression_contract"] = found_expressions
    actions = []
    for action in bpy.data.actions:
        if action.name in {"idle", "walk", "run", "turn", "sit", "talk", "gesture", "point", "celebrate", "think", "react"}:
            action["gopal_character"] = "Cassidy"
            action["gopal_source_derived"] = True
            actions.append(action.name)
    return {"expressions": sorted(found_expressions), "animations": sorted(set(actions))}


def upgrade_imported_cassidy_source() -> dict[str, Any]:
    armature = _find_armature()
    mesh_report = _prepare_source_meshes()
    bone_report = _canonicalize_bones(armature)
    _ensure_canonical_bone_groups(armature)
    weights = []
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.get("gopal_character") == "Cassidy" and not obj.get("gopal_generated_lod"):
            if obj.name not in {"Cassidy_Charm"}:
                weights.append(_weighted_rebind(obj, armature))
    detail = _apply_detail_pass()
    root = _ensure_root_node()
    gaze = _ensure_gaze(armature)
    lods = _create_lods()
    contract = _annotate_expressions_and_actions()
    scene = bpy.context.scene
    scene["gopal_cassidy_source_upgrade"] = UPGRADE_VERSION
    scene["gopal_cassidy_source_upgrade_status"] = "TECHNICAL_UPGRADE_COMPLETE"
    scene["gopal_cassidy_visual_review_required"] = True
    return {
        "version": UPGRADE_VERSION,
        "status": "TECHNICAL_UPGRADE_COMPLETE",
        "source_derived": True,
        "meshes": mesh_report,
        "bone_migration": bone_report,
        "weighted_rebind": weights,
        "detail_applied": detail,
        "root": root,
        "gaze": gaze,
        "lods": lods,
        "contract": contract,
        "visual_review_required": True,
        "policy": "repair-objective-contracts-only;-never-synthesize-identity-or-pass-visual-review",
    }
