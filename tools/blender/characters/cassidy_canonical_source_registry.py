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

REGISTRY_VERSION = "3N.26-canonical-source-registry"


def _json_digest(*parts: Any) -> str:
    digest = hashlib.sha256()
    for part in parts:
        digest.update(json.dumps(part, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    return digest.hexdigest()


def _uv_signature(mesh: Any) -> str:
    layers = getattr(mesh, "uv_layers", None)
    if not layers:
        return _json_digest([])
    payload = []
    for layer in layers:
        payload.append({
            "name": layer.name,
            "data": [
                [round(float(value), 7) for value in loop.uv]
                for loop in layer.data
            ],
        })
    return _json_digest(payload)


def _shape_key_signature(mesh: Any) -> str:
    keys = getattr(mesh, "shape_keys", None)
    if keys is None:
        return _json_digest([])
    payload = []
    for block in keys.key_blocks:
        payload.append({
            "name": block.name,
            "data": [
                [round(float(value), 6) for value in point.co]
                for point in block.data
            ],
        })
    return _json_digest(payload)


def _mesh_signature(obj: Any) -> dict[str, Any]:
    mesh = obj.data
    coords = [
        round(float(value), 6)
        for vertex in mesh.vertices
        for value in vertex.co
    ]
    topology = [
        [int(v) for v in polygon.vertices]
        for polygon in mesh.polygons
    ]
    materials = [slot.material.name if slot.material else None for slot in obj.material_slots]
    geometry_signature = _json_digest(coords, topology)
    protected_signature = _json_digest(
        geometry_signature,
        _uv_signature(mesh),
        _shape_key_signature(mesh),
    )
    return {
        "object": obj.name,
        "component_id": str(obj.get("gopal_component_id", "")),
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "uv_layers": len(mesh.uv_layers),
        "uv_signature": _uv_signature(mesh),
        "shape_key_count": len(mesh.shape_keys.key_blocks) if mesh.shape_keys else 0,
        "shape_key_signature": _shape_key_signature(mesh),
        "material_slots": materials,
        "geometry_signature": geometry_signature,
        "protected_signature": protected_signature,
        # Backward-compatible diagnostic field. It deliberately includes
        # material slots and is not used by the preservation gate.
        "signature": _json_digest(geometry_signature, materials),
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
            digest.update(component_id.encode("utf-8"))
            digest.update(signature["protected_signature"].encode("utf-8"))

    return {
        "version": REGISTRY_VERSION,
        "character": CHARACTER,
        "label": label,
        "source_signature": digest.hexdigest(),
        "components": components,
        "signature_policy": {
            "protected": "geometry+topology+uv+shape-keys",
            "diagnostic": "geometry+topology+material-slot-names",
            "materials": "controlled-technical-change-allowed",
        },
    }


def compare_source_snapshots(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    before_components = before.get("components", {})
    after_components = after.get("components", {})
    changed: list[str] = []
    material_changes: list[str] = []
    for component_id in REQUIRED_COMPONENTS:
        before_items = {item["object"]: item for item in before_components.get(component_id, [])}
        after_items = {item["object"]: item for item in after_components.get(component_id, [])}
        if set(before_items) != set(after_items):
            changed.append(component_id)
            continue
        for object_name in sorted(before_items):
            left = before_items[object_name]
            right = after_items[object_name]
            if left.get("protected_signature") != right.get("protected_signature"):
                changed.append(component_id)
                break
            if left.get("material_slots") != right.get("material_slots"):
                material_changes.append(component_id)
    return {
        "version": REGISTRY_VERSION,
        "identical": not changed,
        "changed_components": sorted(set(changed)),
        "material_changes": sorted(set(material_changes)),
        "policy": "protected-source-data-only",
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
