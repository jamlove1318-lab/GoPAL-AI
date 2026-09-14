"""Reusable Cassidy source-asset intake for the Blender production factory.

This module imports a genuine external Cassidy source asset into the current
production scene. It never creates replacement character geometry.

Supported sources:
  * .blend -- preferred when preserving shape keys, actions, rig data, and
    Blender-native authoring information matters.
  * .glb/.gltf -- useful for interchange when a native .blend is unavailable.

The source remains an intake artifact. Strict production gates still decide
whether the result is releasable.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any
import os
import shutil
import sys

import bpy

SOURCE_COLLECTION = "CASSIDY_SOURCE_MODEL"
CHARACTER_NAME = "Cassidy"


def _collection() -> bpy.types.Collection:
    collection = bpy.data.collections.get(SOURCE_COLLECTION)
    if collection is None:
        collection = bpy.data.collections.new(SOURCE_COLLECTION)
        bpy.context.scene.collection.children.link(collection)
    return collection


def _unlink_from_other_collections(obj: bpy.types.Object) -> None:
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)


def _mark_imported(imported: list[bpy.types.Object]) -> None:
    collection = _collection()
    for obj in imported:
        _unlink_from_other_collections(obj)
        collection.objects.link(obj)
        obj["gopal_character"] = CHARACTER_NAME
        obj["gopal_asset_stage"] = "external-source-intake"
        obj["gopal_authored_geometry_required"] = True


def _remove_previous_source_objects() -> None:
    collection = bpy.data.collections.get(SOURCE_COLLECTION)
    if collection is None:
        return
    for obj in list(collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def import_blend(path: Path) -> dict[str, Any]:
    """Append source datablocks without replacing the deterministic factory scene."""
    _remove_previous_source_objects()
    before_actions = set(bpy.data.actions)
    before_objects = set(bpy.data.objects)

    with bpy.data.libraries.load(str(path), link=False) as (data_from, data_to):
        data_to.objects = list(data_from.objects)
        data_to.actions = list(data_from.actions)
        data_to.armatures = list(data_from.armatures)
        data_to.meshes = list(data_from.meshes)
        data_to.materials = list(data_from.materials)
        data_to.cameras = list(data_from.cameras)
        data_to.lights = list(data_from.lights)

    imported: list[bpy.types.Object] = []
    for obj in data_to.objects:
        if obj is None:
            continue
        if obj.name not in bpy.data.objects:
            bpy.context.scene.collection.objects.link(obj)
        imported.append(obj)

    if not imported:
        raise RuntimeError("Cassidy .blend intake completed without importing objects")

    _mark_imported(imported)

    scene = bpy.context.scene
    scene["gopal_cassidy_source_model"] = str(path)
    scene["gopal_cassidy_source_model_bytes"] = path.stat().st_size
    scene["gopal_cassidy_source_format"] = "blend"
    scene["gopal_cassidy_source_stage"] = "external-source-intake"

    meshes = [obj for obj in imported if obj.type == "MESH"]
    armatures = [obj for obj in imported if obj.type == "ARMATURE"]
    new_actions = [action for action in bpy.data.actions if action not in before_actions]
    return {
        "source": str(path),
        "format": "blend",
        "bytes": path.stat().st_size,
        "imported_objects": len(imported),
        "meshes": len(meshes),
        "armatures": len(armatures),
        "actions_imported": len(new_actions),
        "objects_preexisting": len(before_objects),
        "collection": SOURCE_COLLECTION,
        "status": "IMPORTED_FOR_PRODUCTION_CLEANUP",
    }


def import_gltf(path: Path) -> dict[str, Any]:
    _remove_previous_source_objects()
    before = set(bpy.data.objects)
    result = bpy.ops.import_scene.gltf(filepath=str(path))
    if "FINISHED" not in result:
        raise RuntimeError(f"Blender GLTF import failed: {result}")

    imported = [obj for obj in bpy.data.objects if obj not in before]
    if not imported:
        raise RuntimeError("GLTF import completed without importing any objects")

    _mark_imported(imported)
    scene = bpy.context.scene
    scene["gopal_cassidy_source_model"] = str(path)
    scene["gopal_cassidy_source_model_bytes"] = path.stat().st_size
    scene["gopal_cassidy_source_format"] = path.suffix.lower().lstrip(".")
    scene["gopal_cassidy_source_stage"] = "external-source-intake"

    meshes = [obj for obj in imported if obj.type == "MESH"]
    armatures = [obj for obj in imported if obj.type == "ARMATURE"]
    return {
        "source": str(path),
        "format": path.suffix.lower().lstrip("."),
        "bytes": path.stat().st_size,
        "imported_objects": len(imported),
        "meshes": len(meshes),
        "armatures": len(armatures),
        "actions_available": len(bpy.data.actions),
        "collection": SOURCE_COLLECTION,
        "status": "IMPORTED_FOR_PRODUCTION_CLEANUP",
    }


def import_source(path: str | Path, snapshot_dir: str | Path | None = None) -> dict[str, Any]:
    source = Path(path).expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Cassidy source asset not found: {source}")
    if source.stat().st_size <= 0:
        raise ValueError("Cassidy source asset is empty")

    suffix = source.suffix.lower()
    if suffix == ".blend":
        report = import_blend(source)
    elif suffix in {".glb", ".gltf"}:
        report = import_gltf(source)
    else:
        raise ValueError("Cassidy source asset must be .blend, .glb, or .gltf")

    if snapshot_dir:
        destination = Path(snapshot_dir).expanduser().resolve()
        destination.mkdir(parents=True, exist_ok=True)
        snapshot = destination / f"cassidy-source{suffix}"
        if snapshot.resolve() != source:
            shutil.copy2(source, snapshot)
        report["snapshot"] = str(snapshot)

    print("=== CASSIDY_REAL_SOURCE_IMPORTED ===")
    for key, value in report.items():
        print(f"{key}: {value}")
    return report


def intake_from_environment(snapshot_dir: str | Path | None = None) -> dict[str, Any] | None:
    """Import CASSIDY_SOURCE_BLEND when supplied; do nothing when unset."""
    raw = os.environ.get("CASSIDY_SOURCE_BLEND", "").strip()
    if not raw:
        return None
    return import_source(raw, snapshot_dir=snapshot_dir)


def main() -> int:
    args = sys.argv
    if "--" not in args:
        raise RuntimeError("Pass the source path after '--'.")
    values = args[args.index("--") + 1:]
    if len(values) != 1:
        raise RuntimeError("Pass exactly one .blend, .glb, or .gltf source asset.")
    import_source(values[0])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
