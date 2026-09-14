"""Validate an exported Cassidy production package without generating assets.

Usage:
    python tools/cassidy/validate_cassidy_package.py package.json

The manifest is intentionally a transport format, not a second runtime registry.
Its package fields mirror CassidyProductionPackage. Model inspection supports
JSON .gltf and binary .glb using only the Python standard library. If Blender
metadata is supplied, the validator also checks the authored semantic contract.

This tool fails closed: it never creates, repairs, substitutes, or auto-renames
character assets.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
from pathlib import Path
from typing import Any

REQUIRED_NODES = {
    "Cassidy_Root",
    "Cassidy_Body",
    "Cassidy_Head",
    "Cassidy_Face",
    "Cassidy_Eye_L",
    "Cassidy_Eye_R",
    "Cassidy_Eyelid_L",
    "Cassidy_Eyelid_R",
    "Cassidy_Hand_L",
    "Cassidy_Hand_R",
    "Cassidy_Charm",
    "Cassidy_Hair_Root",
}
REQUIRED_ANIMATIONS = {
    "idle", "walk", "run", "turn", "sit", "talk", "gesture", "point",
    "celebrate", "think", "react",
}
REQUIRED_EXPRESSIONS = {
    "neutral", "happy", "curious", "surprised", "thoughtful", "excited",
    "concerned", "playful",
}
REQUIRED_MATERIAL_SLOTS = {"skin", "hair", "eyes", "brows", "outfit", "shoes", "accessory"}
REQUIRED_LODS = {"lod0", "lod1", "lod2"}
REQUIRED_VIEWS = {"front", "three-quarter-front", "side", "three-quarter-back", "back"}


def norm(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("-", "_")


def read_json_asset(path: Path) -> dict[str, Any]:
    if path.suffix.lower() == ".gltf":
        return json.loads(path.read_text(encoding="utf-8"))
    if path.suffix.lower() != ".glb":
        raise ValueError(f"Unsupported model format: {path.suffix or '<none>'}")

    data = path.read_bytes()
    if len(data) < 20:
        raise ValueError("GLB is too small to contain a valid header.")
    magic, version, declared_length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF":
        raise ValueError("Invalid GLB magic header.")
    if version != 2:
        raise ValueError(f"Unsupported GLB version: {version}; expected 2.")
    if declared_length != len(data):
        raise ValueError("GLB declared length does not match file length.")

    offset = 12
    json_chunk: bytes | None = None
    while offset + 8 <= len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        end = offset + chunk_length
        if end > len(data):
            raise ValueError("GLB chunk extends beyond the file boundary.")
        chunk = data[offset:end]
        if chunk_type == 0x4E4F534A and json_chunk is None:  # JSON
            json_chunk = chunk
        offset = end

    if json_chunk is None:
        raise ValueError("GLB has no JSON chunk.")
    return json.loads(json_chunk.rstrip(b" \\t\\r\\n").decode("utf-8"))


def collect_model_metadata(model_path: Path) -> dict[str, set[str]]:
    doc = read_json_asset(model_path)
    node_names = {str(node.get("name")) for node in doc.get("nodes", []) if node.get("name")}
    animation_names = {str(animation.get("name")) for animation in doc.get("animations", []) if animation.get("name")}

    morph_names: set[str] = set()
    for mesh in doc.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            targets = primitive.get("targets", [])
            extras = primitive.get("extras", {}) or {}
            target_names = extras.get("targetNames", [])
            morph_names.update(str(name) for name in target_names)
        extras = mesh.get("extras", {}) or {}
        morph_names.update(str(name) for name in extras.get("targetNames", []))

    return {"nodes": node_names, "animations": animation_names, "morphs": morph_names}


def errors_for_package(pkg: dict[str, Any], manifest_path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    profile = pkg.get("validationProfile", {})

    if pkg.get("characterId") != "cassidy":
        errors.append("Production package character id must remain cassidy.")
    if pkg.get("identityLocked") is not True:
        errors.append("Production package identityLocked must be true.")
    for field in ("packageVersion", "canonicalDesignVersion", "productionSpecVersion"):
        if not str(pkg.get(field, "")).strip():
            errors.append(f"Missing required package field: {field}.")

    def require_all(field: str, required: set[str], label: str) -> None:
        actual = {str(value) for value in pkg.get(field, [])}
        missing = sorted(required - actual)
        if missing:
            errors.append(f"Missing {label}: {', '.join(missing)}.")

    require_all("validatedViews", set(profile.get("requiredViews", REQUIRED_VIEWS)), "validated views")
    require_all("validatedExpressions", set(profile.get("requiredExpressions", REQUIRED_EXPRESSIONS)), "validated expressions")
    require_all("validatedAnimations", set(profile.get("requiredAnimations", REQUIRED_ANIMATIONS)), "validated animations")
    require_all("validatedMaterialSlots", set(profile.get("requiredMaterialSlots", REQUIRED_MATERIAL_SLOTS)), "validated material slots")

    controls = pkg.get("controls", {})
    for key in ("facial", "eyeGaze", "hands", "secondaryMotion"):
        if profile.get({"facial": "requiresFacialControls", "eyeGaze": "requiresEyeGazeControls", "hands": "requiresHandControls", "secondaryMotion": "requiresSecondaryMotion"}[key], True) and controls.get(key) is not True:
            errors.append(f"Required control is missing: {key}.")

    files = pkg.get("files", [])
    if not isinstance(files, list):
        errors.append("Package files must be an array.")
        return errors, warnings

    seen_ids: set[str] = set()
    roles: dict[str, dict[str, Any]] = {}
    for item in files:
        if not isinstance(item, dict):
            errors.append("Every production file entry must be an object.")
            continue
        file_id = str(item.get("id", ""))
        role = str(item.get("role", ""))
        if file_id in seen_ids:
            errors.append(f"Duplicate production file id: {file_id}.")
        seen_ids.add(file_id)
        uri = str(item.get("uri", ""))
        if not uri.strip():
            errors.append(f"Missing URI for production file: {file_id}.")
        if not str(item.get("version", "")).strip():
            errors.append(f"Missing version for production file: {file_id}.")
        if role in roles:
            errors.append(f"Duplicate production asset role: {role}.")
        roles[role] = item

        if "byteSize" in item and (not isinstance(item["byteSize"], int) or item["byteSize"] <= 0):
            errors.append(f"Invalid byteSize for production file: {file_id}.")
        if "sha256" in item and (not isinstance(item["sha256"], str) or len(item["sha256"]) != 64):
            errors.append(f"Invalid sha256 for production file: {file_id}.")

    for role in ("model", "rig", "animation", *sorted(REQUIRED_LODS)):
        if role not in roles:
            errors.append(f"Missing required Cassidy {role.upper()} asset.")

    for lod in REQUIRED_LODS:
        if lod in roles:
            uri = Path(str(roles[lod].get("uri", "")))
            if not uri.exists():
                warnings.append(f"LOD asset is not locally accessible from this checkout: {uri}.")

    model_item = roles.get("model")
    if model_item:
        model_path = (manifest_path.parent / str(model_item.get("uri", ""))).resolve()
        if not model_path.exists():
            errors.append(f"Canonical model asset is not accessible: {model_path}.")
        else:
            expected_sha = model_item.get("sha256")
            if expected_sha:
                actual_sha = hashlib.sha256(model_path.read_bytes()).hexdigest()
                if actual_sha.lower() != str(expected_sha).lower():
                    errors.append("Canonical model sha256 does not match the package manifest.")
            try:
                metadata = collect_model_metadata(model_path)
                missing_nodes = sorted(REQUIRED_NODES - metadata["nodes"])
                missing_anims = sorted(REQUIRED_ANIMATIONS - {norm(x) for x in metadata["animations"]})
                missing_exprs = sorted(REQUIRED_EXPRESSIONS - {
                    norm(x.removeprefix("expression_"))
                    for x in metadata["morphs"] if norm(x).startswith("expression_")
                })
                if missing_nodes:
                    errors.append(f"Model missing semantic nodes: {', '.join(missing_nodes)}.")
                if missing_anims:
                    errors.append(f"Model missing animation clips: {', '.join(missing_anims)}.")
                if missing_exprs:
                    errors.append(f"Model missing expression morphs: {', '.join(missing_exprs)}.")
                if not metadata["animations"]:
                    warnings.append("No animation names were exposed by the model file; Blender-side rig validation may still be required.")
                if not metadata["morphs"]:
                    warnings.append("No morph target names were exposed by the model file; Blender-side expression validation may still be required.")
            except (OSError, ValueError, json.JSONDecodeError, UnicodeDecodeError, struct.error) as exc:
                errors.append(f"Unable to inspect canonical model: {exc}")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path, help="Cassidy production package JSON manifest")
    args = parser.parse_args()
    manifest_path = args.manifest.resolve()

    try:
        pkg = json.loads(manifest_path.read_text(encoding="utf-8"))
        errors, warnings = errors_for_package(pkg, manifest_path)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"STATUS: INVALID MANIFEST\\nERROR: {exc}")
        return 2

    print("=== CASSIDY PRODUCTION PACKAGE VALIDATION ===")
    print(f"Manifest: {manifest_path}")
    print(f"Errors: {len(errors)}")
    for error in errors:
        print(f"  ERROR: {error}")
    print(f"Warnings: {len(warnings)}")
    for warning in warnings:
        print(f"  WARNING: {warning}")
    print("STATUS:", "PASS" if not errors else "REVIEW REQUIRED")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
