"""Reusable Cassidy animation contract.

Animation clips are authored on the real rig. This module validates and
annotates authored actions; it never fabricates finished character motion.
"""

import bpy

from .cassidy import REQUIRED_ANIMATIONS
from .cassidy_rig import BODY_BONES, find_cassidy_armature

ANIMATION_VERSION = "3N.15"

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


def _iter_action_fcurves(action):
    """Yield F-curves across Blender 3.x/4.x/5.x Action APIs.

    Blender 5.x stores animation curves inside layered Action channel bags;
    the legacy ``action.fcurves`` collection no longer exists. Keep the
    contract API stable while supporting both representations.
    """
    direct = getattr(action, "fcurves", None)
    if direct is not None:
        yield from direct
        return

    layers = getattr(action, "layers", None)
    if layers is None:
        return

    for layer in layers:
        strips = getattr(layer, "strips", None)
        if strips is None:
            continue
        for strip in strips:
            bags = getattr(strip, "channelbags", None)
            if bags is not None:
                for bag in bags:
                    yield from getattr(bag, "fcurves", [])
                continue

            channelbag = getattr(strip, "channelbag", None)
            if not callable(channelbag):
                continue

            # Blender 5.x normally requires an ActionSlot argument. Try the
            # explicit slots first; fall back gracefully on older variants.
            slots = getattr(action, "slots", None)
            if slots is not None:
                for slot in slots:
                    try:
                        bag = channelbag(slot)
                    except (TypeError, RuntimeError):
                        continue
                    if bag is not None:
                        yield from getattr(bag, "fcurves", [])
            else:
                try:
                    bag = channelbag()
                except (TypeError, RuntimeError):
                    bag = None
                if bag is not None:
                    yield from getattr(bag, "fcurves", [])


def _action_fcurve_count(action) -> int:
    return sum(1 for _ in _iter_action_fcurves(action))


def collect_animation_names():
    return {action.name for action in bpy.data.actions}


def _action_bone_names(action) -> set[str]:
    """Return bone names targeted by pose-bone F-curves in an action."""
    names = set()
    for fcurve in _iter_action_fcurves(action):
        path = fcurve.data_path
        if not path.startswith('pose.bones['):
            continue
        marker = 'pose.bones["'
        if marker not in path:
            continue
        remainder = path.split(marker, 1)[1]
        bone_name = remainder.split('"]', 1)[0]
        if bone_name:
            names.add(bone_name)
    return names


def _is_meaningful_action(action, armature) -> bool:
    """Require authored motion to target Cassidy's actual rig bones."""
    if action is None or _action_fcurve_count(action) == 0 or armature is None:
        return False
    targeted = _action_bone_names(action)
    if not targeted:
        return False
    rig_bones = {bone.name for bone in armature.data.bones}
    return bool(targeted & rig_bones)


def validate_animation_contract(armature=None) -> dict:
    armature = armature or find_cassidy_armature()
    names = collect_animation_names()
    missing = sorted(set(REQUIRED_ANIMATIONS) - names)
    empty = sorted(
        name for name in REQUIRED_ANIMATIONS
        if name in names and _action_fcurve_count(bpy.data.actions[name]) == 0
    )
    unbound = sorted(
        name for name in REQUIRED_ANIMATIONS
        if name in names and not _is_meaningful_action(bpy.data.actions[name], armature)
    )
    return {
        "valid": not missing and not empty and not unbound,
        "missing_animations": missing,
        "empty_animations": empty,
        "unbound_animations": unbound,
        "coverage": len(REQUIRED_ANIMATIONS) - len(missing),
        "required": len(REQUIRED_ANIMATIONS),
        "rig_found": armature is not None,
        "rig_bone_targets": sorted(
            set().union(*(
                _action_bone_names(bpy.data.actions[name])
                for name in REQUIRED_ANIMATIONS
                if name in names
            ))
        ) if any(name in names for name in REQUIRED_ANIMATIONS) else [],
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
