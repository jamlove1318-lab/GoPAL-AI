"""Unified Cassidy production gate.

Structural validation and visual/art review are both required before export.
Neither gate is allowed to silently substitute for the other.
"""

from characters.cassidy_quality import validate_authoring_environment
from characters.cassidy_rig import validate_rig_contract
from characters.cassidy_lod import validate_lods
from characters.cassidy_animation import validate_animation_contract
from characters.cassidy_mesh_quality import validate_authored_meshes
from characters.cassidy_review import validate_review_record, is_review_complete, REVIEW_VERSION


def _scene_review_record():
    import bpy
    record = bpy.context.scene.get("gopal_cassidy_review")
    return dict(record) if isinstance(record, dict) else None


def validate_visual_review() -> dict:
    record = _scene_review_record()
    if record is None:
        return {
            "valid": False,
            "complete": False,
            "version": REVIEW_VERSION,
            "errors": ["Cassidy visual review record is missing."],
        }
    validation = validate_review_record(record)
    complete = is_review_complete(record)
    errors = list(validation["errors"])
    if validation["valid"] and not complete:
        errors.append("Every Cassidy visual review gate must pass before export.")
    return {
        "valid": validation["valid"],
        "complete": complete,
        "version": record.get("version"),
        "errors": errors,
    }


def evaluate_production_readiness() -> dict:
    quality = validate_authoring_environment()
    mesh = validate_authored_meshes()
    rig = validate_rig_contract()
    lod = validate_lods()
    animation = validate_animation_contract()
    review = validate_visual_review()

    reasons = []
    if not quality["valid"]:
        reasons.append("authoring environment or Cassidy semantic contract is incomplete")
    if not mesh["valid"]:
        reasons.append("authored Cassidy mesh quality gate has not passed")
    if not rig["body_rig_valid"]:
        reasons.append("required body rig bones are missing")
    if not rig["gaze_controls_valid"]:
        reasons.append("required eye/gaze controls are missing")
    if not lod["valid"]:
        reasons.append("required mobile LOD coverage is missing")
    if not animation["valid"]:
        reasons.append("required animation coverage is missing or empty")
    if not review["complete"]:
        reasons.append("visual review has not passed all Cassidy review gates")

    return {
        "ready": not reasons,
        "reasons": reasons,
        "quality": quality,
        "mesh": mesh,
        "rig": rig,
        "lod": lod,
        "animation": animation,
        "review": review,
    }
