"""Cassidy production build entrypoint.

The build prepares a reference-driven authoring workspace and an authored-asset
assembly layer. It never generates a fake finished humanoid from primitives.
"""

import bpy

from factory.bootstrap import initialize
from factory.validation import validate_production_scene
from characters.cassidy import validate_cassidy_scene
from characters.cassidy_manifest import production_manifest
from characters.cassidy_authoring import prepare_authoring_environment
from characters.cassidy_authoring_workflow import prepare_cassidy_authoring_workspace
from characters.cassidy_asset_assembler import assemble_authored_assets
from characters.cassidy_authoring_checklist import authoring_handoff_checklist, validate_checklist
from characters.cassidy_production_gate import evaluate_production_readiness
from characters.cassidy_hero_asset_contract import validate_hero_asset_contract
from characters.cassidy_staging import prepare_staging_scene
from characters.cassidy_review import ensure_scene_review_record


def prepare_scene() -> dict:
    info = initialize()
    character_collection = bpy.data.collections.get("CHARACTERS")
    if character_collection is None:
        raise RuntimeError("CHARACTERS collection was not created")
    scene = bpy.context.scene
    manifest = production_manifest()
    scene["gopal_asset"] = "Cassidy"
    scene["gopal_manifest_version"] = manifest["version"]
    scene["gopal_canonical_reference"] = manifest["canonical_reference"]
    authoring = prepare_authoring_environment()
    workspace = prepare_cassidy_authoring_workspace()
    assembly = assemble_authored_assets()
    staging = prepare_staging_scene()
    review = ensure_scene_review_record()
    checklist = authoring_handoff_checklist()
    checklist_validation = validate_checklist(checklist)
    hero_contract = validate_hero_asset_contract()
    return {
        **info,
        "authoring": authoring,
        "workspace": workspace,
        "assembly": assembly,
        "hero_asset_contract": hero_contract,
        "staging": staging,
        "review": review,
        "authoring_checklist": checklist,
        "authoring_checklist_validation": checklist_validation,
    }


def validate_before_export() -> dict:
    generic_errors = validate_production_scene()
    cassidy = validate_cassidy_scene()
    quality = evaluate_production_readiness()
    return {
        "generic_errors": generic_errors,
        "cassidy": cassidy,
        "quality": quality,
        "ready": not generic_errors and quality["ready"],
    }


def main() -> dict:
    info = prepare_scene()
    report = validate_before_export()
    report["factory"] = info
    if not report["ready"]:
        print("[Cassidy] Production asset not yet ready; export blocked.")
    else:
        print("[Cassidy] Production asset passed all structural and visual gates.")
    return report


if __name__ == "__main__":
    main()
