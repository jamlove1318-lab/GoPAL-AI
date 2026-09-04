"""Unified Cassidy production gate.

Structural validation and visual/art review are both required before export.
Validation must report every missing authored dependency instead of throwing on
an absent optional in-progress asset, so the production report is actionable.
"""

from collections.abc import Mapping

from characters.cassidy_quality import validate_authoring_environment
from characters.cassidy_rig import validate_rig_contract
from characters.cassidy_lod import validate_lods
from characters.cassidy_mobile_lod import validate_mobile_lod
from characters.cassidy_animation import validate_animation_contract
from characters.cassidy_animation_authoring import validate_animation_authoring
from characters.cassidy_mesh_quality import validate_authored_meshes
from characters.cassidy_modeling_tools import validate_modeling_readiness
from characters.cassidy_face_authoring import (
    validate_face_nodes,
    ensure_expression_contract,
    ensure_gaze_contract,
    EXPRESSION_CONTROLS,
)
from characters.cassidy_facial_rig_authoring import validate_facial_rig
from characters.cassidy_hair_charm import validate_hair_and_charm
from characters.cassidy_outfit_authoring import validate_outfit_material_readiness
from characters.cassidy_review import validate_review_record, is_review_complete, REVIEW_VERSION


def _scene_review_record():
    import bpy
    record = bpy.context.scene.get("gopal_cassidy_review")
    return dict(record) if isinstance(record, Mapping) else None


def validate_visual_review() -> dict:
    record = _scene_review_record()
    if record is None:
        return {"valid": False, "complete": False, "version": REVIEW_VERSION,
                "errors": ["Cassidy visual review record is missing."]}
    validation = validate_review_record(record)
    complete = is_review_complete(record)
    errors = list(validation["errors"])
    if validation["valid"] and not complete:
        errors.append("Every Cassidy visual review gate must pass before export.")
    return {"valid": validation["valid"], "complete": complete,
            "version": record.get("version"), "errors": errors}


def _face_expression_result() -> dict:
    """Return a deterministic missing-face result instead of raising."""
    import bpy
    face = bpy.data.objects.get("Cassidy_Face")
    if face is None or face.type != "MESH":
        return {
            "valid": False,
            "missing": [f"expression_{name}" for name in EXPRESSION_CONTROLS],
            "found": [],
            "error": "Expression contract requires the authored face mesh",
        }
    return ensure_expression_contract(face)


def _face_gaze_result() -> dict:
    """Return a deterministic missing-armature result instead of raising."""
    import bpy
    armature = next((obj for obj in bpy.data.objects if obj.type == "ARMATURE"), None)
    return ensure_gaze_contract(armature)


def evaluate_production_readiness() -> dict:
    quality = validate_authoring_environment()
    mesh = validate_authored_meshes()
    modeling = validate_modeling_readiness()
    rig = validate_rig_contract()
    lod = validate_lods()
    mobile_lod = validate_mobile_lod()
    animation = validate_animation_contract()
    animation_authoring = validate_animation_authoring()
    face_nodes = validate_face_nodes()
    expressions = _face_expression_result()
    gaze = _face_gaze_result()
    facial_rig = validate_facial_rig()
    hair_charm = validate_hair_and_charm()
    outfit = validate_outfit_material_readiness()
    review = validate_visual_review()

    checks = (
        (quality.get("valid", False), "authoring environment or Cassidy semantic contract is incomplete"),
        (mesh.get("valid", False), "authored Cassidy mesh quality gate has not passed"),
        (modeling.get("valid", False), "modeling readiness gate has not passed"),
        (rig.get("body_rig_valid", False), "required body rig bones are missing"),
        (rig.get("gaze_controls_valid", False), "required eye/gaze controls are missing"),
        (lod.get("valid", False), "required mobile LOD coverage is missing"),
        (mobile_lod.get("valid", False), "mobile LOD budgets or identity preservation gate has not passed"),
        (animation.get("valid", False), "required animation coverage is missing or empty"),
        (animation_authoring.get("valid", False), "animation authoring quality gate has not passed"),
        (face_nodes.get("valid", False), "required face/eye/eyelid nodes are missing"),
        (expressions.get("valid", False), "required authored expression shapes are missing"),
        (gaze.get("valid", False), "required authored gaze controls are missing"),
        (facial_rig.get("valid", False), "facial rig contract has not passed"),
        (hair_charm.get("valid", False), "hair or signature charm authoring gate has not passed"),
        (outfit.get("valid", False), "outfit/material authoring gate has not passed"),
        (review.get("complete", False), "visual review has not passed all Cassidy review gates"),
    )
    reasons = [reason for passed, reason in checks if not passed]
    return {
        "ready": not reasons,
        "reasons": reasons,
        "quality": quality,
        "mesh": mesh,
        "modeling": modeling,
        "rig": rig,
        "lod": lod,
        "mobile_lod": mobile_lod,
        "animation": animation,
        "animation_authoring": animation_authoring,
        "face_nodes": face_nodes,
        "expressions": expressions,
        "gaze": gaze,
        "facial_rig": facial_rig,
        "hair_charm": hair_charm,
        "outfit": outfit,
        "review": review,
    }
