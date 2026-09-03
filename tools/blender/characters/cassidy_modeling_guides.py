"""Reference-driven Cassidy modeling guides.

Guides contain no character geometry. Normalized checkpoints are measurement
aids only; they must never override the canonical character design.
"""

import bpy

from factory.bootstrap import ensure_collection
from factory.naming import require_name

GUIDE_VERSION = "3N.34"
GUIDE_COLLECTION = "CASSIDY_GUIDES"

PROPORTION_CHECKPOINTS = {
    "ground": 0.0,
    "foot": 0.035,
    "knee": 0.255,
    "hip": 0.495,
    "shoulder": 0.685,
    "neck": 0.765,
    "head_top": 1.0,
}

FACE_LANDMARKS = (
    "face_center", "brow_l", "brow_r", "eye_l", "eye_r", "nose_bridge",
    "nose_tip", "mouth_center", "chin", "jaw_l", "jaw_r",
)

VIEW_ANGLES = {
    "front": 0.0,
    "three-quarter-front": -45.0,
    "side": -90.0,
    "three-quarter-back": -135.0,
    "back": 180.0,
}


def _guide_collection():
    collection = ensure_collection(GUIDE_COLLECTION)
    collection["gopal_role"] = "reference-and-guides-only"
    collection["gopal_guide_version"] = GUIDE_VERSION
    return collection


def _empty(name, display_type="PLAIN_AXES"):
    require_name(name)
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        _guide_collection().objects.link(obj)
    obj.empty_display_type = display_type
    obj["gopal_character"] = "Cassidy"
    obj["gopal_guide_version"] = GUIDE_VERSION
    return obj


def ensure_centerline():
    guide = _empty("Cassidy_Model_Centerline")
    guide.location = (0.0, 0.0, 0.0)
    guide.empty_display_size = 2.4
    guide["gopal_guide"] = "symmetry-centerline"
    return guide


def ensure_proportion_checkpoints():
    guides = {}
    for name, height in PROPORTION_CHECKPOINTS.items():
        obj = _empty(f"Cassidy_Proportion_{name}")
        obj.location = (0.0, 0.0, height)
        obj.empty_display_size = 0.12
        obj["gopal_guide"] = "body-proportion-checkpoint"
        obj["gopal_normalized_height"] = height
        guides[name] = obj
    return guides


def ensure_facial_landmarks():
    landmarks = {}
    for name in FACE_LANDMARKS:
        obj = _empty(f"Cassidy_FaceGuide_{name}")
        obj.empty_display_size = 0.045
        obj["gopal_guide"] = "facial-landmark"
        obj["gopal_landmark"] = name
        landmarks[name] = obj
    return landmarks


def ensure_view_guides():
    views = {}
    for view, angle in VIEW_ANGLES.items():
        obj = _empty(f"Cassidy_ViewGuide_{view.replace('-', '_')}")
        obj.rotation_euler[2] = angle * 3.141592653589793 / 180.0
        obj.empty_display_size = 0.3
        obj["gopal_guide"] = "reference-view"
        obj["gopal_reference_view"] = view
        views[view] = obj
    return views


def prepare_modeling_guides():
    centerline = ensure_centerline()
    proportions = ensure_proportion_checkpoints()
    face = ensure_facial_landmarks()
    views = ensure_view_guides()
    scene = bpy.context.scene
    scene["gopal_cassidy_modeling_guides"] = GUIDE_VERSION
    scene["gopal_cassidy_geometry_policy"] = "authored-only"
    return {
        "version": GUIDE_VERSION,
        "centerline": centerline.name,
        "proportion_checkpoints": list(proportions),
        "facial_landmarks": list(face),
        "reference_views": list(views),
        "canonical_reference_required": True,
    }
