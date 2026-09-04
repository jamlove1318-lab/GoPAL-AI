"""Cassidy hero asset contract.

The factory is an asset assembler/parameter driver, not a primitive humanoid
creator. A production Cassidy must originate from authored, continuous hero
geometry. This contract makes that policy explicit and machine-readable.

The canonical reference requires both a head and face. The stable component
model intentionally keeps these as one authored ``cassidy-face-base`` component:
that component supplies the head/face surface while runtime semantic nodes
remain independently addressable. This avoids inventing a duplicate head mesh.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import bpy

CONTRACT_VERSION = "3N.2-hero-asset"
CHARACTER = "Cassidy"
BASE_COLLECTION = "CASSIDY_AUTHORED"
REQUIRED_ROLES = (
    "body",
    "head",
    "face",
    "eye",
    "hair",
    "outfit",
    "shoes",
    "accessory",
)
REQUIRED_COMPONENTS = (
    "cassidy-body-base",
    "cassidy-face-base",
    "cassidy-eyes",
    "cassidy-hair",
    "cassidy-base-outfit",
    "cassidy-shoes",
    "cassidy-companion-charm",
)


@dataclass(frozen=True)
class HeroAssetPolicy:
    geometry_policy: str = "authored-only"
    primitive_humanoid_generation: bool = False
    assembly_allowed: bool = True
    parameter_driving_allowed: bool = True
    visual_review_required: bool = True


def _character_meshes() -> list[Any]:
    return [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER
    ]


def _role(obj) -> str:
    return str(obj.get("gopal_geometry_role", "")).strip().lower()


def validate_hero_asset_contract() -> dict[str, Any]:
    meshes = _character_meshes()
    role_counts = {role: 0 for role in REQUIRED_ROLES}
    for obj in meshes:
        role = _role(obj)
        if role in role_counts:
            role_counts[role] += 1

    # One canonical authored face-base mesh is the head+face surface.
    # Count it for both semantic roles without requiring duplicate geometry.
    if any(obj.get("gopal_component_id") == "cassidy-face-base" for obj in meshes):
        role_counts["head"] = max(role_counts["head"], 1)
        role_counts["face"] = max(role_counts["face"], 1)

    authored = [obj for obj in meshes if obj.get("gopal_authored_asset") is True]
    generated_humanoid = [
        obj for obj in meshes
        if obj.get("gopal_generated_primitive_humanoid") is True
    ]
    connected_candidates = [
        obj for obj in authored
        if obj.get("gopal_continuous_mesh") is True
    ]

    reasons: list[str] = []
    if not meshes:
        reasons.append("no Cassidy mesh asset supplied")
    if not authored:
        reasons.append("no authored Cassidy mesh supplied")
    if generated_humanoid:
        reasons.append("procedural primitive humanoid generation is forbidden")
    if not connected_candidates:
        reasons.append("no authored continuous base mesh is declared")

    return {
        "version": CONTRACT_VERSION,
        "character": CHARACTER,
        "policy": HeroAssetPolicy().__dict__.copy(),
        "valid": not reasons,
        "reasons": reasons,
        "mesh_count": len(meshes),
        "authored_mesh_count": len(authored),
        "continuous_mesh_count": len(connected_candidates),
        "primitive_humanoid_count": len(generated_humanoid),
        "role_counts": role_counts,
        "required_roles": REQUIRED_ROLES,
        "required_components": REQUIRED_COMPONENTS,
        "semantic_aliases": {"head": "cassidy-face-base", "face": "cassidy-face-base"},
    }


def mark_authored_asset(obj, role: str, component_id: str, continuous: bool = False) -> None:
    """Tag an artist-supplied mesh for deterministic assembly."""
    if obj.type != "MESH":
        raise TypeError("Hero asset components must be mesh objects")
    if role not in REQUIRED_ROLES:
        raise ValueError(f"Unsupported Cassidy hero role: {role}")
    obj["gopal_character"] = CHARACTER
    obj["gopal_authored_asset"] = True
    obj["gopal_geometry_role"] = role
    obj["gopal_component_id"] = component_id
    obj["gopal_continuous_mesh"] = bool(continuous)
    obj["gopal_generated_primitive_humanoid"] = False
    obj["gopal_hero_contract_version"] = CONTRACT_VERSION
