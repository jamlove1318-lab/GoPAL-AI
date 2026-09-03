"""Machine-readable Cassidy production manifest for the Blender factory."""

from dataclasses import dataclass
from typing import Tuple

CANONICAL_REFERENCE = "file_00000000642c821198cbd141ddc7e8d7.png"
MANIFEST_VERSION = "3N.3"

@dataclass(frozen=True)
class AssetSpec:
    asset_id: str
    kind: str
    required: bool = True
    source: str = ""

REQUIRED_ASSETS: Tuple[AssetSpec, ...] = (
    AssetSpec("cassidy-turnaround", "turnaround"),
    AssetSpec("cassidy-face", "face"),
    AssetSpec("cassidy-eyes", "eyes"),
    AssetSpec("cassidy-hair", "hair"),
    AssetSpec("cassidy-base-outfit", "outfit"),
    AssetSpec("cassidy-expression-sheet", "expression-sheet"),
    AssetSpec("cassidy-pose-sheet", "pose-sheet"),
    AssetSpec("cassidy-accessory", "accessory"),
    AssetSpec("cassidy-material-sheet", "material-sheet"),
    AssetSpec("cassidy-model", "model"),
    AssetSpec("cassidy-rig", "rig"),
    AssetSpec("cassidy-animation", "animation"),
)

EXPRESSIONS = (
    "neutral", "happy", "curious", "surprised", "thoughtful", "excited",
    "concerned", "playful",
)
ANIMATIONS = (
    "idle", "walk", "run", "turn", "sit", "talk", "gesture", "point",
    "celebrate", "think", "react",
)
LODS = ("LOD0", "LOD1", "LOD2")
MATERIAL_SLOTS = ("skin", "hair", "eyes", "brows", "outfit", "shoes", "accessory")

IDENTITY = {
    "hair": "deep-chocolate-brown layered hair",
    "eyes": "deep expressive near-black eyes with warm undertone",
    "face": "warm intelligent stylized face",
    "silhouette": "natural balanced full-body proportions",
    "palette": {"emerald": "#0F8A62", "gold": "#D6A84F", "charm": "#66E0B5"},
}


def production_manifest() -> dict:
    return {
        "version": MANIFEST_VERSION,
        "character": "Cassidy",
        "canonical_reference": CANONICAL_REFERENCE,
        "identity_locked": True,
        "assets": [a.__dict__ for a in REQUIRED_ASSETS],
        "expressions": EXPRESSIONS,
        "animations": ANIMATIONS,
        "lods": LODS,
        "material_slots": MATERIAL_SLOTS,
        "identity": IDENTITY,
    }
