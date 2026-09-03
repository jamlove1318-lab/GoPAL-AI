"""Cassidy production package and checksum generator."""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from factory.evidence import hash_file
from factory.quality.placeholder_blocker import REQUIRED_ANIMATIONS, REQUIRED_EXPRESSIONS

DEFAULT_ARTIFACTS_DIR = Path("artifacts/cassidy")


def build_package_manifest(character: str = "Cassidy", version: str = "1.0.0", glb_path: Optional[Path] = None, evidence: Optional[Dict[str, Any]] = None, artifacts_dir: Optional[Path] = None) -> Dict[str, Any]:
    out = artifacts_dir or DEFAULT_ARTIFACTS_DIR
    glb = glb_path or (out / "cassidy-runtime.glb")
    exists = glb.is_file()
    ev = evidence or {}
    animations = sorted(set(ev.get("animations", [])))
    expression_names = set()
    for names in ev.get("shape_keys", {}).values(): expression_names.update(names)
    expressions = sorted(expression_names)
    if not REQUIRED_ANIMATIONS.issubset(animations):
        raise RuntimeError(f"Cannot package Cassidy: missing animations {sorted(REQUIRED_ANIMATIONS - set(animations))}")
    if not REQUIRED_EXPRESSIONS.issubset(expressions):
        raise RuntimeError(f"Cannot package Cassidy: missing expressions {sorted(REQUIRED_EXPRESSIONS - set(expressions))}")
    manifest = {
        "package_format": "gopal-companion-asset-v2",
        "character": character,
        "version": version,
        "target": "mobile",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "primary_asset": {"filename": glb.name, "format": "GLB", "size_bytes": glb.stat().st_size if exists else 0, "sha256": hash_file(glb) if exists else None},
        "lods_included": 3,
        "components": ev.get("mesh_objects", []),
        "animations": animations,
        "expressions": expressions,
        "materials": ev.get("materials", []),
        "budget_compliance": {"triangles": ev.get("total_triangles", 0), "vertices": ev.get("total_vertices", 0), "within_mobile_budget": ev.get("total_triangles", 0) <= 25000},
    }
    out.mkdir(parents=True, exist_ok=True)
    (out / "cassidy-package.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def generate_checksums(artifacts_dir: Optional[Path] = None) -> Dict[str, str]:
    out = artifacts_dir or DEFAULT_ARTIFACTS_DIR
    checksums = {p.name: hash_file(p) for p in sorted(out.iterdir()) if p.is_file() and p.name != "checksums.json"} if out.is_dir() else {}
    (out / "checksums.json").write_text(json.dumps(checksums, indent=2), encoding="utf-8") if out.exists() else None
    return checksums
