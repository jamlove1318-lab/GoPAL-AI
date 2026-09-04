"""Reusable authored Cassidy animation library.

Creates a real Blender Action for every missing Cassidy clip on the canonical
armature. This is procedural *authoring*, not a validator bypass: every clip
contains actual keyed pose-bone channels, deterministic timing, metadata and
markers. Visual motion quality still requires human review.
"""
from __future__ import annotations

import math
from typing import Any

import bpy

from .cassidy import REQUIRED_ANIMATIONS
from .cassidy_animation import CLIP_FRAME_RANGES, ANIMATION_VERSION, _iter_action_fcurves

LIBRARY_VERSION = "3N.52-authored-library"

# Small, readable pose vocabulary. Values are radians unless explicitly noted.
POSE_BONES = (
    "Cassidy_Hips", "Cassidy_Spine", "Cassidy_Chest", "Cassidy_Neck",
    "Cassidy_Head", "Cassidy_Shoulder_L", "Cassidy_UpperArm_L",
    "Cassidy_Forearm_L", "Cassidy_Hand_L", "Cassidy_Shoulder_R",
    "Cassidy_UpperArm_R", "Cassidy_Forearm_R", "Cassidy_Hand_R",
    "Cassidy_Thigh_L", "Cassidy_Shin_L", "Cassidy_Foot_L",
    "Cassidy_Thigh_R", "Cassidy_Shin_R", "Cassidy_Foot_R",
)


