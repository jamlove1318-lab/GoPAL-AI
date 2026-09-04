"""Fail-closed preservation gate for the canonical Cassidy source.

The canonical hero source is the artistic authority. Technical processing may
add approved runtime data, but it must not silently mutate canonical geometry,
UVs, shape keys, or source materials.
"""
from __future__ import annotations

from typing import Any

from .cassidy_canonical_source_registry import capture_source_snapshot, compare_source_snapshots
from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS

GATE_VERSION = "3N.25-canonical-preservation-gate"

PROTECTED_FIELDS = (
    "vertices",
    "edges",
    "polygons",
    "uv_layers",
    "shape_key_count",
    "signature",
)


def evaluate_preservation(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    comparison = compare_source_snapshots(before, after)
    changed = comparison.get("changed_components", [])
    missing = []
    before_components = before.get("components", {})
    after_components = after.get("components", {})

    for component_id in REQUIRED_COMPONENTS:
        before_items = {item["object"]: item for item in before_components.get(component_id, [])}
        after_items = {item["object"]: item for item in after_components.get(component_id, [])}
        for object_name, before_item in before_items.items():
            after_item = after_items.get(object_name)
            if after_item is None:
                missing.append(component_id)
                continue
            for field in PROTECTED_FIELDS:
                if before_item.get(field) != after_item.get(field):
                    if component_id not in changed:
                        changed.append(component_id)
                    break

    changed = sorted(set(changed))
    reasons = []
    if missing:
        reasons.append("canonical Cassidy component disappeared during technical processing: " + ", ".join(sorted(set(missing))))
    if changed:
        reasons.append("protected canonical Cassidy source data changed: " + ", ".join(changed))

    return {
        "version": GATE_VERSION,
        "character": CHARACTER,
        "valid": not reasons,
        "identical": not reasons,
        "changed_components": changed,
        "missing_components": sorted(set(missing)),
        "protected_fields": list(PROTECTED_FIELDS),
        "reasons": reasons,
        "approval": "human_visual_review_required",
        "policy": "canonical-source-is-immutable",
    }


def run_preservation_gate() -> dict[str, Any]:
    """Snapshot current scene; useful for diagnostics before/after processing."""
    return capture_source_snapshot("preservation-gate")
