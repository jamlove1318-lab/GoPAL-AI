"""Production animation quality checks for authored Cassidy actions.

The module validates timing, rig targeting, and clip metadata without creating
or altering animation curves. Visual motion quality remains a review gate.
"""

import bpy

from .cassidy_animation import CLIP_FRAME_RANGES, validate_animation_contract, _action_bone_names
from .cassidy import REQUIRED_ANIMATIONS

ANIMATION_AUTHORING_VERSION = "3N.25"


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
    allowed = set(contract.get("rig_bone_targets", []))
    return {
        "valid": contract["valid"],
        "coverage": contract["coverage"],
        "required": contract["required"],
        "unbound": contract["unbound_animations"],
        "target_count": len(allowed),
    }


def validate_action_metadata():
    missing = []
    records = []
    for name in REQUIRED_ANIMATIONS:
        action = bpy.data.actions.get(name)
        if action is None:
            continue
        expected = CLIP_FRAME_RANGES[name]
        fields = {
            "gopal_character": action.get("gopal_character"),
            "gopal_animation": action.get("gopal_animation"),
            "gopal_animation_version": action.get("gopal_animation_version"),
        }
        ok = fields["gopal_character"] == "Cassidy" and fields["gopal_animation"] == name
        if not ok:
            missing.append(name)
        records.append({"name": name, "metadata": fields, "valid": ok, "expected_range": expected})
    return {"valid": not missing, "missing": missing, "records": records}


def validate_animation_authoring(armature=None):
    contract = validate_animation_contract(armature)
    timing = validate_clip_timing()
    metadata = validate_action_metadata()
    return {
        "version": ANIMATION_AUTHORING_VERSION,
        "valid": contract["valid"] and timing["valid"],
        "contract": contract,
        "timing": timing,
        "metadata": metadata,
        "visual_quality": "requires-human-review",
        "policy": "authored-only",
    }
