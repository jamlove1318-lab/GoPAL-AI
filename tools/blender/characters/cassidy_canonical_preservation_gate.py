"""Fail-closed preservation gate for the canonical Cassidy source.

Technical processing may add approved runtime data, but it must not silently
mutate canonical geometry, topology, UVs, shape keys, or component identity.
Material-slot names are reported separately because controlled technical
material changes are allowed.
"""
from __future__ import annotations

from typing import Any

from .cassidy_canonical_source_registry import compare_source_snapshots
from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS

GATE_VERSION = "3N.35-canonical-preservation-gate"
PROTECTED_FIELDS = (
    "object",
    "component_id",
    "vertices",
    "edges",
    "polygons",
    "uv_layers",
    "uv_signature",
    "shape_key_count",
    "shape_key_signature",
    "geometry_signature",
    "protected_signature",
)


def evaluate_preservation(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    comparison = compare_source_snapshots(before, after)
    changed = set(comparison.get("changed_components", []))
    missing: set[str] = set()
    field_changes: dict[str, list[str]] = {}
    before_components = before.get("components", {})
    after_components = after.get("components", {})

    for component_id in REQUIRED_COMPONENTS:
        before_items = {item.get("object"): item for item in before_components.get(component_id, [])}
        after_items = {item.get("object"): item for item in after_components.get(component_id, [])}
        if set(before_items) != set(after_items):
            changed.add(component_id)
            if set(before_items) - set(after_items):
                missing.add(component_id)
            field_changes.setdefault(component_id, []).append("object-set")
            continue
        for object_name, before_item in before_items.items():
            after_item = after_items[object_name]
            differences = [
                field for field in PROTECTED_FIELDS
                if before_item.get(field) != after_item.get(field)
            ]
            if differences:
                changed.add(component_id)
                field_changes.setdefault(component_id, []).extend(differences)

    changed_sorted = sorted(changed)
    reasons: list[str] = []
    if missing:
        reasons.append(
            "canonical Cassidy component disappeared during technical processing: "
            + ", ".join(sorted(missing))
        )
    if changed_sorted:
        reasons.append(
            "protected canonical Cassidy source data changed: "
            + ", ".join(changed_sorted)
        )

    return {
        "version": GATE_VERSION,
        "character": CHARACTER,
        "valid": not reasons,
        "identical": not reasons,
        "changed_components": changed_sorted,
        "missing_components": sorted(missing),
        "protected_fields": list(PROTECTED_FIELDS),
        "field_changes": {
            component: sorted(set(fields))
            for component, fields in sorted(field_changes.items())
        },
        "material_changes": comparison.get("material_changes", []),
        "reasons": reasons,
        "approval": "human_visual_review_required",
        "policy": "canonical-source-is-immutable-except-controlled-material-technical-changes",
    }
