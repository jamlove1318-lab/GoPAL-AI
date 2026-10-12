"""
GoPAL-AI Blender Production Factory - Scene Bootstrapper.
Provides clean, deterministic scene initialization.
"""

import sys
from pathlib import Path

FACTORY_VERSION = "3N.2"


def log(message: str) -> None:
    print(f"[GoPAL-FACTORY] {message}", flush=True)


def reset_scene() -> None:
    """Create a deterministic empty production scene."""
    import bpy

    bpy.ops.wm.read_factory_settings(use_empty=True)

    scene = bpy.context.scene
    scene.name = "Scene"
    scene.render.engine = 'BLENDER_WORKBENCH'

    # Clean any leftover orphan data blocks
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures, bpy.data.actions):
        for item in list(block):
            block.remove(item)

    log("Scene reset to clean baseline")


def ensure_collection(name: str):
    """Create or reuse a top-level production collection."""
    import bpy

    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)

    return collection


def factory_info() -> dict:
    """Collect runtime environment metadata."""
    import bpy

    return {
        "factory_version": FACTORY_VERSION,
        "blender_version": bpy.app.version_string,
        "python_version": sys.version.split()[0],
        "scene": bpy.context.scene.name if bpy.context.scene else None,
    }


def initialize() -> dict:
    """Initialize standard scene hierarchy with required collections."""
    reset_scene()

    ensure_collection("CHARACTERS")
    ensure_collection("PROPS")
    ensure_collection("ENVIRONMENT")
    ensure_collection("CAMERAS")
    ensure_collection("LIGHTING")

    info = factory_info()
    log(f"Factory {FACTORY_VERSION} initialized")
    log(f"Blender {info['blender_version']}")
    log(f"Python {info['python_version']}")

    return info


if __name__ == "__main__":
    initialize()
