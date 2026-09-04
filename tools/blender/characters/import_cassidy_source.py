"""Import and preserve a genuine Cassidy source asset.

This module is deliberately conservative: it may import an externally authored
source and tag the selected source object as a reusable base component, but it
does not modify the source file, invent geometry, assign Cassidy identity from
visual similarity, or approve visual quality.
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

import bpy

from .cassidy_hero_asset_contract import mark_authored_asset

SOURCE_COLLECTION = "CASSIDY_SOURCE_MODEL"
CHARACTER_NAME = "Cassidy"
SOURCE_SNAPSHOT = Path("build/cassidy/source/cassidy-source.blend")
DEFAULT_CANDIDATE_REPORT = Path("artifacts/cassidy/free-base-source/cassidy-base-candidate-report.json")
BASE_COMPONENT_ID = "cassidy-body-base"


def _argument_path() -> Path | None:
    args = sys.argv
    values = args[args.index("--") + 1:] if "--" in args else []
    if not values:
        return None
    if len(values) != 1:
        raise RuntimeError("Pass exactly one .blend, .glb or .gltf source asset path after '--'.")
    path = Path(values[0]).expanduser().resolve()
    _validate_source_path(path)
    return path


def _validate_source_path(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(f"Cassidy source asset not found: {path}")
    if path.suffix.lower() not in {".blend", ".glb", ".gltf"}:
        raise ValueError("Cassidy source asset must be .blend, .glb or .gltf")


def _workspace_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _candidate_report_path(workspace_dir: Path) -> Path:
    raw = os.environ.get("CASSIDY_CANDIDATE_REPORT")
    return Path(raw).expanduser().resolve() if raw else workspace_dir / DEFAULT_CANDIDATE_REPORT


def _resolve_source_from_report(workspace_dir: Path) -> tuple[Path, str | None, Path]:
    report_path = _candidate_report_path(workspace_dir)
    if not report_path.is_file():
        raise FileNotFoundError(
            f"Candidate-selection report not found: {report_path}. Run the Blender inspector first."
        )
    report = json.loads(report_path.read_text(encoding="utf-8"))
    if report.get("selection_status") != "ANALYSIS_ONLY_CANDIDATE_SELECTED":
        raise RuntimeError("Candidate report does not contain a valid deterministic selection.")
    source = Path(str(report.get("selected_source", ""))).expanduser().resolve()
    _validate_source_path(source)
    object_name = report.get("selected_object")
    if not object_name:
        raise RuntimeError("Candidate report has no selected_object.")
    return source, str(object_name), report_path


def _resolve_source(workspace_dir: Path) -> tuple[Path, str | None, Path | None]:
    argument = _argument_path()
    if argument is not None:
        return argument, None, None
    raw_source = os.environ.get("CASSIDY_SOURCE_ASSET")
    if raw_source:
        source = Path(raw_source).expanduser().resolve()
        _validate_source_path(source)
        return source, os.environ.get("CASSIDY_SOURCE_OBJECT") or None, None
    return _resolve_source_from_report(workspace_dir)


def _collection():
    collection = bpy.data.collections.get(SOURCE_COLLECTION)
    if collection is None:
        collection = bpy.data.collections.new(SOURCE_COLLECTION)
        bpy.context.scene.collection.children.link(collection)
    return collection


def _tag_source(obj):
    obj["gopal_character"] = CHARACTER_NAME
    obj["gopal_asset_stage"] = "external-source-intake"
    obj["gopal_authored_geometry_required"] = True


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _snapshot(path: Path) -> tuple[Path, str]:
    destination = _workspace_root() / SOURCE_SNAPSHOT
    destination.parent.mkdir(parents=True, exist_ok=True)
    source_hash = _sha256(path)
    if destination.exists():
        existing_hash = _sha256(destination)
        if existing_hash != source_hash:
            raise RuntimeError(
                "Refusing to overwrite an existing Cassidy source snapshot with different bytes. "
                f"Existing={existing_hash} source={source_hash}"
            )
    else:
        shutil.copy2(path, destination)
    baseline = destination.parent / "source-preservation-baseline.json"
    payload = {
        "version": "3N.1-source-preservation-baseline",
        "policy": "immutable-source-baseline",
        "source": str(path),
        "snapshot": str(destination),
        "bytes": path.stat().st_size,
        "sha256": source_hash,
        "snapshot_sha256": _sha256(destination),
        "unchanged_from_source": _sha256(destination) == source_hash,
    }
    baseline.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return destination, source_hash


def _import_blend(path: Path):
    before = set(bpy.data.objects)
    before_collections = set(bpy.data.collections)
    with bpy.data.libraries.load(str(path), link=False) as (data_from, data_to):
        data_to.collections = list(data_from.collections)
    imported_collections = [c for c in bpy.data.collections if c not in before_collections]
    for collection in imported_collections:
        try:
            bpy.context.scene.collection.children.link(collection)
        except RuntimeError:
            pass
    imported = [o for o in bpy.data.objects if o not in before]
    if not imported:
        with bpy.data.libraries.load(str(path), link=False) as (data_from, data_to):
            data_to.objects = list(data_from.objects)
        imported = [o for o in bpy.data.objects if o not in before]
        target = _collection()
        for obj in imported:
            for collection in list(obj.users_collection):
                collection.objects.unlink(obj)
            target.objects.link(obj)
    return imported


def _import_gltf(path: Path):
    before = set(bpy.data.objects)
    result = bpy.ops.import_scene.gltf(filepath=str(path))
    if "FINISHED" not in result:
        raise RuntimeError(f"Blender GLTF import failed: {result}")
    imported = [o for o in bpy.data.objects if o not in before]
    if not imported:
        raise RuntimeError("GLTF import completed without importing any objects")
    target = _collection()
    for obj in imported:
        for collection in list(obj.users_collection):
            collection.objects.unlink(obj)
        target.objects.link(obj)
    return imported


def _select_object(imported, selected_object: str | None):
    meshes = [obj for obj in imported if obj.type == "MESH"]
    if selected_object:
        exact = [obj for obj in meshes if obj.name == selected_object]
        if len(exact) != 1:
            raise RuntimeError(
                f"Deterministic selected object {selected_object!r} was not found exactly once after import; "
                f"mesh objects={len(meshes)}"
            )
        return exact[0]
    if len(meshes) == 1:
        return meshes[0]
    raise RuntimeError(
        "Source contains multiple mesh objects and no selected candidate object was supplied. "
        "Run the candidate inspector and intake from its report."
    )


def import_source(path: Path, selected_object: str | None = None, report_path: Path | None = None) -> dict:
    snapshot, sha = _snapshot(path)
    imported = _import_blend(path) if path.suffix.lower() == ".blend" else _import_gltf(path)
    for obj in imported:
        _tag_source(obj)
    selected = _select_object(imported, selected_object)
    mark_authored_asset(selected, "body", BASE_COMPONENT_ID, continuous=True)
    selected["gopal_source_candidate"] = True
    selected["gopal_source_candidate_object"] = selected.name
    selected["gopal_candidate_selection_policy"] = "deterministic-geometry-report"
    selected["gopal_cassidy_identity_assigned"] = False
    meshes = [o for o in imported if o.type == "MESH"]
    armatures = [o for o in imported if o.type == "ARMATURE"]
    cameras = [o for o in imported if o.type == "CAMERA"]
    lights = [o for o in imported if o.type == "LIGHT"]
    scene = bpy.context.scene
    scene["gopal_cassidy_source_model"] = str(path)
    scene["gopal_cassidy_source_snapshot"] = str(snapshot)
    scene["gopal_cassidy_source_model_bytes"] = path.stat().st_size
    scene["gopal_cassidy_source_model_sha256"] = sha
    scene["gopal_cassidy_source_format"] = path.suffix.lower().lstrip(".")
    scene["gopal_cassidy_source_stage"] = "external-source-intake"
    scene["gopal_cassidy_selected_candidate_object"] = selected.name
    scene["gopal_cassidy_candidate_report"] = str(report_path) if report_path else ""
    return {
        "source": str(path),
        "snapshot": str(snapshot),
        "sha256": sha,
        "bytes": path.stat().st_size,
        "candidate_report": str(report_path) if report_path else None,
        "selected_object": selected.name,
        "selected_component_id": BASE_COMPONENT_ID,
        "imported_objects": len(imported),
        "meshes": len(meshes),
        "armatures": len(armatures),
        "cameras": len(cameras),
        "lights": len(lights),
        "collection": SOURCE_COLLECTION,
        "identity_assigned": False,
        "visual_approval": False,
        "status": "IMPORTED_FOR_PRODUCTION_UPGRADE",
    }


def intake_from_environment(snapshot_dir: Path) -> dict:
    """Resolve candidate selection from environment/report and intake it."""
    workspace_dir = _workspace_root()
    source, selected_object, report_path = _resolve_source(workspace_dir)
    # Keep the historical snapshot location while honoring the build-provided directory.
    global SOURCE_SNAPSHOT
    requested = Path(snapshot_dir)
    if requested.is_absolute():
        requested = requested.resolve()
    SOURCE_SNAPSHOT = requested / "cassidy-source.blend"
    return import_source(source, selected_object=selected_object, report_path=report_path)


def main():
    workspace_dir = _workspace_root()
    source, selected_object, report_path = _resolve_source(workspace_dir)
    report = import_source(source, selected_object=selected_object, report_path=report_path)
    print("=== CASSIDY_REAL_SOURCE_IMPORTED ===")
    for key, value in report.items():
        print(f"{key}: {value}")
    return report


if __name__ == "__main__":
    main()
