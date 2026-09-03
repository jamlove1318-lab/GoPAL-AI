"""Cassidy build specification and deterministic intake checks."""

from pathlib import Path

from .cassidy_manifest import CANONICAL_REFERENCE, EXPRESSIONS, ANIMATIONS, LODS, MATERIAL_SLOTS

BUILD_SPEC_VERSION = "3N.4"

REQUIRED_NODES = (
    "Cassidy_Root", "Cassidy_Body", "Cassidy_Head", "Cassidy_Face",
    "Cassidy_Eye_L", "Cassidy_Eye_R", "Cassidy_Eyelid_L", "Cassidy_Eyelid_R",
    "Cassidy_Hand_L", "Cassidy_Hand_R", "Cassidy_Charm", "Cassidy_Hair_Root",
)


def build_spec() -> dict:
    return {
        "version": BUILD_SPEC_VERSION,
        "character": "Cassidy",
        "canonical_reference": CANONICAL_REFERENCE,
        "required_nodes": REQUIRED_NODES,
        "expressions": EXPRESSIONS,
        "animations": ANIMATIONS,
        "lods": LODS,
        "material_slots": MATERIAL_SLOTS,
        "export_format": "glb",
        "production_ready_requires": [
            "authored_geometry",
            "materials",
            "full_body_rig",
            "facial_controls",
            "eye_gaze_controls",
            "required_expressions",
            "required_animations",
            "validated_lods",
        ],
    }


def inspect_source(path: str) -> dict:
    p = Path(path)
    return {
        "path": str(p),
        "exists": p.exists(),
        "is_file": p.is_file(),
        "suffix": p.suffix.lower(),
    }
