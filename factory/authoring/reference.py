"""
Canonical Cassidy Reference Loader.
Provides access to canonical proportions, color values, and identity parameters.
"""

import json
from pathlib import Path
from typing import Any, Dict, Tuple


def hex_to_linear_rgb(hex_str: str) -> Tuple[float, float, float, float]:
    """Convert sRGB hex string (#rrggbb) to Blender linear RGBA tuple."""
    hex_str = hex_str.lstrip("#")
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0

    # sRGB to linear conversion
    def to_linear(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (to_linear(r), to_linear(g), to_linear(b), 1.0)


def load_canonical_reference(contract_path: Path = Path("contracts/cassidy-identity.json")) -> Dict[str, Any]:
    """Load and parse the Cassidy identity contract."""
    if not contract_path.is_file():
        raise FileNotFoundError(f"Canonical reference contract not found: {contract_path}")

    with open(contract_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Pre-calculate linear RGBA palette
    raw_palette = data.get("palette", {})
    linear_palette = {k: hex_to_linear_rgb(v) for k, v in raw_palette.items()}
    data["linear_palette"] = linear_palette

    return data
