"""Canonical Cassidy source registry and preservation evidence.

This module records deterministic identity for an accepted source and provides
non-destructive comparison evidence around technical processing. It never
repairs, beautifies, or approves visual quality.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS

REGISTRY_VERSION = "3N.24-canonical-source-registry"


def _mesh_signature(obj: Any) -> dict[str, Any]:
    mesh = obj.data
    coords = []
    for vertex in mesh.vertices:
        coords.extend(round(float(value), 6) for value in vertex.co)
    topology = []
    for polygon in mesh.polygons:
        topology.extend(int(v) for v in polygon.vertices)
    digest = hashlib.sha256()
    digest.update(json.dumps(coords, separators=(",", ":")).encode())
    digest.update(json.dumps(topology, separators=(",", ":")).encode())
    return {
        "object": obj.name,
        "component_id": str(obj.get("gopal_component_id", "")),
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "uv_layers": len(mesh.uv_layers),
        "shape_key_count": len(mesh.shape_keys.key_blocks) if mesh.shape_keys else 0,
        "signature": digest.hexdigest(),
    }


def capture_source_snapshot(label: str = "source") -> dict[str, Any]:
    meshes = [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER
    ]
    components: dict[str, list[dict[str, Any]]] = {component: [] for component in REQUIRED_COMPONENTS}
    for obj in meshes:
        component_id = str(obj.get("gopal_component_id", ""))
        if component_id in components:
            components[component_id].append(_mesh_signature(obj))

    digest = hashlib.sha256()
    for component_id in sorted(components):
        for signature in sorted(components[component_id], key=lambda item: item["object"]):
            digest.update(component_id.encode())
            digest.update(signature["signature"].encode())

    return {
        "version": REGISTRY_VERSION,
        "character": CHARACTER,
        "label": label,
        "source_signature": digest.hexdigest(),
        "components": components,
    }


def compare_source_snapshots(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    before_components = before.get("components", {})
    after_components = after.get("components", {})
    changed: list[str] = []
    for component_id in REQUIRED_COMPONENTS:
        before_items = {item["object"]: item["signature"] for item in before_components.get(component_id, [])}
        after_items = {item["object"]: item["signature"] for item in after_components.get(component_id, [])}
        if before_items != after_items:
            changed.append(component_id)

    return {
        "version": REGISTRY_VERSION,
        "identical": before.get("source_signature") == after.get("source_signature"),
        "changed_components": changed,
        "policy": "source-preservation-evidence-only",
    }


def write_registry(path: str | Path, snapshot: dict[str, Any], revision: str) -> dict[str, Any]:
    destination = Path(path).expanduser()
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": REGISTRY_VERSION,
        "character": CHARACTER,
        "revision": revision,
        "canonical_source": snapshot,
        "approval": "human_visual_review_required",
    }
    destination.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return payload
