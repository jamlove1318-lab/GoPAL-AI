"""Unified Cassidy production gate.

Structural validation and visual/art review are both required before export.
Neither gate is allowed to silently substitute for the other.
"""

from characters.cassidy_quality import validate_authoring_environment
from characters.cassidy_rig import validate_rig_contract
from characters.cassidy_lod import validate_lods
from characters.cassidy_mobile_lod import validate_mobile_lod
from characters.cassidy_animation import validate_animation_contract
from characters.cassidy_animation_authoring import validate_animation_authoring
from characters.cassidy_mesh_quality import validate_authored_meshes
from characters.cassidy_modeling_tools import validate_modeling_readiness
from characters.cassidy_face_authoring import validate_face_nodes, validate_expression_shapes, validate_gaze_controls
from characters.cassidy_facial_rig_authoring import validate_facial_rig
from characters.cassidy_hair_charm import validate_hair_and_charm
from characters.cassidy_outfit_authoring import validate_outfit_contract, validate_material_slot_bindings
from characters.cassidy_review import validate_review_record, is_review_complete, REVIEW_VERSION


def _scene_review_record():
    import bpy
    record = bpy.context.scene.get("gopal_cassidy_review")
    return dict(record) if isinstance(record, dict) else None


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
    expressions = validate_expression_shapes()
    gaze = validate_gaze_controls()
    facial_rig = validate_facial_rig()
    hair_charm = validate_hair_and_charm()
    outfit = validate_outfit_contract()
    materials = validate_material_slot_bindings()
    review = validate_visual_review()

    checks = (
        (quality["valid"], "authoring environment or Cassidy semantic contract is incomplete"),
        (mesh["valid"], "authored Cassidy mesh quality gate has not passed"),
        (modeling["valid"], "modeling readiness gate has not passed"),
        (rig["body_rig_valid"], "required body rig bones are missing"),
        (rig["gaze_controls_valid"], "required eye/gaze controls are missing"),
        (lod["valid"], "required mobile LOD coverage is missing"),
        (mobile_lod["valid"], "mobile LOD budgets or identity preservation gate has not passed"),
        (animation["valid"], "required animation coverage is missing or empty"),
        (animation_authoring["valid"], "animation authoring quality gate has not passed"),
        (face_nodes["valid"], "required face/eye/eyelid nodes are missing"),
        (expressions["valid"], "required authored expression shapes are missing"),
        (gaze["valid"], "required authored gaze controls are missing"),
        (facial_rig["valid"], "facial rig contract has not passed"),
        (hair_charm["valid"], "hair or signature charm authoring gate has not passed"),
        (outfit["valid"], "outfit authoring contract has not passed"),
        (materials["valid"], "canonical material-slot binding gate has not passed"),
        (review["complete"], "visual review has not passed all Cassidy review gates"),
    )
    reasons = [reason for passed, reason in checks if not passed]
    return {"ready": not reasons, "reasons": reasons, "quality": quality,
            "mesh": mesh, "modeling": modeling, "rig": rig, "lod": lod,
            "mobile_lod": mobile_lod, "animation": animation,
            "animation_authoring": animation_authoring, "face_nodes": face_nodes,
            "expressions": expressions, "gaze": gaze, "facial_rig": facial_rig,
            "hair_charm": hair_charm, "outfit": outfit, "materials": materials,
            "review": review}
