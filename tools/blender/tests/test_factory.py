"""Headless smoke test for the Blender production factory."""

import bpy

from factory.bootstrap import initialize
from factory.validation import validate_production_scene


info = initialize()
assert info["factory_version"]
assert bpy.data.collections.get("CHARACTERS") is not None
assert bpy.data.collections.get("ENVIRONMENT") is not None
assert validate_production_scene() == []

print("=== GOPAL_FACTORY_SMOKE_TEST_OK ===")
