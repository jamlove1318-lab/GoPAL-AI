"""Static package round-trip checks for the Cassidy production boundary.

This checker is intentionally independent of Blender scene construction. It
validates the portable JSON manifest shape and the binary metadata that can be
checked without trusting a scene or UI.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

REQUIRED_EXPRESSIONS = (
    "neutral", "happy", "curious", "surprised", "thoughtful", "excited", "concerned", "playful",
)
REQUIRED_ANIMATIONS = (
    "idle", "walk", "run", "turn", "sit", "talk", "gesture", "point", "celebrate", "think", "react",
)
REQUIRED_LODS = ("LOD0", "LOD1", "LOD2")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_package_manifest(manifest: dict) -> list[str]:
    errors: list[str] = []
    if manifest.get("character") != "Cassidy":
        errors.append("character must be Cassidy")
    model = manifest.get("model")
    if not isinstance(model, dict):
        return ["model metadata is missing"]
    if model.get("format") != "glb":
        errors.append("runtime model format must be glb")
    if not isinstance(model.get("bytes"), int) or model["bytes"] <= 0:
        errors.append("model byte size must be positive")
    if not isinstance(model.get("sha256"), str) or len(model["sha256"]) != 64:
        errors.append("model sha256 must be a 64-character digest")
    if tuple(manifest.get("required_expressions", ())) != REQUIRED_EXPRESSIONS:
        errors.append("expression contract mismatch")
    if tuple(manifest.get("required_animations", ())) != REQUIRED_ANIMATIONS:
        errors.append("animation contract mismatch")
    if tuple(manifest.get("required_lods", ())) != REQUIRED_LODS:
        errors.append("LOD contract mismatch")
    validation = manifest.get("validation")
    if not isinstance(validation, dict) or validation.get("ready") is not True:
        errors.append("manifest validation is not ready")
    evidence = validation.get("evidence") if isinstance(validation, dict) else None
    if not isinstance(evidence, dict) or evidence.get("production_ready") is not True:
        errors.append("production evidence does not certify readiness")
    if isinstance(evidence, dict) and evidence.get("blocking_domains"):
        errors.append("production evidence contains blocking domains")
    return errors


def inspect_package(manifest_path: str | Path) -> dict:
    path = Path(manifest_path)
    manifest = json.loads(path.read_text(encoding="utf-8"))
    errors = validate_package_manifest(manifest)
    model_name = manifest.get("model", {}).get("path")
    model_path = path.parent / model_name if isinstance(model_name, str) else None
    checksum_match = None
    if model_path and model_path.is_file():
        checksum_match = sha256_file(model_path).lower() == str(manifest["model"]["sha256"]).lower()
        if not checksum_match:
            errors.append("model sha256 does not match the package manifest")
    return {
        "valid": not errors,
        "manifest": str(path),
        "model": str(model_path) if model_path else None,
        "checksum_match": checksum_match,
        "errors": errors,
    }
