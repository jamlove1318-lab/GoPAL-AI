"""Machine-readable guard around the human-authored Cassidy reference document.

The Markdown reference remains the artistic source of truth. This module only
verifies that the expected document and canonical asset identifiers are present;
it never infers visual properties from prose and never grants visual approval.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

CHARACTER = "Cassidy"
CONTRACT_VERSION = "3N.28-canonical-reference-contract"
REFERENCE_PATH = Path("docs/cassidy/canonical-reference.md")
CANONICAL_ASSET_ID = "file_00000000642c821198cbd141ddc7e8d7"
CANONICAL_GENERATION_ID = "e5c1a053-d70e-4537-b5b2-aea7a70e0792"
CANONICAL_TARGET_PATH = Path("docs/cassidy/assets/cassidy-canonical-concept-v1.png")

REQUIRED_MARKERS = (
    "Phase 1 visual identity: APPROVED / LOCKED",
    CANONICAL_ASSET_ID,
    CANONICAL_GENERATION_ID,
    "Dark chocolate-brown layered hair",
    "Deep expressive near-black eyes",
    "Distinctive warm, intelligent face",
    "Natural balanced full-body proportions",
    "Practical adventure/learning outfit",
    "Emerald and gold signature language",
    "Luminous leaf-star-compass companion charm",
    "Same Cassidy identity across Emerald Valley, Japanese World and French World",
    "Approved Concept -> Production Sheet -> 3D Model -> Materials -> Rig -> Animation -> Mobile LOD -> GoPAL-AI Integration",
)


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
            "errors": [f"canonical Cassidy reference document is missing: {path}"],
        }

    text = path.read_text(encoding="utf-8")
    for marker in REQUIRED_MARKERS:
        if marker not in text:
            errors.append(f"canonical reference marker missing: {marker}")

    asset_match = re.search(r"Conversation asset identifier:\s*\n\s*`([^`]+)`", text)
    generation_match = re.search(r"Generation identifier:\s*\n\s*`([^`]+)`", text)
    if asset_match and asset_match.group(1) != CANONICAL_ASSET_ID:
        errors.append("canonical conversation asset identifier does not match locked identity")
    if generation_match and generation_match.group(1) != CANONICAL_GENERATION_ID:
        errors.append("canonical generation identifier does not match locked identity")

    return {
        "version": CONTRACT_VERSION,
        "character": CHARACTER,
        "valid": not errors,
        "reference_path": str(path),
        "canonical_asset_id": CANONICAL_ASSET_ID,
        "canonical_generation_id": CANONICAL_GENERATION_ID,
        "canonical_binary_target": str(root / CANONICAL_TARGET_PATH),
        "canonical_binary_target_present": (root / CANONICAL_TARGET_PATH).is_file(),
        "required_markers": list(REQUIRED_MARKERS),
        "errors": errors,
        "visual_approval": "human-controlled",
        "policy": "markdown-reference-is-artistic-source-of-truth",
    }
