"""Unified Cassidy production gate.

This is the final Blender-side decision point before an asset can be exported
for GoPAL-AI runtime integration.
"""

from characters.cassidy import validate_cassidy_scene
from characters.cassidy_quality import validate_authoring_environment
from characters.cassidy_rig import validate_rig_contract
from characters.cassidy_lod import validate_lods
from characters.cassidy_animation import validate_animation_contract


def evaluate_production_readiness() -> dict:
    quality = validate_authoring_environment()
    rig = validate_rig_contract()
    lod = validate_lods()
    animation = validate_animation_contract()

    reasons = []
    if not quality["valid"]:
        reasons.append("authoring environment or Cassidy semantic contract is incomplete")
    if not rig["body_rig_valid"]:
        reasons.append("required body rig bones are missing")
    if not rig["gaze_controls_valid"]:
        reasons.append("required eye/gaze controls are missing")
    if not lod["valid"]:
        reasons.append("required mobile LOD coverage is missing")
    if not animation["valid"]:
        reasons.append("required animation coverage is missing or empty")

    return {
        "ready": not reasons,
        "reasons": reasons,
        "quality": quality,
        "rig": rig,
        "lod": lod,
        "animation": animation,
    }
