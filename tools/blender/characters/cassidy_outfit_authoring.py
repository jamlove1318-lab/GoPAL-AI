"""Reusable authored-outfit and material-variant contract for Cassidy.

Outfits are authored assets. This module only tags, binds, and validates them;
it never creates replacement clothing geometry.
"""

import bpy

OUTFIT_VERSION = "3N.22"
OUTFITS = (
    "base", "spring", "summer", "autumn", "winter",
    "emerald-valley", "japanese-world", "french-world", "festival", "adventure",
)
MATERIAL_SLOTS = ("skin", "hair", "eyes", "brows", "outfit", "shoes", "accessory")
WORLD_VARIANTS = {
    "emerald-valley": "emerald-valley",
    "japanese-world": "japanese-world",
    "french-world": "french-world",
}


def cassidy_meshes():
    return [o for o in bpy.data.objects if o.type == "MESH" and o.get("gopal_character") == "Cassidy"]


def find_outfit_objects():
    result = []
    for obj in cassidy_meshes():
        role = str(obj.get("gopal_geometry_role", "")).lower()
        name = obj.name.lower()
        if role in {"outfit", "clothing", "shoes", "footwear"} or any(t in name for t in ("outfit", "clothing", "shirt", "jacket", "shoe", "boot", "cloth")):
            result.append(obj)
    return result


def tag_outfit(obj, outfit: str, world_variant=None):
    if obj is None or obj.type != "MESH":
        raise ValueError("tag_outfit requires an authored mesh")
    if outfit not in OUTFITS:
        raise ValueError(f"Unknown Cassidy outfit: {outfit}")
    obj["gopal_character"] = "Cassidy"
    obj["gopal_geometry_role"] = "outfit"
    obj["gopal_outfit_id"] = outfit
    obj["gopal_world_variant"] = world_variant
    obj["gopal_outfit_authoring_version"] = OUTFIT_VERSION
    return obj


def bind_material_slot(obj, slot: str, material_name=None):
    if obj is None or obj.type != "MESH":
        raise ValueError("material binding requires an authored mesh")
    if slot not in MATERIAL_SLOTS:
        raise ValueError(f"Unknown Cassidy material slot: {slot}")
    if material_name:
        material = bpy.data.materials.get(material_name)
        if material is None:
            raise ValueError(f"Material not found: {material_name}")
        if material.name not in [m.name for m in obj.data.materials if m]:
            obj.data.materials.append(material)
    obj["gopal_material_slot"] = slot
    obj["gopal_material_authoring_version"] = OUTFIT_VERSION
    return obj


def validate_outfit_material_readiness():
    outfits = find_outfit_objects()
    missing_materials = [o.name for o in outfits if len(o.material_slots) == 0]
    invalid_outfits = [o.name for o in outfits if o.get("gopal_outfit_id") not in OUTFITS]
    return {
        "version": OUTFIT_VERSION,
        "valid": bool(outfits) and not missing_materials and not invalid_outfits,
        "outfit_count": len(outfits),
        "missing_materials": missing_materials,
        "invalid_outfits": invalid_outfits,
        "required_material_slots": list(MATERIAL_SLOTS),
        "world_variants": dict(WORLD_VARIANTS),
        "identity_policy": "world variants may change clothing/material accents, never core face, hair, proportions, eyes, or charm identity",
    }
