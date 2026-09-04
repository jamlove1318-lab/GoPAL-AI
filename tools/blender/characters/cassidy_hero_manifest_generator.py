"""Generate a reviewable Cassidy hero-source manifest template.

This tool inventories imported objects and proposes semantic mappings. It never
approves an asset and never invents missing geometry. A human must review the
result before production CI consumes it.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS

VERSION = "3N.1-hero-manifest-generator"
MANIFEST_VERSION = "3N.1-hero-source-manifest"

SUGGESTIONS = {
    "cassidy-body-base": ("body", ("body", "base", "torso", "mesh")),
    "cassidy-face-base": ("face", ("face", "head")),
    "cassidy-eyes": ("eye", ("eye", "iris", "pupil")),
    "cassidy-hair": ("hair", ("hair", "fringe", "bang")),
    "cassidy-base-outfit": ("outfit", ("outfit", "shirt", "jacket", "dress", "top")),
    "cassidy-shoes": ("shoes", ("shoe", "boot", "sneaker", "footwear")),
    "cassidy-companion-charm": ("accessory", ("charm", "companion", "leaf", "compass")),
}


def _mesh_objects() -> list[Any]:
    return [
        obj for obj in bpy.data.objects
        if obj.type == "MESH"
        and (obj.get("gopal_character") == CHARACTER or obj.get("gopal_asset_stage") == "external-source-intake")
    ]


def _score(name: str, keywords: tuple[str, ...]) -> int:
    lowered = name.lower()
    return sum(1 for keyword in keywords if keyword in lowered)


def generate_manifest(path: str | Path) -> dict[str, Any]:
    meshes = _mesh_objects()
    used: set[str] = set()
    components = []
    suggestions = []

    for component_id in REQUIRED_COMPONENTS:
        role, keywords = SUGGESTIONS[component_id]
        ranked = sorted(
            ((obj, _score(obj.name, keywords)) for obj in meshes if obj.name not in used),
            key=lambda pair: (-pair[1], -len(pair[0].data.vertices), pair[0].name),
        )
        candidates = [obj for obj, score in ranked if score > 0]
        selected = candidates[:2] if component_id == "cassidy-eyes" else candidates[:1]
        names = [obj.name for obj in selected]
        if names:
            used.update(names)
        suggestions.append({
            "component_id": component_id,
            "role": role,
            "candidate_object_names": names,
            "confidence": "suggested-only",
        })
        components.append({
            "component_id": component_id,
            "role": role,
            "object_names": names or [f"REPLACE_WITH_{component_id.upper().replace('-', '_')}_OBJECT"],
            "continuous": component_id == "cassidy-body-base",
        })

    manifest = {
        "version": MANIFEST_VERSION,
        "character": CHARACTER,
        "generator_version": VERSION,
        "source_name": "cassidy-hero-production-source",
        "human_review_required": True,
        "components": components,
        "suggestions": suggestions,
    }
    destination = Path(path).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return {
        "valid": True,
        "approved": False,
        "manifest": str(destination),
        "generator_version": VERSION,
        "human_review_required": True,
        "mesh_inventory_count": len(meshes),
        "message": "Template generated; review and correct every mapping before CI use.",
    }
