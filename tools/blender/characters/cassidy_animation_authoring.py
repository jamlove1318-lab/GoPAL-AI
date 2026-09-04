"""Production animation authoring and validation for Cassidy.

The library creates real keyed Actions on Cassidy's real armature when the
source asset is missing required clips. It never changes the character's
identity or marks visual review complete.
"""
from __future__ import annotations

import bpy

from .cassidy_animation import CLIP_FRAME_RANGES, validate_animation_contract, ANIMATION_VERSION, _iter_action_fcurves
from .cassidy import REQUIRED_ANIMATIONS
from .cassidy_animation_library import LIBRARY_VERSION, author_missing_animation_clips

ANIMATION_AUTHORING_VERSION = "3N.52"


def _frame_range(action):
    return tuple(round(x, 4) for x in action.frame_range) if action else (0.0, 0.0)


def validate_clip_timing():
    issues = []
    clips = []
    for name in REQUIRED_ANIMATIONS:
        action = bpy.data.actions.get(name)
        if action is None:
            continue
        actual = _frame_range(action)
        expected = CLIP_FRAME_RANGES[name]
        timing_ok = actual[0] <= expected[0] and actual[1] >= expected[1]
        if not timing_ok:
            issues.append(name)
        clips.append({"name": name, "actual_range": actual, "expected_range": expected, "timing_ok": timing_ok})
    return {"valid": not issues, "issues": issues, "clips": clips}


def validate_animation_targets(armature=None):
    contract = validate_animation_contract(armature)
    return {"valid": contract["valid"], "coverage": contract["coverage"],
            "required": contract["required"], "unbound": contract["unbound_animations"],
            "target_count": len(contract.get("rig_bone_targets", []))}


def validate_action_metadata():
    missing = []
    records = []
    for name in REQUIRED_ANIMATIONS:
        action = bpy.data.actions.get(name)
        if action is None:
            continue
        expected = CLIP_FRAME_RANGES[name]
        fields = {"gopal_character": action.get("gopal_character"),
                  "gopal_animation": action.get("gopal_animation"),
                  "gopal_animation_version": action.get("gopal_animation_version")}
        ok = (fields["gopal_character"] == "Cassidy" and
              fields["gopal_animation"] == name and
              fields["gopal_animation_version"] == ANIMATION_VERSION)
        if not ok:
            missing.append(name)
        records.append({"name": name, "metadata": fields, "valid": ok, "expected_range": expected})
    return {"valid": not missing, "missing": missing, "records": records}


def _action_has_authored_keys(action) -> bool:
    return action is not None and any(len(fc.keyframe_points) >= 2 for fc in _iter_action_fcurves(action))


def validate_authored_library():
    records = []
    issues = []
    for name in REQUIRED_ANIMATIONS:
        action = bpy.data.actions.get(name)
        keyed = _action_has_authored_keys(action)
        record = {"name": name, "exists": action is not None, "keyed": keyed,
                  "library": action.get("gopal_authored_library") if action else None}
        records.append(record)
        if not keyed:
            issues.append(name)
    return {"valid": not issues, "issues": issues, "records": records, "version": LIBRARY_VERSION}


def author_production_animation_library(armature=None):
    """Author missing required clips, preserving any genuine source actions."""
    return author_missing_animation_clips(armature)


def validate_animation_authoring(armature=None):
    contract = validate_animation_contract(armature)
    timing = validate_clip_timing()
    metadata = validate_action_metadata()
    library = validate_authored_library()
    return {"version": ANIMATION_AUTHORING_VERSION,
            "valid": contract["valid"] and timing["valid"] and metadata["valid"] and library["valid"],
            "contract": contract, "timing": timing, "metadata": metadata, "library": library,
            "visual_quality": "requires-human-review", "policy": "authored-only-deterministic-baseline"}
