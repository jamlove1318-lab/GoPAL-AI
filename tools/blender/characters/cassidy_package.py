"""Build a deterministic manifest for an authored Cassidy runtime package.

Binary assets are intentionally not generated here. The package manifest records
exactly what was validated so runtime intake can remain reproducible.
"""

import hashlib
import json
from pathlib import Path

from .cassidy import REQUIRED_EXPRESSIONS, REQUIRED_ANIMATIONS
from .cassidy_animation import validate_animation_contract
from .cassidy_lod import validate_lods
from .cassidy_rig import validate_rig_contract

PACKAGE_VERSION = "3N.8"


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
    animation = validate_animation_contract()
    rig = validate_rig_contract()
    lod = validate_lods()
    ready = animation["valid"] and rig["body_rig_valid"] and rig["gaze_controls_valid"] and lod["valid"]
    return {
        "package_version": PACKAGE_VERSION,
        "character": "Cassidy",
        "model": {
            "path": model.name,
            "format": model.suffix.lower().lstrip("."),
            "bytes": model.stat().st_size,
            "sha256": sha256_file(model),
        },
        "source": Path(source_path).name if source_path else None,
        "required_expressions": list(REQUIRED_EXPRESSIONS),
        "required_animations": list(REQUIRED_ANIMATIONS),
        "validation": {"ready": ready, "animation": animation, "rig": rig, "lod": lod},
    }


def write_package_manifest(manifest, output_path):
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path
