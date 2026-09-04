"""Machine-readable guard around the human-authored Cassidy character sheet.

The Markdown character reference is the artistic source of truth. This module
only verifies the approved document and exposes exact, non-interpretive
requirements for downstream validation. It never grants visual approval.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

CHARACTER = "Cassidy"
CONTRACT_VERSION = "3N.30-canonical-reference-contract"
REFERENCE_PATH = Path("docs/cassidy-character-reference.md")
CANONICAL_ASSET_ID = "file_00000000642c821198cbd141ddc7e8d7"
CANONICAL_GENERATION_ID = "e5c1a053-d70e-4537-b5b2-aea7a70e0792"

REFERENCE_REQUIREMENTS: dict[str, Any] = {
    "identity": {
        "tagline": "Your AI Companion. Your Guide. Your Friend.",
        "eye_color": "near-black with warm brown undertone",
        "hair_color": "dark chocolate brown with subtle warm highlights",
        "hair_style": "soft natural waves with side braid",
        "accessory": "luminous leaf-star compass charm necklace",
        "base_outfit": "Emerald Valley adventurer/explorer outfit",
        "world_identity_lock": ["face", "eyes", "hair", "core silhouette"],
    },
    "geometry": {
        "proportion_style": "realistic stylized proportion (Heroic Realism)",
        "triangles_min": 15000,
        "triangles_max": 45000,
    },
    "facial": {
        "blendshapes_min": 60,
        "independent_eye_control": True,
        "advanced_facial_rig": True,
        "expressions": [
            "neutral", "happy", "curious", "excited", "surprised",
            "thoughtful", "playful", "concerned", "gentle",
        ],
    },
    "poses": [
        "greeting", "explaining", "listening", "thinking", "encouraging", "celebrating",
    ],
    "animations": ["idle-breath", "walk", "run", "talk", "think", "celebrate"],
    "hair": {"pipeline": "Hair Cards + Strand Hybrid"},
    "textures": {"type": "PBR", "resolution": "2K-4K"},
    "lod": ["LOD0", "LOD1", "LOD2", "LOD3"],
    "platforms": ["mobile", "tablet", "desktop"],
    "camera": ["portrait", "half-body", "full-body", "over-the-shoulder"],
    "visual_review_views": ["front", "3/4 front", "side", "3/4 back"],
    "visual_review_required": True,
    "source_policy": "external-authored-source-first",
}

REQUIRED_MARKERS = (
    "# Cassidy — Character Design Reference (GoPAL AI)",
    "**Any implementation of Cassidy must match this description exactly — do not alter her design.**",
    "Your AI Companion. Your Guide. Your Friend.",
    "Near-black with a warm brown undertone",
    "Dark Chocolate Brown, rich dark brown with subtle warm highlights",
    "Signature style:** Side braid",
    "Luminous Leaf-Star Compass Charm",
    "Emerald green sleeveless vest/waistcoat with hood",
    "cream/white long-sleeve blouse",
    "Brown leather belt with pouches and satchel details",
    "Fitted grey/brown trousers",
    "Tall brown leather lace-up boots",
    "Front",
    "3/4 Front",
    "Side",
    "3/4 Back",
    "Neutral",
    "Happy",
    "Curious",
    "Excited",
    "Surprised",
    "Thoughtful",
    "Playful",
    "Concerned",
    "Gentle",
    "60+ Blendshapes",
    "Hair Cards + Strand Hybrid",
    "LOD0 / LOD1 / LOD2 / LOD3",
    "Phase 3: 3D Model & Production Assets",
    "Phase 4: Animation & Integration",
    "This character sheet is the **approved canon** for Cassidy.",
)


def reference_requirements() -> dict[str, Any]:
    """Return a copy so validators cannot mutate canonical constraints."""
    import copy
    return copy.deepcopy(REFERENCE_REQUIREMENTS)


def load_canonical_reference(repo_root: str | Path) -> dict[str, Any]:
    root = Path(repo_root).expanduser().resolve()
    path = root / REFERENCE_PATH
    errors: list[str] = []
    if not path.is_file():
        return {
            "version": CONTRACT_VERSION,
            "character": CHARACTER,
            "valid": False,
            "reference_path": str(path),
            "errors": [f"canonical Cassidy character reference is missing: {path}"],
        }

    text = path.read_text(encoding="utf-8")
    for marker in REQUIRED_MARKERS:
        if marker not in text:
            errors.append(f"canonical reference marker missing: {marker}")

    asset_matches = re.findall(r"(?:asset identifier|asset ID|asset)[:\s]*`([^`]+)`", text, re.IGNORECASE)
    generation_matches = re.findall(r"(?:generation identifier|generation ID)[:\s]*`([^`]+)`", text, re.IGNORECASE)
    if asset_matches and CANONICAL_ASSET_ID not in asset_matches:
        errors.append("canonical conversation asset identifier does not match locked identity")
    if generation_matches and CANONICAL_GENERATION_ID not in generation_matches:
        errors.append("canonical generation identifier does not match locked identity")

    return {
        "version": CONTRACT_VERSION,
        "character": CHARACTER,
        "valid": not errors,
        "reference_path": str(path),
        "canonical_asset_id": CANONICAL_ASSET_ID,
        "canonical_generation_id": CANONICAL_GENERATION_ID,
        "required_markers": list(REQUIRED_MARKERS),
        "requirements": reference_requirements(),
        "errors": errors,
        "visual_approval": "human-controlled",
        "policy": "character-reference-markdown-is-artistic-source-of-truth",
    }
