"""Deterministic Blender production-scene bootstrapper."""
from __future__ import annotations
import sys

FACTORY_VERSION = "3N.2"


def log(message: str) -> None:
    print(f"[GoPAL-FACTORY] {message}", flush=True)


def reset_scene() -> None:
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.name = "Scene"
    scene.render.engine = "BLENDER_WORKBENCH"
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures, bpy.data.actions):
        for item in list(block):
            block.remove(item)
    log("Scene reset to clean baseline")


def ensure_collection(name: str):
    import bpy
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def factory_info() -> dict:
    import bpy
    return {
        "factory_version": FACTORY_VERSION,
        "blender_version": bpy.app.version_string,
        "python_version": sys.version.split()[0],
        "scene": bpy.context.scene.name if bpy.context.scene else None,
    }


def initialize() -> dict:
    reset_scene()
    for name in ("CHARACTERS", "PROPS", "ENVIRONMENT", "CAMERAS", "LIGHTING"):
        ensure_collection(name)
    info = factory_info()
    log(f"Factory {FACTORY_VERSION} initialized")
    return info
