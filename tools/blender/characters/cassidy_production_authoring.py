"""One-shot production authoring pass for a genuine Cassidy source.

This module performs objective, source-preserving production work in one pass:
- author missing animation clips on the real Cassidy rig;
- normalize material usage to the seven mobile material roles;
- explicitly identify intentional open face/hair surfaces;
- bind outfit metadata at object and material-slot level.

It never creates a replacement character and never approves visual review.
"""
from __future__ import annotations

from typing import Any
import bpy

from .cassidy_animation_library import author_missing_animation_clips, LIBRARY_VERSION
from .cassidy_outfit_authoring import MATERIAL_SLOTS, OUTFIT_VERSION
from .cassidy_review import ensure_scene_review_record

AUTHORING_VERSION = "3N.58"

ROLE_TO_SLOT = {
    "body": "skin",
    "head": "skin",
    "face": "skin",
    "eye": "eyes",
    "eyelid": "eyes",
    "hair": "hair",
    "hand": "skin",
    "accessory": "accessory",
    "outfit": "outfit",
    "shoes": "shoes",
}

MATERIAL_NAMES = {
    "skin": "Cassidy_MAT_skin",
    "hair": "Cassidy_MAT_hair",
    "eyes": "Cassidy_MAT_eyes",
    "brows": "Cassidy_MAT_brows",
    "outfit": "Cassidy_MAT_outfit",
    "shoes": "Cassidy_MAT_shoes",
    "accessory": "Cassidy_MAT_accessory",
}

OUTFIT_OBJECT_TOKENS = ("outfit", "clothing", "shirt", "jacket", "shoe", "boot", "cloth")


def _ensure_material(name: str):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    mat["gopal_character"] = "Cassidy"
    mat["gopal_material_slot"] = name.removeprefix("Cassidy_MAT_")
    mat["gopal_material_authoring_version"] = OUTFIT_VERSION
    return mat


def _material_slot_for_object(obj) -> str:
    role = str(obj.get("gopal_geometry_role", "")).lower()
    if role in ROLE_TO_SLOT:
        return ROLE_TO_SLOT[role]
    name = obj.name.lower()
    if "hair" in name:
        return "hair"
    if "eye" in name or "lid" in name:
        return "eyes"
    if "charm" in name or "accessory" in name:
        return "accessory"
    if "shoe" in name or "boot" in name:
        return "shoes"
    return "skin"


def _material_slot_from_source(mat, fallback: str) -> str:
    if mat is None:
        return fallback
    declared = str(mat.get("gopal_material_slot", "")).lower()
    if declared in MATERIAL_SLOTS:
        return declared
    name = mat.name.lower()
    for token, slot in (
        ("skin", "skin"), ("hair", "hair"), ("brow", "brows"),
        ("eye", "eyes"), ("iris", "eyes"), ("pupil", "eyes"),
        ("shoe", "shoes"), ("boot", "shoes"), ("charm", "accessory"),
        ("accessory", "accessory"), ("outfit", "outfit"),
        ("shirt", "outfit"), ("pant", "outfit"), ("cloth", "outfit"),
    ):
        if token in name:
            return slot
    return fallback


def _normalize_material_slots(obj) -> dict[str, Any]:
    if obj.type != "MESH":
        return {"name": obj.name, "valid": False, "reason": "not-mesh"}
    fallback = _material_slot_for_object(obj)
    old_materials = list(obj.data.materials)
    assignments = []
    for old in old_materials:
        assignments.append(_material_slot_from_source(old, fallback))

    canonical = {slot: _ensure_material(MATERIAL_NAMES[slot]) for slot in MATERIAL_SLOTS}
    used_slots = []
    for slot in assignments:
        if slot not in used_slots:
            used_slots.append(slot)
    if not used_slots:
        used_slots = [fallback]

    slot_index = {slot: i for i, slot in enumerate(used_slots)}
    for poly in obj.data.polygons:
        old_index = poly.material_index
        source_slot = assignments[old_index] if 0 <= old_index < len(assignments) else fallback
        poly.material_index = slot_index.get(source_slot, 0)

    obj.data.materials.clear()
    for slot in used_slots:
        obj.data.materials.append(canonical[slot])

    obj["gopal_material_slots"] = list(used_slots)
    obj["gopal_material_slot"] = fallback if len(used_slots) == 1 else "multi"
    obj["gopal_material_bindings"] = {slot: MATERIAL_NAMES[slot] for slot in used_slots}
    obj["gopal_material_authoring_version"] = OUTFIT_VERSION
    return {"name": obj.name, "valid": 1 <= len(used_slots) <= len(MATERIAL_SLOTS), "slots": used_slots}


def _is_outfit_object(obj) -> bool:
    role = str(obj.get("gopal_geometry_role", "")).lower()
    name = obj.name.lower()
    # Cassidy_Body and its generated LOD copies can be combined body/clothing
    # meshes. They are outfit-bearing assets, but their body role must remain
    # intact so material inference continues to preserve skin correctly.
    is_body_mesh = name == "cassidy_body" or name.endswith("_cassidy_body")
    return role in {"outfit", "clothing", "shoes", "footwear"} or is_body_mesh or any(token in name for token in OUTFIT_OBJECT_TOKENS)


def _tag_base_outfit_metadata(obj) -> None:
    """Tag outfit identity without overwriting the source mesh's semantic role.

    Cassidy_Body is often a combined authored body/clothing mesh. Treating it
    as geometry_role=outfit changes later material-role inference and can turn
    skin into outfit material on a subsequent deterministic run. Keep the
    original role intact and store outfit metadata separately instead.
    """
    obj["gopal_character"] = "Cassidy"
    obj["gopal_outfit_id"] = "base"
    obj["gopal_outfit_authoring_version"] = OUTFIT_VERSION
    obj["gopal_outfit_metadata_only"] = True


def _normalize_all_materials() -> list[dict[str, Any]]:
    reports = []
    for obj in list(bpy.data.objects):
        if obj.type != "MESH" or obj.get("gopal_character") != "Cassidy":
            continue
        reports.append(_normalize_material_slots(obj))
        if _is_outfit_object(obj):
            _tag_base_outfit_metadata(obj)
    return reports


def _mark_intentional_open_surfaces() -> list[str]:
    marked = []
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.get("gopal_character") != "Cassidy":
            continue
        role = str(obj.get("gopal_geometry_role", "")).lower()
        if role in {"face", "hair"}:
            obj["gopal_open_surface"] = True
            obj["gopal_open_surface_policy"] = "intentional-authored-shell"
            marked.append(obj.name)
    return marked


def run_production_authoring(armature=None) -> dict[str, Any]:
    animation = author_missing_animation_clips(armature)
    materials = _normalize_all_materials()
    open_surfaces = _mark_intentional_open_surfaces()
    scene = bpy.context.scene
    scene["gopal_cassidy_production_authoring"] = AUTHORING_VERSION
    scene["gopal_cassidy_animation_library"] = LIBRARY_VERSION
    scene["gopal_cassidy_material_roles"] = list(MATERIAL_SLOTS)
    scene["gopal_cassidy_visual_review_required"] = True
    review_before = scene.get("gopal_cassidy_review")
    review_created = not isinstance(review_before, dict)
    if review_created:
        ensure_scene_review_record()
    return {
        "version": AUTHORING_VERSION,
        "source_derived": True,
        "animation": animation,
        "materials": materials,
        "intentional_open_surfaces": open_surfaces,
        "visual_review_required": True,
        "review_record_created": review_created,
        "policy": "source-preserving-authored-production-pass",
    }
