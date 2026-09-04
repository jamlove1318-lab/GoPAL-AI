"""Enforce non-destructive preservation of the accepted Cassidy source.

The canonical authored source is protected from silent geometry/topology/UV/shape
key changes. Technical systems may add rigging, sockets, animation, and controlled
material bindings, but those operations cannot rewrite the canonical mesh data.
"""
from __future__ import annotations

from typing import Any

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS
from .cassidy_canonical_source_registry import capture_source_snapshot

PRESERVATION_VERSION = "3N.25-source-preservation"


def _protected_signature(snapshot: dict[str, Any], component_id: str) -> tuple:
    items = snapshot.get("components", {}).get(component_id, [])
    return tuple(
        sorted(
            (
                item.get("object"),
                item.get("vertices"),
                item.get("edges"),
                item.get("polygons"),
                item.get("uv_layers"),
                item.get("shape_key_count"),
                item.get("signature"),
            )
            for item in items
        )
    )


def compare_protected_source(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    changed: list[str] = []
    details: dict[str, Any] = {}
    for component_id in REQUIRED_COMPONENTS:
        left = _protected_signature(before, component_id)
        right = _protected_signature(after, component_id)
        if left != right:
            changed.append(component_id)
            details[component_id] = {"before": left, "after": right}

    return {
        "version": PRESERVATION_VERSION,
        "character": CHARACTER,
        "valid": not changed,
        "protected_components": list(REQUIRED_COMPONENTS),
        "changed_components": changed,
        "details": details,
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
    """Capture the canonical source immediately before technical processing."""
    return capture_source_snapshot("canonical-before-technical-processing")


def end_preservation_scope(before: dict[str, Any]) -> dict[str, Any]:
    """Capture and compare the canonical source after technical processing."""
    after = capture_source_snapshot("canonical-after-technical-processing")
    result = compare_protected_source(before, after)
    result["before_snapshot"] = before
    result["after_snapshot"] = after
    return result
