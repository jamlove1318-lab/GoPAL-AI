"""Reusable Cassidy animation contract.

Animation clips are authored on the real rig. This module only validates and
annotates authored actions; it never fabricates finished character motion.
"""

import bpy

from .cassidy import REQUIRED_ANIMATIONS

ANIMATION_VERSION = "3N.7"

# Conservative defaults for production review. They describe expected timing,
# not generated motion quality.
CLIP_FRAME_RANGES = {
    "idle": (1, 72),
    "walk": (1, 48),
    "run": (1, 36),
    "turn": (1, 36),
    "sit": (1, 48),
    "talk": (1, 48),
    "gesture": (1, 48),
    "point": (1, 36),
    "celebrate": (1, 60),
    "think": (1, 60),
    "react": (1, 36),
}


def collect_animation_names():
    return {action.name for action in bpy.data.actions}


def validate_animation_contract() -> dict:
    names = collect_animation_names()
    missing = sorted(set(REQUIRED_ANIMATIONS) - names)
    empty = sorted(
        name for name in REQUIRED_ANIMATIONS
        if name in names and len(bpy.data.actions[name].fcurves) == 0
    )
    return {
        "valid": not missing and not empty,
        "missing_animations": missing,
        "empty_animations": empty,
        "coverage": len(REQUIRED_ANIMATIONS) - len(missing),
        "required": len(REQUIRED_ANIMATIONS),
    }


def annotate_animation_action(action, clip_name: str):
    if action is None:
        raise ValueError("A real authored Blender action is required")
    if clip_name not in REQUIRED_ANIMATIONS:
        raise ValueError(f"Unsupported Cassidy animation: {clip_name}")
    action["gopal_character"] = "Cassidy"
    action["gopal_animation"] = clip_name
    action["gopal_animation_version"] = ANIMATION_VERSION
    start, end = CLIP_FRAME_RANGES[clip_name]
    action["gopal_expected_start"] = start
    action["gopal_expected_end"] = end
    return action
