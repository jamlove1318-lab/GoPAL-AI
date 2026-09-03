"""Cassidy authoring quality gates.

These checks are intentionally conservative. A scene can be visually useful
while still being explicitly marked as non-production until authored assets
satisfy every required gate.
"""

import bpy

from characters.cassidy import validate_cassidy_scene

REQUIRED_COLLECTIONS = ("CHARACTERS", "CAMERAS", "LIGHTING")
REQUIRED_MATERIAL_SLOTS = ("skin", "hair", "eyes", "brows", "outfit", "shoes", "accessory")


def validate_authoring_environment() -> dict:
    errors = []
    for name in REQUIRED_COLLECTIONS:
        if bpy.data.collections.get(name) is None:
            errors.append(f"Missing required collection: {name}")

    missing_materials = [
        f"Cassidy_MAT_{slot}"
        for slot in REQUIRED_MATERIAL_SLOTS
        if bpy.data.materials.get(f"Cassidy_MAT_{slot}") is None
    ]

    contract = validate_cassidy_scene()
    return {
        "valid": not errors and not missing_materials and contract["valid"],
        "environment_errors": errors,
        "missing_materials": missing_materials,
        "contract": contract,
    }


def production_gate_report() -> dict:
    report = validate_authoring_environment()
    report["production_ready"] = report["valid"]
    return report
