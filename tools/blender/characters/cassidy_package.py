"""Build a deterministic manifest for an authored Cassidy runtime package.

The production gate is the single source of truth for readiness. The manifest
records its evidence plus binary provenance; it never upgrades an invalid asset
to ready.
"""

import hashlib
import json
from pathlib import Path

from .cassidy import REQUIRED_EXPRESSIONS, REQUIRED_ANIMATIONS
from .cassidy_animation import ANIMATION_VERSION
from .cassidy_production_gate import evaluate_production_readiness
from .cassidy_validation_evidence import build_validation_evidence

PACKAGE_VERSION = "3N.36"
MODEL_VERSION = "3N.36"
RIG_VERSION = "3N.23"
TEXTURE_VERSION = "3N.22"


def sha256_file(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_package_manifest(model_path, source_path=None):
    model = Path(model_path)
    if not model.is_file():
        raise FileNotFoundError(model)
    if model.suffix.lower() != ".glb":
        raise ValueError("Cassidy runtime package model must be a .glb file")
    size = model.stat().st_size
    if size <= 0:
        raise ValueError("Cassidy runtime package model is empty")

    gate = evaluate_production_readiness()
    evidence = build_validation_evidence(
        gate,
        source_path=str(Path(source_path)) if source_path else None,
        model_path=str(model),
    )
    ready = gate["ready"] and evidence["production_ready"]

    return {
        "package_version": PACKAGE_VERSION,
        "character": "Cassidy",
        "model_version": MODEL_VERSION,
        "rig_version": RIG_VERSION,
        "animation_version": ANIMATION_VERSION,
        "texture_version": TEXTURE_VERSION,
        "model": {
            "path": model.name,
            "format": "glb",
            "bytes": size,
            "sha256": sha256_file(model),
        },
        "source": Path(source_path).name if source_path else None,
        "required_expressions": list(REQUIRED_EXPRESSIONS),
        "required_animations": list(REQUIRED_ANIMATIONS),
        "required_lods": ["LOD0", "LOD1", "LOD2"],
        "validation": {
            "ready": ready,
            "production_gate": gate,
            "evidence": evidence,
        },
    }


def write_package_manifest(manifest, output_path):
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path
