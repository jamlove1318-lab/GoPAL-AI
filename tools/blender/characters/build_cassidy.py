"""Cassidy production build entrypoint.

This intentionally does not generate a fake finished humanoid. It prepares a
clean, deterministic production scene and validates that a real authored asset
has been supplied before export.
"""

import bpy

from factory.bootstrap import initialize
from factory.validation import validate_production_scene
from characters.cassidy import validate_cassidy_scene
from characters.cassidy_manifest import production_manifest


def prepare_scene() -> dict:
    info = initialize()
    character_collection = bpy.data.collections.get("CHARACTERS")
    if character_collection is None:
        raise RuntimeError("CHARACTERS collection was not created")
    scene = bpy.context.scene
    scene["gopal_asset"] = "Cassidy"
    scene["gopal_manifest_version"] = production_manifest()["version"]
    scene["gopal_canonical_reference"] = production_manifest()["canonical_reference"]
    return info


def validate_before_export() -> dict:
    generic_errors = validate_production_scene()
    cassidy = validate_cassidy_scene()
    return {
        "generic_errors": generic_errors,
        "cassidy": cassidy,
        "ready": not generic_errors and cassidy["valid"],
    }


def main() -> dict:
    prepare_scene()
    report = validate_before_export()
    if not report["ready"]:
        print("[Cassidy] Production asset not yet ready; export blocked.")
    else:
        print("[Cassidy] Production asset passed structural validation.")
    return report


if __name__ == "__main__":
    main()
