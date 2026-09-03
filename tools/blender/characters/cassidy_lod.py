"""Cassidy mobile LOD contract and validation helpers."""

import bpy

REQUIRED_LODS = ("LOD0", "LOD1", "LOD2")
IDENTITY_CRITICAL = ("Cassidy_Face", "Cassidy_Eye_L", "Cassidy_Eye_R", "Cassidy_Hair_Root")


def find_lod_objects():
    result = {lod: [] for lod in REQUIRED_LODS}
    for obj in bpy.data.objects:
        for lod in REQUIRED_LODS:
            if obj.name.endswith(f"_{lod}") or obj.get("gopal_lod") == lod:
                result[lod].append(obj.name)
    return result


def validate_lods() -> dict:
    lods = find_lod_objects()
    missing = [lod for lod, objects in lods.items() if not objects]
    identity_missing = [name for name in IDENTITY_CRITICAL if bpy.data.objects.get(name) is None]
    return {
        "valid": not missing and not identity_missing,
        "missing_lods": missing,
        "identity_critical_missing": identity_missing,
        "coverage": {lod: len(objects) for lod, objects in lods.items()},
    }


def mark_lod_object(obj, lod: str):
    if lod not in REQUIRED_LODS:
        raise ValueError(f"Unsupported Cassidy LOD: {lod}")
    obj["gopal_character"] = "Cassidy"
    obj["gopal_lod"] = lod