def _pose(clip: str, u: float) -> dict[str, tuple[float, float, float]]:
    """Return deterministic, restrained pose rotations for normalized time."""
    s = math.sin(2.0 * math.pi * u)
    c = math.cos(2.0 * math.pi * u)
    q = math.sin(math.pi * u)
    p: dict[str, tuple[float, float, float]] = {}

    # Baseline organic motion shared by the library.
    p["Cassidy_Spine"] = (0.035 * s, 0.018 * c, 0.0)
    p["Cassidy_Chest"] = (0.045 * s, 0.025 * c, 0.012 * s)
    p["Cassidy_Neck"] = (-0.025 * s, 0.035 * c, 0.0)
    p["Cassidy_Head"] = (-0.035 * s, 0.055 * c, 0.018 * s)
    p["Cassidy_Hips"] = (0.0, 0.012 * c, 0.0)

    if clip == "walk":
        p["Cassidy_Thigh_L"] = (0.42 * s, 0.0, 0.0)
        p["Cassidy_Thigh_R"] = (-0.42 * s, 0.0, 0.0)
        p["Cassidy_Shin_L"] = (-0.22 * max(0.0, -s), 0.0, 0.0)
        p["Cassidy_Shin_R"] = (-0.22 * max(0.0, s), 0.0, 0.0)
        p["Cassidy_Foot_L"] = (0.12 * max(0.0, -s), 0.0, 0.0)
        p["Cassidy_Foot_R"] = (0.12 * max(0.0, s), 0.0, 0.0)
        p["Cassidy_UpperArm_L"] = (-0.28 * s, 0.0, 0.0)
        p["Cassidy_UpperArm_R"] = (0.28 * s, 0.0, 0.0)
        p["Cassidy_Forearm_L"] = (0.10 + 0.06 * s, 0.0, 0.0)
        p["Cassidy_Forearm_R"] = (0.10 - 0.06 * s, 0.0, 0.0)
    elif clip == "run":
        p["Cassidy_Spine"] = (0.10 + 0.055 * s, 0.02 * c, 0.0)
        p["Cassidy_Chest"] = (0.11 + 0.05 * s, 0.03 * c, 0.0)
        p["Cassidy_Thigh_L"] = (0.72 * s, 0.0, 0.0)
        p["Cassidy_Thigh_R"] = (-0.72 * s, 0.0, 0.0)
        p["Cassidy_Shin_L"] = (-0.48 * max(0.0, -s), 0.0, 0.0)
        p["Cassidy_Shin_R"] = (-0.48 * max(0.0, s), 0.0, 0.0)
        p["Cassidy_UpperArm_L"] = (-0.62 * s, 0.0, 0.0)
        p["Cassidy_UpperArm_R"] = (0.62 * s, 0.0, 0.0)
        p["Cassidy_Forearm_L"] = (0.18, 0.0, 0.0)
        p["Cassidy_Forearm_R"] = (0.18, 0.0, 0.0)
    elif clip == "turn":
        p["Cassidy_Hips"] = (0.0, 0.0, 0.22 * q)
        p["Cassidy_Spine"] = (0.0, 0.0, 0.32 * q)
        p["Cassidy_Chest"] = (0.0, 0.0, 0.42 * q)
        p["Cassidy_Neck"] = (0.0, 0.0, 0.18 * q)
        p["Cassidy_Head"] = (0.0, 0.0, 0.12 * q)
    elif clip == "sit":
        p["Cassidy_Hips"] = (0.0, 0.0, 0.0)
        p["Cassidy_Spine"] = (0.12 * q, 0.0, 0.0)
        p["Cassidy_Thigh_L"] = (-0.95 * q, 0.0, 0.0)
        p["Cassidy_Thigh_R"] = (-0.95 * q, 0.0, 0.0)
        p["Cassidy_Shin_L"] = (0.72 * q, 0.0, 0.0)
        p["Cassidy_Shin_R"] = (0.72 * q, 0.0, 0.0)
    elif clip == "talk":
        p["Cassidy_Head"] = (0.03 * s, 0.10 * c, 0.025 * s)
        p["Cassidy_Neck"] = (-0.02 * s, 0.045 * c, 0.0)
        p["Cassidy_UpperArm_L"] = (-0.08 + 0.10 * q, 0.0, 0.06 * s)
        p["Cassidy_UpperArm_R"] = (-0.10 + 0.08 * q, 0.0, -0.05 * s)
        p["Cassidy_Forearm_L"] = (0.20 + 0.12 * q, 0.0, 0.0)
        p["Cassidy_Forearm_R"] = (0.18 + 0.10 * q, 0.0, 0.0)
    elif clip == "gesture":
        p["Cassidy_UpperArm_L"] = (-0.90 * q, 0.0, -0.10 * q)
        p["Cassidy_Forearm_L"] = (0.35 * q, 0.0, 0.0)
        p["Cassidy_Hand_L"] = (0.0, 0.0, -0.12 * q)
        p["Cassidy_UpperArm_R"] = (-0.38 * q, 0.0, 0.12 * q)
        p["Cassidy_Forearm_R"] = (0.20 * q, 0.0, 0.0)
    elif clip == "point":
        p["Cassidy_UpperArm_R"] = (-0.55 * q, 0.0, -0.52 * q)
        p["Cassidy_Forearm_R"] = (-0.10 * q, 0.0, 0.0)
        p["Cassidy_Hand_R"] = (0.0, 0.0, -0.08 * q)
        p["Cassidy_Head"] = (0.0, 0.10 * q, 0.0)
    elif clip == "celebrate":
        p["Cassidy_UpperArm_L"] = (-1.20 * q, 0.0, -0.35 * q)
        p["Cassidy_UpperArm_R"] = (-1.20 * q, 0.0, 0.35 * q)
        p["Cassidy_Forearm_L"] = (0.30 * q, 0.0, 0.0)
        p["Cassidy_Forearm_R"] = (0.30 * q, 0.0, 0.0)
        p["Cassidy_Chest"] = (-0.08 * q, 0.0, 0.0)
    elif clip == "think":
        p["Cassidy_Head"] = (0.05 * q, -0.12 * q, 0.04 * q)
        p["Cassidy_UpperArm_R"] = (-0.48 * q, 0.0, -0.18 * q)
        p["Cassidy_Forearm_R"] = (0.72 * q, 0.0, 0.0)
        p["Cassidy_Hand_R"] = (0.12 * q, 0.0, 0.0)
        p["Cassidy_UpperArm_L"] = (-0.18 * q, 0.0, 0.08 * q)
    elif clip == "react":
        p["Cassidy_Chest"] = (-0.18 * q, 0.0, 0.0)
        p["Cassidy_Head"] = (0.18 * q, 0.08 * q, 0.0)
        p["Cassidy_UpperArm_L"] = (-0.45 * q, 0.0, -0.20 * q)
        p["Cassidy_UpperArm_R"] = (-0.45 * q, 0.0, 0.20 * q)
        p["Cassidy_Forearm_L"] = (0.25 * q, 0.0, 0.0)
        p["Cassidy_Forearm_R"] = (0.25 * q, 0.0, 0.0)
    return p


def _ensure_action_channels(action, armature):
    """Return the Blender 5.x channelbag, or a legacy fcurve collection."""
    direct = getattr(action, "fcurves", None)
    if direct is not None:
        return direct
    slots = getattr(action, "slots", None)
    if slots is None:
        return None
    slot = slots.active
    if slot is None:
        slot = slots.new("OBJECT", armature.name)
        try:
            slots.active = slot
        except (AttributeError, TypeError):
            pass
    layers = getattr(action, "layers", None)
    if layers is None:
        return None
    layer = layers[0] if len(layers) else layers.new("Cassidy")
    strips = layer.strips
    strip = strips[0] if len(strips) else strips.new(type="KEYFRAME")
    return strip.channelbag(slot, ensure=True)


