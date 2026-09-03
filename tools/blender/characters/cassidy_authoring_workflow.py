"""Cassidy non-destructive Blender authoring workspace.

This module prepares an artist-facing workspace around the canonical reference
without generating a fake character. It is safe to run repeatedly and is
intended to be the reusable starting point for future GoPAL-AI characters.
"""

from pathlib import Path

import bpy

from factory.bootstrap import ensure_collection
from factory.naming import require_name

WORKFLOW_VERSION = "3N.16"
CANONICAL_REFERENCE = "file_00000000642c821198cbd141ddc7e8d7.png"
GUIDE_COLLECTION = "CASSIDY_GUIDES"
AUTHORING_COLLECTION = "CASSIDY_AUTHORED"


def _ensure_object(name: str, object_type: str = "EMPTY"):
    require_name(name)
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        ensure_collection(GUIDE_COLLECTION).objects.link(obj)
    obj.empty_display_type = object_type
    return obj


def _repo_root() -> Path:
    # tools/blender/characters/<file> -> repository root
    return Path(__file__).resolve().parents[3]


def resolve_canonical_reference(reference_path=None) -> Path:
    """Resolve the canonical concept from the repository or an explicit path."""
    if reference_path:
        path = Path(reference_path).expanduser().resolve()
    else:
        path = _repo_root() / CANONICAL_REFERENCE
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


def setup_authoring_collections():
    authored = ensure_collection(AUTHORING_COLLECTION)
    guides = ensure_collection(GUIDE_COLLECTION)
    authored["gopal_role"] = "real-authored-geometry-only"
    guides["gopal_role"] = "reference-and-guides-only"
    return authored, guides


def setup_symmetry_guide():
    """Create a named symmetry guide; it contains no character geometry."""
    guide = _ensure_object("Cassidy_Symmetry_Guide", "PLAIN_AXES")
    guide.empty_display_size = 2.0
    guide.location = (0.0, 0.0, 1.0)
    guide["gopal_guide"] = "centerline"
    guide["gopal_character"] = "Cassidy"
    return guide


def setup_reference_image(reference_path=None):
    """Load the canonical concept as an image empty when the binary is present."""
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


def prepare_cassidy_authoring_workspace(reference_path=None) -> dict:
    setup_scene_units()
    setup_authoring_collections()
    guide = setup_symmetry_guide()
    reference = setup_reference_image(reference_path)
    return {
        "workflow_version": WORKFLOW_VERSION,
        "character": "Cassidy",
        "geometry_policy": "authored-only",
        "guide": guide.name,
        "reference": reference,
        "authoring_collection": AUTHORING_COLLECTION,
    }


if __name__ == "__main__":
    result = prepare_cassidy_authoring_workspace()
    print("=== CASSIDY_AUTHORING_WORKSPACE_READY ===")
    print(result)
