"""Import a genuine Cassidy source GLB/GLTF into the production workspace.

This is intentionally an intake tool, not a character generator. It never creates
placeholder human geometry. A real external 3D asset must be supplied first.

Usage from Blender background mode:
    blender --background --python tools/blender/characters/import_cassidy_source.py -- \
        /absolute/path/to/cassidy_model_generated_v1.glb

The imported asset is placed in CASSIDY_SOURCE_MODEL and marked for the existing
Cassidy authoring/validation pipeline. Cleanup, topology, rigging, facial controls,
animation and LOD work remain real production steps.
"""

from pathlib import Path
import sys

import bpy


SOURCE_COLLECTION = "CASSIDY_SOURCE_MODEL"
CHARACTER_NAME = "Cassidy"


def _argument_path() -> Path:
    args = sys.argv
    if "--" not in args:
        raise RuntimeError("Missing source model path. Pass it after '--'.")
    values = args[args.index("--") + 1:]
    if len(values) != 1:
        raise RuntimeError("Pass exactly one .glb or .gltf source model path.")
    path = Path(values[0]).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Cassidy source model not found: {path}")
    if path.suffix.lower() not in {".glb", ".gltf"}:
        raise ValueError("Cassidy source model must be .glb or .gltf")
    if path.stat().st_size <= 0:
        raise ValueError("Cassidy source model is empty")
    return path


def _collection() -> bpy.types.Collection:
    collection = bpy.data.collections.get(SOURCE_COLLECTION)
    if collection is None:
        collection = bpy.data.collections.new(SOURCE_COLLECTION)
        bpy.context.scene.collection.children.link(collection)
    return collection


def _unlink_from_other_collections(obj: bpy.types.Object) -> None:
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)


def import_source(path: Path) -> dict:
    collection = _collection()
    before = set(bpy.data.objects)

    result = bpy.ops.import_scene.gltf(filepath=str(path))
    if "FINISHED" not in result:
        raise RuntimeError(f"Blender GLTF import failed: {result}")

    imported = [obj for obj in bpy.data.objects if obj not in before]
    if not imported:
        raise RuntimeError("GLTF import completed without importing any objects")

    for obj in imported:
        _unlink_from_other_collections(obj)
        collection.objects.link(obj)
        obj["gopal_character"] = CHARACTER_NAME
        obj["gopal_asset_stage"] = "external-source-intake"
        obj["gopal_authored_geometry_required"] = True

    bpy.context.scene["gopal_cassidy_source_model"] = str(path)
    bpy.context.scene["gopal_cassidy_source_model_bytes"] = path.stat().st_size
    bpy.context.scene["gopal_cassidy_source_stage"] = "external-source-intake"

    meshes = [obj for obj in imported if obj.type == "MESH"]
    armatures = [obj for obj in imported if obj.type == "ARMATURE"]
    return {
        "source": str(path),
        "bytes": path.stat().st_size,
        "imported_objects": len(imported),
        "meshes": len(meshes),
        "armatures": len(armatures),
        "collection": SOURCE_COLLECTION,
        "status": "IMPORTED_FOR_PRODUCTION_CLEANUP",
    }


def main() -> dict:
    path = _argument_path()
    report = import_source(path)
    print("=== CASSIDY_REAL_SOURCE_IMPORTED ===")
    for key, value in report.items():
        print(f"{key}: {value}")
    print("Next: inspect and clean the real mesh; do not substitute primitives.")
    return report


if __name__ == "__main__":
    main()
