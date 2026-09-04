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

VERSION = "3N.2-hero-manifest-generator"
MANIFEST_VERSION = "3N.2-hero-source-manifest"

# Keyword suggestions are deliberately advisory only. A match can never become
# an accepted component without an explicit reviewed manifest.
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
        and (
            obj.get("gopal_character") == CHARACTER
            or obj.get("gopal_asset_stage") == "external-source-intake"
        )
    ]


def _score(name: str, keywords: tuple[str, ...]) -> int:
    lowered = name.lower()
    return sum(1 for keyword in keywords if keyword in lowered)


def _candidate_evidence(obj: Any, score: int) -> dict[str, Any]:
    mesh = obj.data
    return {
        "object_name": obj.name,
        "score": score,
        "vertices": len(mesh.vertices),
        "polygons": len(mesh.polygons),
        "uv_layers": len(mesh.uv_layers),
        "material_slots": len(obj.material_slots),
        "source_candidate": bool(obj.get("gopal_source_candidate", False)),
        "authored_asset": bool(obj.get("gopal_authored_asset", False)),
        "geometry_role": obj.get("gopal_geometry_role"),
        "component_id": obj.get("gopal_component_id"),
    }


def generate_manifest(path: str | Path) -> dict[str, Any]:
    meshes = _mesh_objects()
    components = []
    suggestions = []

    for component_id in REQUIRED_COMPONENTS:
        role, keywords = SUGGESTIONS[component_id]
        ranked = sorted(
            (
                (obj, _score(obj.name, keywords))
                for obj in meshes
            ),
            key=lambda pair: (-pair[1], -len(pair[0].data.vertices), pair[0].name),
        )
        candidates = [
            _candidate_evidence(obj, score)
            for obj, score in ranked
            if score > 0
        ]

        # Never auto-select. The previous generator silently converted the top
        # keyword match into object_names, which could make an unreviewed guess
        # look like an explicit source mapping. Suggestions are evidence only.
        suggestions.append({
            "component_id": component_id,
            "role": role,
            "candidates": candidates,
            "selection": None,
            "confidence": "suggested-only",
            "human_review_required": True,
        })
        components.append({
            "component_id": component_id,
            "role": role,
            "object_names": [],
            "continuous": component_id == "cassidy-body-base",
            "review_status": "unresolved",
        })

    manifest = {
        "version": MANIFEST_VERSION,
        "character": CHARACTER,
        "generator_version": VERSION,
        "source_name": "cassidy-hero-production-source",
        "human_review_required": True,
        "approved": False,
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
        "resolved_component_count": 0,
        "message": "Evidence-only template generated; no component mapping was auto-selected.",
    }
