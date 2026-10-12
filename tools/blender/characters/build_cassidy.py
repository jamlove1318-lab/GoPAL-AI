"""Cassidy production build entrypoint.

The build prepares a deterministic workspace, optionally ingests a genuine
Cassidy source asset, and then runs the strict production gates. It never
creates fake finished humanoid geometry.
"""

from __future__ import annotations

import bpy
from pathlib import Path

from factory.bootstrap import initialize
from factory.validation import validate_production_scene
from characters.cassidy import validate_cassidy_scene
from characters.cassidy_manifest import production_manifest
from characters.cassidy_authoring import prepare_authoring_environment
from characters.cassidy_authoring_workflow import prepare_cassidy_authoring_workspace
from characters.cassidy_authoring_checklist import authoring_handoff_checklist, validate_checklist
from characters.cassidy_production_gate import evaluate_production_readiness
from characters.cassidy_staging import prepare_staging_scene
from characters.cassidy_review import ensure_scene_review_record
from characters.import_cassidy_source import intake_from_environment


def _source_snapshot_dir() -> Path:
    return Path.cwd() / "build" / "cassidy" / "source"


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

    # Source intake happens after the deterministic reset and before authoring
    # workspace preparation. The source is preserved locally and remains
    # subject to every existing quality/acceptance gate.
    source_intake = intake_from_environment(_source_snapshot_dir())

    authoring = prepare_authoring_environment()
    workspace = prepare_cassidy_authoring_workspace()
    staging = prepare_staging_scene()
    review = ensure_scene_review_record()
    checklist = authoring_handoff_checklist()
    checklist_validation = validate_checklist(checklist)
    return {
        **info,
        "source_intake": source_intake,
        "authoring": authoring,
        "workspace": workspace,
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
