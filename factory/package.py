"""
GoPAL-AI Blender Production Factory - Package Manifest & Checksum Generator.
Prepares production distribution packages with cryptographically verifiable checksums.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from factory.evidence import hash_file

DEFAULT_ARTIFACTS_DIR = Path("artifacts/cassidy")


def build_package_manifest(
    character: str = "Cassidy",
    version: str = "1.0.0",
    glb_path: Optional[Path] = None,
    evidence: Optional[Dict[str, Any]] = None,
    artifacts_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Generate production manifest for Cassidy runtime asset."""
    out_dir = artifacts_dir or DEFAULT_ARTIFACTS_DIR
    glb_file = glb_path or (out_dir / "cassidy-runtime.glb")

    glb_exists = glb_file.is_file()
    glb_size = glb_file.stat().st_size if glb_exists else 0
    glb_hash = hash_file(glb_file) if glb_exists else None

    manifest = {
        "package_format": "gopal-companion-asset-v1",
        "character": character,
        "version": version,
        "target": "mobile",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "primary_asset": {
            "filename": glb_file.name,
            "format": "GLB",
            "size_bytes": glb_size,
            "sha256": glb_hash,
        },
        "lods_included": 3,
        "components": evidence.get("mesh_objects", []) if evidence else [],
        "animations": [a["name"] for a in evidence.get("actions", [])] if evidence else [],
        "expressions": list(evidence.get("shape_keys", {}).keys()) if evidence else [],
        "materials": evidence.get("materials", []) if evidence else [],
        "budget_compliance": {
            "triangles": evidence.get("total_triangles", 0) if evidence else 0,
            "vertices": evidence.get("total_vertices", 0) if evidence else 0,
            "within_mobile_budget": (evidence.get("total_triangles", 0) <= 25000) if evidence else False,
        },
    }

    manifest_path = out_dir / "cassidy-package.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[GoPAL-FACTORY] Package manifest written: {manifest_path}", flush=True)
    return manifest


def generate_checksums(artifacts_dir: Optional[Path] = None) -> Dict[str, str]:
    """Compute and store SHA-256 for all artifact files except checksums.json itself."""
    out_dir = artifacts_dir or DEFAULT_ARTIFACTS_DIR
    checksums: Dict[str, str] = {}

    if not out_dir.is_dir():
        return checksums

    for item in sorted(out_dir.iterdir()):
        if item.is_file() and item.name != "checksums.json":
            checksums[item.name] = hash_file(item)

    checksum_file = out_dir / "checksums.json"
    with open(checksum_file, "w", encoding="utf-8") as f:
        json.dump(checksums, f, indent=2)

    print(f"[GoPAL-FACTORY] Checksums written: {checksum_file} ({len(checksums)} entries)", flush=True)
    return checksums
