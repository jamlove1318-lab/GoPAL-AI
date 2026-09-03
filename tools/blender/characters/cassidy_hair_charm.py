"""Hair and signature-charm authoring contract for Cassidy.

The module validates authored assets and prepares metadata for secondary
motion/material binding. It never synthesizes placeholder hair or jewelry.
"""

import bpy

HAIR_CHARM_VERSION = "3N.21"
HAIR_COLOR = "#3B2419"
HAIR_HIGHLIGHT = "#70462F"
CHARM_GLOW = "#66E0B5"
CHARM_GOLD = "#D6A84F"
REQUIRED_HAIR_HINTS = ("hair", "hair_root")
REQUIRED_CHARM_HINTS = ("charm", "accessory", "pendant")


def _cassidy_objects():
    return [o for o in bpy.data.objects if o.get("gopal_character") == "Cassidy"]


def _matches(obj, hints):
    text = f"{obj.name} {obj.get('gopal_geometry_role', '')}".lower()
    return any(hint in text for hint in hints)


def find_hair_objects():
    return [o for o in _cassidy_objects() if _matches(o, REQUIRED_HAIR_HINTS)]


def find_charm_objects():
    return [o for o in _cassidy_objects() if _matches(o, REQUIRED_CHARM_HINTS)]


def mark_hair(obj, layer="primary"):
    if obj is None:
        raise ValueError("mark_hair requires an authored object")
    obj["gopal_character"] = "Cassidy"
    obj["gopal_geometry_role"] = "hair"
    obj["gopal_hair_layer"] = layer
    obj["gopal_hair_color"] = HAIR_COLOR
    obj["gopal_hair_highlight"] = HAIR_HIGHLIGHT
    obj["gopal_hair_charm_version"] = HAIR_CHARM_VERSION
    return obj


def mark_charm(obj):
    if obj is None:
        raise ValueError("mark_charm requires an authored object")
    obj["gopal_character"] = "Cassidy"
    obj["gopal_geometry_role"] = "accessory"
    obj["gopal_accessory_identity"] = "leaf-star-compass"
    obj["gopal_charm_glow"] = CHARM_GLOW
    obj["gopal_charm_gold"] = CHARM_GOLD
    obj["gopal_hair_charm_version"] = HAIR_CHARM_VERSION
    return obj


def validate_hair_and_charm():
    hair = find_hair_objects()
    charm = find_charm_objects()
    hair_root = bpy.data.objects.get("Cassidy_Hair_Root")
    return {
        "version": HAIR_CHARM_VERSION,
        "valid": bool(hair) and bool(charm) and hair_root is not None,
        "hair_count": len(hair),
        "charm_count": len(charm),
        "hair_root": hair_root is not None,
        "hair_objects": [o.name for o in hair],
        "charm_objects": [o.name for o in charm],
        "secondary_motion_ready": all(o.get("gopal_secondary_motion") is not None for o in hair),
        "identity": "layered-dark-chocolate-hair + leaf-star-compass-charm",
    }


def mark_secondary_motion(obj, stiffness=0.35, damping=0.25):
    if obj is None:
        raise ValueError("secondary motion requires an authored object")
    obj["gopal_secondary_motion"] = True
    obj["gopal_secondary_stiffness"] = float(stiffness)
    obj["gopal_secondary_damping"] = float(damping)
    return obj
