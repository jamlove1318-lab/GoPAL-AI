"""Reusable authored-outfit and material-variant contract for Cassidy."""

import bpy

OUTFIT_VERSION = "3N.60"
OUTFITS = (
    "base", "spring", "summer", "autumn", "winter",
    "emerald-valley", "japanese-world", "french-world", "festival", "adventure",
)
MATERIAL_SLOTS = ("skin", "hair", "eyes", "brows", "outfit", "shoes", "accessory")
WORLD_VARIANTS = {"emerald-valley": "emerald-valley", "japanese-world": "japanese-world", "french-world": "french-world"}


def cassidy_meshes():
    return [o for o in bpy.data.objects if o.type == "MESH" and o.get("gopal_character") == "Cassidy"]


def find_outfit_objects():
    result = []
    for obj in cassidy_meshes():
        role = str(obj.get("gopal_geometry_role", "")).lower()
        name = obj.name.lower()
        if (role in {"outfit", "clothing", "shoes", "footwear"}
                or (obj.name.startswith("LOD") and any(t in name for t in ("body", "outfit", "clothing", "shirt", "jacket", "shoe", "boot", "cloth")))
                or any(t in name for t in ("outfit", "clothing", "shirt", "jacket", "shoe", "boot", "cloth"))):
            result.append(obj)
    return result


def tag_outfit(obj, outfit: str, world_variant=None):
    if obj is None or obj.type != "MESH":
        raise ValueError("tag_outfit requires an authored mesh")
    if outfit not in OUTFITS:
        raise ValueError(f"Unknown Cassidy outfit: {outfit}")
    if world_variant is not None and world_variant not in WORLD_VARIANTS:
        raise ValueError(f"Unknown Cassidy world variant: {world_variant}")
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
    slots = list(obj.get("gopal_material_slots", []))
    if slot not in slots:
        slots.append(slot)
    obj["gopal_material_slots"] = slots
    obj["gopal_material_slot"] = slot if len(slots) == 1 else "multi"
    bindings = _mapping_or_empty(obj.get("gopal_material_bindings", {}))
    bindings[slot] = material_name or bindings.get(slot)
    obj["gopal_material_bindings"] = bindings
    obj["gopal_material_authoring_version"] = OUTFIT_VERSION
    return obj


def _mapping_or_empty(value):
    """Normalize Python dicts and Blender IDPropertyGroup mappings structurally."""
    if value is None:
        return {}
    if isinstance(value, dict):
        return dict(value)
    items = getattr(value, "items", None)
    if callable(items):
        try:
            return {k: v for k, v in items()}
        except Exception:
            pass
    try:
        return dict(value)
    except Exception:
        return {}


def validate_outfit_material_readiness():
    outfits = find_outfit_objects()
    missing_materials = [o.name for o in outfits if len(o.material_slots) == 0]
    invalid_outfits = [o.name for o in outfits if o.get("gopal_outfit_id") not in OUTFITS]
    unbound_slots = []
    invalid_materials = []
    binding_issues = []
    for obj in outfits:
        declared = set(obj.get("gopal_material_slots", []))
        if not declared:
            declared = {str(obj.get("gopal_material_slot", ""))}
        declared.discard("")
        if not declared or not declared.issubset(set(MATERIAL_SLOTS)):
            unbound_slots.append(obj.name)
        bindings = _mapping_or_empty(obj.get("gopal_material_bindings", {}))
        if not bindings or any(slot not in bindings or not bindings[slot] for slot in declared):
            binding_issues.append(obj.name)
        for index, slot in enumerate(obj.material_slots):
            if slot.material is None:
                invalid_materials.append(f"{obj.name}:slot-{index}:empty")
            elif slot.material.get("gopal_character") != "Cassidy":
                invalid_materials.append(f"{obj.name}:slot-{index}:non-cassidy-material")
    return {
        "version": OUTFIT_VERSION,
        "valid": bool(outfits) and not missing_materials and not invalid_outfits and not unbound_slots and not binding_issues and not invalid_materials,
        "outfit_count": len(outfits),
        "missing_materials": missing_materials,
        "invalid_outfits": invalid_outfits,
        "unbound_material_slots": unbound_slots,
        "binding_issues": binding_issues,
        "invalid_materials": invalid_materials,
        "required_material_slots": list(MATERIAL_SLOTS),
        "world_variants": dict(WORLD_VARIANTS),
        "identity_policy": "world variants may change clothing/material accents, never core face, hair, proportions, eyes, or charm identity",
    }