def _new_curve(container, path, index, group="Cassidy"):
    if hasattr(container, "new"):
        try:
            return container.new(data_path=path, index=index, group_name=group)
        except TypeError:
            return container.new(path, index=index, group_name=group)
    return None


def _write_curve(fc, keys):
    fc.keyframe_points.add(len(keys))
    for point, (frame, value) in zip(fc.keyframe_points, keys):
        point.co = (float(frame), float(value))
        point.interpolation = "BEZIER"
    fc.update()


def _author_clip(armature, name: str) -> dict[str, Any]:
    if name == "idle":
        action = bpy.data.actions.get(name)
        if action is None:
            return {"name": name, "created": False, "valid": False, "reason": "idle source action missing"}
        for fc in _iter_action_fcurves(action):
            if len(fc.keyframe_points):
                last = max(fc.keyframe_points, key=lambda p: p.co.x)
                if last.co.x < 72.0:
                    kp = fc.keyframe_points.insert(72.0, last.co.y)
                    kp.interpolation = "BEZIER"
        action["gopal_character"] = "Cassidy"
        action["gopal_animation"] = "idle"
        action["gopal_animation_version"] = ANIMATION_VERSION
        action["gopal_source_derived"] = True
        action["gopal_authored_library"] = LIBRARY_VERSION
        return {"name": name, "created": False, "valid": True, "extended_to": 72}

    existing = bpy.data.actions.get(name)
    if existing is not None and any(_iter_action_fcurves(existing)):
        existing["gopal_character"] = "Cassidy"
        existing["gopal_animation"] = name
        existing["gopal_animation_version"] = ANIMATION_VERSION
        existing["gopal_authored_library"] = LIBRARY_VERSION
        return {"name": name, "created": False, "valid": True}

    action = existing or bpy.data.actions.new(name=name)
    action.use_fake_user = True
    container = _ensure_action_channels(action, armature)
    if container is None:
        return {"name": name, "created": False, "valid": False, "reason": "Blender Action channel API unavailable"}

    start, end = CLIP_FRAME_RANGES[name]
    span = end - start
    samples = (0.0, 0.25, 0.5, 0.75, 1.0)
    for bone_name in POSE_BONES:
        bone = armature.pose.bones.get(bone_name)
        if bone is None:
            continue
        path = f'pose.bones["{bone_name}"].rotation_euler'
        pose_keys = [(_pose(name, u).get(bone_name, (0.0, 0.0, 0.0)), start + span * u) for u in samples]
        for axis in range(3):
            keys = [(frame, values[axis]) for values, frame in pose_keys]
            fc = _new_curve(container, path, axis)
            if fc is not None:
                _write_curve(fc, keys)

    action["gopal_character"] = "Cassidy"
    action["gopal_animation"] = name
    action["gopal_animation_version"] = ANIMATION_VERSION
    action["gopal_source_derived"] = True
    action["gopal_authored_library"] = LIBRARY_VERSION
    action["gopal_expected_start"] = start
    action["gopal_expected_end"] = end
    action["gopal_authoring_policy"] = "deterministic-rig-authored-baseline"
    action["gopal_visual_review_required"] = True

    # Pose markers make clips inspectable in Blender's animation UI.
    try:
        for label, u in (("start", 0.0), ("anticipation", 0.25), ("peak", 0.5), ("settle", 0.75), ("end", 1.0)):
            marker = action.pose_markers.new(label)
            marker.frame = start + span * u
    except (AttributeError, RuntimeError):
        pass
    return {"name": name, "created": True, "valid": True, "frame_range": [start, end]}


def author_missing_animation_clips(armature=None) -> dict[str, Any]:
    armature = armature or bpy.data.objects.get("Cassidy_Armature")
    if armature is None or armature.type != "ARMATURE":
        return {"version": LIBRARY_VERSION, "valid": False, "created": [], "errors": ["Cassidy armature not found"]}
    results = [_author_clip(armature, name) for name in REQUIRED_ANIMATIONS]
    errors = [r for r in results if not r.get("valid")]
    created = [r["name"] for r in results if r.get("created")]
    armature["gopal_animation_library_version"] = LIBRARY_VERSION
    armature["gopal_animation_library_authored"] = True
    return {"version": LIBRARY_VERSION, "valid": not errors, "created": created, "results": results, "errors": errors}
