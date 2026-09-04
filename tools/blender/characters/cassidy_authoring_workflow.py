"""Cassidy reference-driven authoring workspace (3N.18).

This workspace is intentionally geometry-free. It gives an artist or external
asset pipeline deterministic guides for building the hero mesh from the
approved concept/turnaround. It never fabricates a humanoid from primitives.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import bpy
from mathutils import Vector

from factory.bootstrap import ensure_collection
from factory.naming import require_name

WORKFLOW_VERSION = "3N.18"
CANONICAL_REFERENCE = "file_00000000642c821198cbd141ddc7e8d7.png"
GUIDE_COLLECTION = "CASSIDY_GUIDES"
AUTHORING_COLLECTION = "CASSIDY_AUTHORED"
LANDMARK_COLLECTION = "CASSIDY_LANDMARKS"

# Reference-driven target is deliberately expressed as checkpoints, not as
# synthetic body geometry. Values are normalized proportions for artist use.
PROPORTION_CHECKPOINTS = {
    "total_height_heads": 7.25,
    "head_width_ratio": 0.13,
    "shoulder_width_heads": 1.75,
    "pelvis_width_heads": 1.45,
    "hand_length_heads": 0.93,
    "foot_length_heads": 1.05,
    "eye_line_head_fraction": 0.46,
    "chin_to_chest_heads": 0.72,
}

FACIAL_LANDMARKS = (
    "brow_center",
    "eye_l",
    "eye_r",
    "nose_bridge",
    "nose_tip",
    "mouth_center",
    "chin",
    "jaw_l",
    "jaw_r",
    "ear_l",
    "ear_r",
)

BODY_LANDMARKS = (
    "head_top",
    "head_base",
    "neck_base",
    "shoulder_l",
    "shoulder_r",
    "chest_center",
    "waist_center",
    "pelvis_center",
    "hip_l",
    "hip_r",
    "elbow_l",
    "elbow_r",
    "wrist_l",
    "wrist_r",
    "hand_l",
    "hand_r",
    "knee_l",
    "knee_r",
    "ankle_l",
    "ankle_r",
    "heel_l",
    "heel_r",
)

VIEW_GUIDES = (
    "front",
    "three_quarter_front",
    "side",
    "three_quarter_back",
    "back",
)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def resolve_canonical_reference(reference_path=None) -> Path:
    path = Path(reference_path).expanduser().resolve() if reference_path else _repo_root() / CANONICAL_REFERENCE
    return path


def setup_scene_units() -> None:
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene["gopal_cassidy_authoring_workflow"] = WORKFLOW_VERSION
    scene["gopal_cassidy_reference"] = CANONICAL_REFERENCE
    scene["gopal_cassidy_geometry_policy"] = "authored-only"
    scene["gopal_cassidy_modeling_strategy"] = "reference-driven-hero-asset-assembly"


def setup_authoring_collections():
    authored = ensure_collection(AUTHORING_COLLECTION)
    guides = ensure_collection(GUIDE_COLLECTION)
    landmarks = ensure_collection(LANDMARK_COLLECTION)
    authored["gopal_role"] = "real-authored-geometry-only"
    guides["gopal_role"] = "reference-and-guides-only"
    landmarks["gopal_role"] = "reference-landmarks-only"
    return authored, guides, landmarks


def _ensure_empty(name: str, collection_name: str, display_type: str = "PLAIN_AXES", size: float = 0.05):
    require_name(name)
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        ensure_collection(collection_name).objects.link(obj)
    obj.empty_display_type = display_type
    obj.empty_display_size = size
    obj["gopal_character"] = "Cassidy"
    return obj


def setup_symmetry_guide():
    guide = _ensure_empty("Cassidy_Symmetry_Guide", GUIDE_COLLECTION, "PLAIN_AXES", 2.0)
    guide.location = (0.0, 0.0, 1.0)
    guide["gopal_guide"] = "centerline"
    guide["gopal_symmetry_axis"] = "X"
    guide["gopal_mirror_policy"] = "artist-authored-mesh-mirror-until-asymmetry-pass"
    return guide


def setup_reference_image(reference_path=None):
    path = resolve_canonical_reference(reference_path)
    if not path.is_file():
        return {"loaded": False, "path": str(path), "reason": "canonical reference not present"}

    image = bpy.data.images.get("Cassidy_Canonical_Concept")
    if image is None:
        image = bpy.data.images.load(str(path), check_existing=True)
        image.name = "Cassidy_Canonical_Concept"

    existing = bpy.data.objects.get("Cassidy_Canonical_Reference")
    if existing is None:
        existing = bpy.data.objects.new("Cassidy_Canonical_Reference", None)
        ensure_collection(GUIDE_COLLECTION).objects.link(existing)
    existing.empty_display_type = "IMAGE"
    existing.data = image
    existing.empty_display_size = 2.2
    existing.color[3] = 0.72
    existing["gopal_guide"] = "canonical-reference"
    existing["gopal_reference_version"] = "phase-1-approved-v1"
    return {"loaded": True, "path": str(path), "object": existing.name}


def setup_view_guides() -> dict[str, str]:
    result = {}
    for view in VIEW_GUIDES:
        obj = _ensure_empty(f"Cassidy_View_{view}", GUIDE_COLLECTION, "PLAIN_AXES", 0.35)
        obj["gopal_guide"] = "canonical-view"
        obj["gopal_view"] = view
        result[view] = obj.name
    return result


def setup_landmarks() -> dict[str, str]:
    result = {}
    all_landmarks = BODY_LANDMARKS + FACIAL_LANDMARKS
    for landmark in all_landmarks:
        obj = _ensure_empty(f"Cassidy_LM_{landmark}", LANDMARK_COLLECTION, "SPHERE", 0.025)
        obj["gopal_guide"] = "facial-landmark" if landmark in FACIAL_LANDMARKS else "body-landmark"
        obj["gopal_landmark"] = landmark
        obj["gopal_reference_only"] = True
        result[landmark] = obj.name
    return result


def setup_proportion_checkpoints() -> dict[str, Any]:
    scene = bpy.context.scene
    scene["gopal_cassidy_proportion_checkpoints"] = dict(PROPORTION_CHECKPOINTS)
    scene["gopal_cassidy_landmark_policy"] = "front-side-3quarter-reference-alignment"
    return dict(PROPORTION_CHECKPOINTS)


def setup_modeling_helpers() -> dict[str, Any]:
    """Describe non-destructive modifiers the authored mesh should receive.

    No modifier is attached here because there is intentionally no generated
    character geometry. The metadata lets the eventual hero asset importer
    configure Mirror/Subdivision consistently after real mesh data arrives.
    """
    scene = bpy.context.scene
    helpers = {
        "mirror": {"axis": "X", "merge": True, "clip": True},
        "subdivision": {"levels_viewport": 2, "levels_render": 2, "type": "CATMULL_CLARK"},
        "smooth_normals": True,
        "auto_smooth_policy": "weighted-or-geometry-normals-on-authored-mesh",
    }
    scene["gopal_cassidy_modeling_helpers"] = helpers
    return helpers


def validate_authoring_workspace() -> dict[str, Any]:
    required = [
        "Cassidy_Symmetry_Guide",
        "Cassidy_Canonical_Reference",
        *[f"Cassidy_View_{view}" for view in VIEW_GUIDES],
        *[f"Cassidy_LM_{name}" for name in BODY_LANDMARKS + FACIAL_LANDMARKS],
    ]
    missing = [name for name in required if bpy.data.objects.get(name) is None]
    return {
        "version": WORKFLOW_VERSION,
        "valid": not missing,
        "missing": missing,
        "geometry_created": False,
        "geometry_policy": "authored-only",
        "landmark_count": len(BODY_LANDMARKS) + len(FACIAL_LANDMARKS),
        "view_count": len(VIEW_GUIDES),
        "proportion_checkpoint_count": len(PROPORTION_CHECKPOINTS),
    }


def prepare_cassidy_authoring_workspace(reference_path=None) -> dict[str, Any]:
    setup_scene_units()
    setup_authoring_collections()
    guide = setup_symmetry_guide()
    reference = setup_reference_image(reference_path)
    views = setup_view_guides()
    landmarks = setup_landmarks()
    proportions = setup_proportion_checkpoints()
    helpers = setup_modeling_helpers()
    validation = validate_authoring_workspace()
    return {
        "workflow_version": WORKFLOW_VERSION,
        "character": "Cassidy",
        "geometry_policy": "authored-only",
        "guide": guide.name,
        "reference": reference,
        "views": views,
        "landmarks": landmarks,
        "proportion_checkpoints": proportions,
        "modeling_helpers": helpers,
        "authoring_collection": AUTHORING_COLLECTION,
        "validation": validation,
    }


if __name__ == "__main__":
    result = prepare_cassidy_authoring_workspace()
    print("=== CASSIDY_REFERENCE_DRIVEN_WORKSPACE_READY ===")
    print(result)
