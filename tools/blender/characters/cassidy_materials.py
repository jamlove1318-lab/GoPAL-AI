"""Canonical material binding for authored Cassidy geometry."""

import bpy

from characters.cassidy_authoring import ensure_materials


def bind_material_slot(obj: bpy.types.Object, slot: str) -> None:
    """Attach one canonical Cassidy material to an authored mesh object.

    Existing material slots are preserved; this helper only adds the requested
    canonical material if it is not already present.
    """
    if obj.type != "MESH":
        raise TypeError(f"Material binding requires a mesh object: {obj.name}")

    materials = ensure_materials()
    material = materials.get(slot)
    if material is None:
        raise KeyError(f"Unknown Cassidy material slot: {slot}")

    if material.name not in {m.name for m in obj.data.materials if m is not None}:
        obj.data.materials.append(material)


def bind_materials_by_name(objects=None) -> dict:
    """Bind canonical slots using conservative name hints.

    No existing materials are replaced. This is intended for intake of a real
    authored model whose mesh names contain terms such as Hair, Eye, Outfit,
    Skin, Shoe, Brow, or Charm.
    """
    if objects is None:
        objects = list(bpy.data.objects)

    hints = {
        "skin": ("skin", "face", "body"),
        "hair": ("hair",),
        "eyes": ("eye",),
        "brows": ("brow",),
        "outfit": ("outfit", "shirt", "jacket", "clothes", "cloth"),
        "shoes": ("shoe", "boot", "footwear"),
        "accessory": ("charm", "accessory", "pendant"),
    }

    bound = {}
    for obj in objects:
        if obj.type != "MESH":
            continue
        lowered = obj.name.lower()
        for slot, terms in hints.items():
            if any(term in lowered for term in terms):
                bind_material_slot(obj, slot)
                bound.setdefault(slot, []).append(obj.name)
                break
    return bound
