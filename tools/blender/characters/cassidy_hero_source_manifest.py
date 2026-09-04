"""Explicit source-to-Cassidy semantic mapping for hero asset intake.

External DCC/asset generators are allowed to choose their own object names. This
manifest provides a deterministic, auditable mapping into Cassidy's stable
component IDs without guessing from geometry or silently inventing parts.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS, REQUIRED_ROLES, mark_authored_asset

MANIFEST_VERSION = "3N.1-hero-source-manifest"


def load_manifest(path: str | Path) -> dict[str, Any]:
    source = Path(path).expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Cassidy source manifest does not exist: {source}")
    data = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Cassidy source manifest must be a JSON object")
    if data.get("character") != CHARACTER:
        raise ValueError("Cassidy source manifest character must be Cassidy")
    if data.get("version") != MANIFEST_VERSION:
        raise ValueError(f"Unsupported Cassidy source manifest version: {data.get('version')!r}")
    return data


def apply_manifest(manifest: dict[str, Any]) -> dict[str, Any]:
    entries = manifest.get("components")
    if not isinstance(entries, list):
        raise ValueError("Cassidy source manifest requires a components array")

    required_ids = set(REQUIRED_COMPONENTS)
    seen_ids: set[str] = set()
    mapped: list[dict[str, Any]] = []
    errors: list[str] = []

    for entry in entries:
        if not isinstance(entry, dict):
            errors.append("component entries must be objects")
            continue
        component_id = str(entry.get("component_id", "")).strip()
        role = str(entry.get("role", "")).strip().lower()
        names = entry.get("object_names")
        continuous = bool(entry.get("continuous", False))
        if component_id not in required_ids:
            errors.append(f"unsupported component_id: {component_id}")
            continue
        if role not in REQUIRED_ROLES:
            errors.append(f"unsupported role for {component_id}: {role}")
            continue
        if component_id in seen_ids:
            errors.append(f"duplicate component_id: {component_id}")
            continue
        if not isinstance(names, list) or not names:
            errors.append(f"object_names missing for {component_id}")
            continue
        seen_ids.add(component_id)

        found = []
        for raw_name in names:
            name = str(raw_name)
            obj = bpy.data.objects.get(name)
            if obj is None:
                errors.append(f"object not found for {component_id}: {name}")
                continue
            if obj.type != "MESH":
                errors.append(f"object is not a mesh for {component_id}: {name}")
                continue
            mark_authored_asset(obj, role, component_id, continuous=continuous)
            found.append(name)

        mapped.append({
            "component_id": component_id,
            "role": role,
            "continuous": continuous,
            "objects": found,
        })

    missing = sorted(required_ids - seen_ids)
    if missing:
        errors.append("manifest is missing required components: " + ", ".join(missing))

    return {
        "version": MANIFEST_VERSION,
        "character": CHARACTER,
        "valid": not errors,
        "errors": errors,
        "mapped_components": mapped,
        "missing_components": missing,
    }
