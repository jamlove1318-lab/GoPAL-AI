"""Reusable Cassidy authoring-stage infrastructure.

This module prepares a clean, review-friendly Blender stage for the real
character asset. It creates cameras, reference guides, and semantic staging
markers only; it never fabricates Cassidy geometry.
"""

import bpy
from mathutils import Vector

from factory.bootstrap import ensure_collection
from factory.naming import require_name

STAGE_VERSION = "3N.12"
REFERENCE_VIEWS = (
    "front",
    "three-quarter-front",
    "side",
    "three-quarter-back",
    "back",
)


def _object(name: str, obj_type="EMPTY"):
    require_name(name)
    obj = bpy.data.objects.get(name)
    if obj is None:
        if obj_type == "CAMERA":
            data = bpy.data.cameras.new(name)
            obj = bpy.data.objects.new(name, data)
        else:
            obj = bpy.data.objects.new(name, None)
        ensure_collection("CAMERAS" if obj_type == "CAMERA" else "ENVIRONMENT").objects.link(obj)
    return obj


def ensure_stage_markers():
    markers = {}
    for view in REFERENCE_VIEWS:
        name = f"Cassidy_Reference_{view.replace('-', '_')}"
        marker = _object(name)
        marker["gopal_character"] = "Cassidy"
        marker["gopal_reference_view"] = view
        marker["gopal_stage_version"] = STAGE_VERSION
        markers[view] = marker
    return markers


def ensure_review_cameras():
    cameras = {}
    positions = {
        "front": (0.0, -3.2, 1.45),
        "three-quarter-front": (2.25, -2.25, 1.45),
        "side": (3.2, 0.0, 1.45),
        "three-quarter-back": (2.25, 2.25, 1.45),
        "back": (0.0, 3.2, 1.45),
    }
    for view, location in positions.items():
        name = f"Cassidy_Camera_{view.replace('-', '_')}"
        camera = _object(name, "CAMERA")
        camera.location = Vector(location)
        camera.data.lens = 55
        camera.data.clip_start = 0.01
        camera.data.clip_end = 100
        camera["gopal_character"] = "Cassidy"
        camera["gopal_reference_view"] = view
        camera["gopal_stage_version"] = STAGE_VERSION
        cameras[view] = camera
    return cameras


def configure_stage_metadata():
    scene = bpy.context.scene
    scene["gopal_cassidy_stage_version"] = STAGE_VERSION
    scene["gopal_stage_purpose"] = "real-authored-character-review"
    scene["gopal_reference_views"] = REFERENCE_VIEWS
    scene["gopal_geometry_policy"] = "authored-only"


def prepare_staging_scene():
    ensure_collection("CAMERAS")
    ensure_collection("ENVIRONMENT")
    markers = ensure_stage_markers()
    cameras = ensure_review_cameras()
    configure_stage_metadata()
    return {"markers": markers, "cameras": cameras, "version": STAGE_VERSION}
