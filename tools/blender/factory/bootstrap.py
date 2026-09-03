"""
GoPAL-AI Blender Production Factory.

Reusable Blender-side infrastructure. Project identity contracts remain in
GoPAL-AI TypeScript and are consumed by character-specific adapters.
"""

import bpy
import sys

FACTORY_VERSION = "3N.1"
COLLECTIONS = ("CHARACTERS", "PROPS", "ENVIRONMENT", "CAMERAS", "LIGHTING")


def log(message: str) -> None:
    print(f"[GoPAL-FACTORY] {message}")


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    log("Scene reset")


def ensure_collection(name: str):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def initialize() -> dict:
    reset_scene()
    for name in COLLECTIONS:
        ensure_collection(name)

    info = {
        "factory_version": FACTORY_VERSION,
        "blender_version": bpy.app.version_string,
        "python_version": sys.version.split()[0],
        "scene": bpy.context.scene.name,
    }
    log(f"Factory {FACTORY_VERSION} initialized")
    log(f"Blender {info['blender_version']}")
    log(f"Python {info['python_version']}")
    return info


if __name__ == "__main__":
    initialize()
