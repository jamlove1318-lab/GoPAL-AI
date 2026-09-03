"""Build a deterministic manifest for an authored Cassidy runtime package.

Binary assets are intentionally not generated here. The package manifest records
exactly what was validated so runtime intake can remain reproducible.
"""

import hashlib
import json
from pathlib import Path

from .cassidy import REQUIRED_EXPRESSIONS, REQUIRED_ANIMATIONS
from .cassidy_animation import ANIMATION_VERSION, validate_animation_contract
from .cassidy_lod import validate_lods
from .cassidy_rig import validate_rig_contract
from .cassidy_review import REVIEW_VERSION, validate_review_record

PACKAGE_VERSION = "3N.15"
MODEL_VERSION = "3N.15"
RIG_VERSION = "3N.6"
TEXTURE_VERSION = "3N.5"


def sha256_file(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _review_validation():
    import bpy
    record = bpy.context.scene.get("gopal_cassidy_review")
    if not isinstance(record, dict):
        return {"valid": False, "complete": False, "version": REVIEW_VERSION, "errors": ["Cassidy visual review record is missing."]}
    validation = validate_review_record(dict(record))
    return {
        "valid": validation["valid"],
        "complete": validation["valid"] and record.get("status") == "passed",
        "version": record.get("version"),
        "errors": validation["errors"],
    }


def build_package_manifest(model_path, source_path=None):
    model = Path(model_path)
    if not model.is_file():
        raise FileNotFoundError(model)
    animation = validate_animation_contract()
    rig = validate_rig_contract()
    lod = validate_lods()
    review = _review_validation()
    ready = (
        animation["valid"]
        and rig["body_rig_valid"]
        and rig["gaze_controls_valid"]
        and lod["valid"]
        and review["valid"]
        and review["complete"]
    )
    return {
        "package_version": PACKAGE_VERSION,
        "character": "Cassidy",
        "model_version": MODEL_VERSION,
        "rig_version": RIG_VERSION,
        "animation_version": ANIMATION_VERSION,
        "texture_version": TEXTURE_VERSION,
        "model": {
            "path": model.name,
            "format": model.suffix.lower().lstrip("."),
            "bytes": model.stat().st_size,
            "sha256": sha256_file(model),
        },
        "source": Path(source_path).name if source_path else None,
        "required_expressions": list(REQUIRED_EXPRESSIONS),
        "required_animations": list(REQUIRED_ANIMATIONS),
        "required_lods": ["LOD0", "LOD1", "LOD2"],
        "validation": {
            "ready": ready,
            "animation": animation,
            "rig": rig,
            "lod": lod,
            "review": review,
        },
    }


def write_package_manifest(manifest, output_path):
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path
