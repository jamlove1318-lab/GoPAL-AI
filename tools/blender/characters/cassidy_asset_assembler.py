"""Reusable Cassidy authored-asset assembler.

This layer deliberately refuses to invent a humanoid. It discovers/taggs
artist-authored components, establishes reusable semantic sockets, and prepares
loaded assets for downstream rigging, clothing, materials, LOD and export.
"""
from __future__ import annotations

from typing import Any

import bpy

from factory.bootstrap import ensure_collection
from .cassidy_hero_asset_contract import (
    BASE_COLLECTION,
    CHARACTER,
    REQUIRED_COMPONENTS,
    REQUIRED_ROLES,
    validate_hero_asset_contract,
)

ASSEMBLER_VERSION = "3N.1-asset-assembler"
SOCKETS = {
    "root": (0.0, 0.0, 0.0),
    "pelvis": (0.0, 0.0, 0.0),
    "chest": (0.0, 0.0, 0.0),
    "neck": (0.0, 0.0, 0.0),
    "head": (0.0, 0.0, 0.0),
    "eye_l": (0.0, 0.0, 0.0),
    "eye_r": (0.0, 0.0, 0.0),
    "charm": (0.0, 0.0, 0.0),
}


def _ensure_socket(name: str):
    collection = ensure_collection("CASSIDY_SOCKETS")
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        collection.objects.link(obj)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.06
    obj["gopal_character"] = CHARACTER
    obj["gopal_socket"] = True
    obj["gopal_assembler_version"] = ASSEMBLER_VERSION
    return obj


def ensure_semantic_sockets() -> dict[str, str]:
    sockets = {}
    for socket, location in SOCKETS.items():
        obj = _ensure_socket(f"Cassidy_Socket_{socket}")
        obj.location = location
        sockets[socket] = obj.name
    return sockets


def discover_components() -> dict[str, list[str]]:
    result = {role: [] for role in REQUIRED_ROLES}
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.get("gopal_character") != CHARACTER:
            continue
        role = str(obj.get("gopal_geometry_role", "")).lower()
        if role in result:
            result[role].append(obj.name)
    return result


def assemble_authored_assets() -> dict[str, Any]:
    collection = ensure_collection(BASE_COLLECTION)
    collection["gopal_role"] = "authored-hero-assets-only"
    collection["gopal_character"] = CHARACTER
    collection["gopal_assembler_version"] = ASSEMBLER_VERSION

    sockets = ensure_semantic_sockets()
    components = discover_components()
    contract = validate_hero_asset_contract()

    return {
        "version": ASSEMBLER_VERSION,
        "character": CHARACTER,
        "collection": BASE_COLLECTION,
        "required_components": REQUIRED_COMPONENTS,
        "components": components,
        "sockets": sockets,
        "contract": contract,
        "assembly_policy": "load-authored-components-then-drive-parameters",
    }


if __name__ == "__main__":
    print(assemble_authored_assets())
