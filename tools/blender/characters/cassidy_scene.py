"""Reusable Cassidy production scene scaffolding.

This module creates only semantic production anchors and metadata. It never
pretends that primitive geometry is the finished Cassidy character.
"""

import bpy

from factory.bootstrap import ensure_collection
from factory.naming import require_name


ANCHORS = (
    "Cassidy_Root",
    "Cassidy_Body",
    "Cassidy_Head",
    "Cassidy_Face",
    "Cassidy_Eye_L",
    "Cassidy_Eye_R",
    "Cassidy_Eyelid_L",
    "Cassidy_Eyelid_R",
    "Cassidy_Hand_L",
    "Cassidy_Hand_R",
    "Cassidy_Charm",
    "Cassidy_Hair_Root",
)


def _empty(name: str, parent=None):
    require_name(name)
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        ensure_collection("CHARACTERS").objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def build_cassidy_anchor_rig():
    """Create deterministic semantic anchors for the real authored asset."""
    root = _empty("Cassidy_Root")
    body = _empty("Cassidy_Body", root)
    head = _empty("Cassidy_Head", body)
    face = _empty("Cassidy_Face", head)
    eye_l = _empty("Cassidy_Eye_L", face)
    eye_r = _empty("Cassidy_Eye_R", face)
    _empty("Cassidy_Eyelid_L", eye_l)
    _empty("Cassidy_Eyelid_R", eye_r)
    _empty("Cassidy_Hand_L", body)
    _empty("Cassidy_Hand_R", body)
    _empty("Cassidy_Charm", body)
    _empty("Cassidy_Hair_Root", head)
    return root


def attach_production_metadata():
    scene = bpy.context.scene
    scene["gopal_character"] = "Cassidy"
    scene["gopal_identity_locked"] = True
    scene["gopal_canonical_reference"] = "file_00000000642c821198cbd141ddc7e8d7.png"
    scene["gopal_asset_status"] = "anchor-scaffold-only"
    scene["gopal_warning"] = "Real authored geometry required before production export."


def build_scene():
    root = build_cassidy_anchor_rig()
    attach_production_metadata()
    return root
