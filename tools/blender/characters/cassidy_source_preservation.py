"""Fail-closed preservation helpers for the accepted Cassidy source.

Canonical geometry, topology, UVs, shape keys and semantic component identity
are immutable. Controlled material-slot changes are reported separately.
"""
from __future__ import annotations

from typing import Any

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS
from .cassidy_canonical_source_registry import capture_source_snapshot

PRESERVATION_VERSION = "3N.35-source-preservation"


def _protected_signature(snapshot: dict[str, Any], component_id: str) -> tuple:
    items = snapshot.get("components", {}).get(component_id, [])
    return tuple(sorted(
        (
            item.get("object"), item.get("component_id"), item.get("vertices"),
            item.get("edges"), item.get("polygons"), item.get("uv_layers"),
            item.get("uv_signature"), item.get("shape_key_count"),
            item.get("shape_key_signature"), item.get("geometry_signature"),
            item.get("protected_signature"),
        )
        for item in items
    ))


def compare_protected_source(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    changed: list[str] = []
    details: dict[str, Any] = {}
    material_changes: list[str] = []
    for component_id in REQUIRED_COMPONENTS:
        left = _protected_signature(before, component_id)
        right = _protected_signature(after, component_id)
        if left != right:
            changed.append(component_id)
            details[component_id] = {"before": left, "after": right}
        before_materials = [item.get("material_slots") for item in before.get("components", {}).get(component_id, [])]
        after_materials = [item.get("material_slots") for item in after.get("components", {}).get(component_id, [])]
        if before_materials != after_materials:
            material_changes.append(component_id)
    return {
        "version": PRESERVATION_VERSION,
        "character": CHARACTER,
        "valid": not changed,
        "protected_components": list(REQUIRED_COMPONENTS),
        "changed_components": sorted(set(changed)),
        "details": details,
        "material_changes": sorted(set(material_changes)),
        "policy": {
            "geometry": "immutable",
            "topology": "immutable",
            "uv_layout": "immutable",
            "shape_keys": "immutable",
            "component_ids": "immutable",
            "materials": "controlled-technical-change-allowed",
            "rigging": "derived-data-allowed",
            "animation": "derived-data-allowed",
            "lod": "derived-copy-only",
            "visual_approval": "human-required",
        },
    }


def begin_preservation_scope() -> dict[str, Any]:
    return capture_source_snapshot("canonical-before-technical-processing")


def end_preservation_scope(before: dict[str, Any]) -> dict[str, Any]:
    after = capture_source_snapshot("canonical-after-technical-processing")
    result = compare_protected_source(before, after)
    result["before_snapshot"] = before
    result["after_snapshot"] = after
    return result
