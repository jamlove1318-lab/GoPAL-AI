"""Deterministic intake checks for a genuine artist-authored Cassidy source asset.

This module deliberately does not generate, repair, retopologize, rig, or
beautify a character. It establishes the boundary between an external authored
source and the existing Cassidy production pipeline.
"""

from pathlib import Path

SUPPORTED_SOURCE_FORMATS = {".blend", ".glb", ".gltf"}
INTAKE_VERSION = "3N.32"
CANONICAL_REFERENCE = "file_00000000642c821198cbd141ddc7e8d7.png"


def inspect_source_asset(path):
    source = Path(path).expanduser()
    suffix = source.suffix.lower()
    exists = source.is_file()
    return {
        "version": INTAKE_VERSION,
        "path": str(source),
        "filename": source.name,
        "exists": exists,
        "is_file": exists,
        "format": suffix.lstrip("."),
        "supported": suffix in SUPPORTED_SOURCE_FORMATS,
        "bytes": source.stat().st_size if exists else 0,
        "canonical_reference": CANONICAL_REFERENCE,
        "ready_for_pipeline": exists and suffix in SUPPORTED_SOURCE_FORMATS and source.stat().st_size > 0,
    }


def validate_source_asset(path):
    report = inspect_source_asset(path)
    errors = []
    if not report["exists"]:
        errors.append("Authored Cassidy source asset does not exist.")
    elif not report["supported"]:
        errors.append("Unsupported Cassidy source format; expected .blend, .glb, or .gltf.")
    elif report["bytes"] <= 0:
        errors.append("Cassidy source asset is empty.")
    return {**report, "valid": not errors, "errors": errors, "policy": "authored-source-only"}
