"""Canonical Cassidy component identity and ownership registry.

Stable component IDs are the authority for Cassidy identity. External object names
are interchangeable labels resolved by a reviewed source manifest. This module
prevents duplicate, missing, or conflicting ownership before technical processing
or world-variant derivation.

The reference sheet names both a head and face, but the production component
model intentionally uses one authored ``cassidy-face-base`` surface for both
semantic roles. Runtime nodes may still expose head and face independently.
"""
from __future__ import annotations

from typing import Any

import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS, REQUIRED_ROLES

IDENTITY_VERSION = "3N.27-canonical-component-identity"
IDENTITY_COLLECTION = "CASSIDY_AUTHORED"

COMPONENT_SPECS = {
    "cassidy-body-base": {"role": "body", "required": True, "continuous": True},
    "cassidy-face-base": {"role": "face", "required": True, "continuous": False},
    "cassidy-eyes": {"role": "eye", "required": True, "continuous": False},
    "cassidy-hair": {"role": "hair", "required": True, "continuous": False},
    "cassidy-base-outfit": {"role": "outfit", "required": True, "continuous": False},
    "cassidy-shoes": {"role": "shoes", "required": True, "continuous": False},
    "cassidy-companion-charm": {"role": "accessory", "required": True, "continuous": False},
}

SEMANTIC_ROLE_ALIASES = {"head": "cassidy-face-base"}


def _cassidy_meshes() -> list[Any]:
    return [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER
    ]


def inspect_component_identity() -> dict[str, Any]:
    meshes = _cassidy_meshes()
    by_id: dict[str, list[Any]] = {component: [] for component in REQUIRED_COMPONENTS}
    unowned: list[str] = []
    unsupported: list[str] = []
    role_conflicts: list[str] = []

    for obj in meshes:
        component_id = str(obj.get("gopal_component_id", "")).strip()
        role = str(obj.get("gopal_geometry_role", "")).strip().lower()
        if not component_id:
            unowned.append(obj.name)
            continue
        if component_id not in by_id:
            unsupported.append(f"{obj.name}: {component_id}")
            continue
        by_id[component_id].append(obj)
        expected_role = COMPONENT_SPECS[component_id]["role"]
        if role != expected_role:
            role_conflicts.append(
                f"{obj.name}: component {component_id} requires role {expected_role}, got {role or '<missing>'}"
            )

    duplicate_components = sorted(
        component_id for component_id, objects in by_id.items() if len(objects) > 1
    )
    missing_components = sorted(
        component_id for component_id, objects in by_id.items() if not objects
    )

    # ``head`` is a semantic alias of the authored face-base component. Do not
    # require a second mesh just to satisfy the reference's head terminology.
    missing_roles: list[str] = []
    for role in REQUIRED_ROLES:
        if role == "head":
            if not by_id[SEMANTIC_ROLE_ALIASES["head"]]:
                missing_roles.append(role)
            continue
        if not any(
            str(obj.get("gopal_geometry_role", "")).strip().lower() == role
            for obj in meshes
        ):
            missing_roles.append(role)

    errors: list[str] = []
    if missing_components:
        errors.append("missing canonical components: " + ", ".join(missing_components))
    if duplicate_components:
        errors.append("duplicate canonical component ownership: " + ", ".join(duplicate_components))
    if unowned:
        errors.append("Cassidy meshes without canonical component ownership: " + ", ".join(sorted(unowned)))
    if unsupported:
        errors.append("unsupported Cassidy component IDs: " + ", ".join(sorted(unsupported)))
    if role_conflicts:
        errors.extend("component role conflict: " + item for item in role_conflicts)
    if missing_roles:
        errors.append("missing canonical roles: " + ", ".join(missing_roles))

    components = {
        component_id: {
            "role": COMPONENT_SPECS[component_id]["role"],
            "required": COMPONENT_SPECS[component_id]["required"],
            "continuous_required": COMPONENT_SPECS[component_id]["continuous"],
            "objects": [obj.name for obj in objects],
        }
        for component_id, objects in by_id.items()
    }
    return {
        "version": IDENTITY_VERSION,
        "character": CHARACTER,
        "valid": not errors,
        "errors": errors,
        "collection": IDENTITY_COLLECTION,
        "components": components,
        "missing_components": missing_components,
        "duplicate_components": duplicate_components,
        "missing_roles": missing_roles,
        "unowned_objects": sorted(unowned),
        "unsupported_components": sorted(unsupported),
        "role_conflicts": role_conflicts,
        "semantic_role_aliases": dict(SEMANTIC_ROLE_ALIASES),
        "policy": "stable-component-id-is-authoritative",
    }


def assert_component_identity() -> dict[str, Any]:
    """Fail closed with a compact exception suitable for CI diagnostics."""
    result = inspect_component_identity()
    if not result["valid"]:
        raise ValueError("Cassidy canonical component identity rejected: " + " | ".join(result["errors"]))
    return result
