"""Normalize a world asset into a deterministic mobile-oriented GLB.

Usage from Blender:
  blender --background --python normalize_world_asset.py -- input.blend output.glb

This is the single Blender normalization stage for GoPAL world assets. It does
not invent artistic changes or act as a runtime renderer. It normalizes mesh
transforms, records evidence that can be observed directly from the Blender
scene, exports a GLB, and records a checksum for the generated artifact.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path

import bpy

EVIDENCE_SCHEMA_VERSION = 2


def args_after_separator() -> list[str]:
    args = sys.argv
    return args[args.index("--") + 1 :] if "--" in args else []


def import_source(source: Path) -> None:
    suffix = source.suffix.lower()
    if suffix == ".blend":
        bpy.ops.wm.open_mainfile(filepath=str(source))
    elif suffix in {".glb", ".gltf"}:
        bpy.ops.import_scene.gltf(filepath=str(source))
    else:
        raise RuntimeError(f"Unsupported source format: {suffix}")


def normalize_meshes() -> None:
    bpy.ops.object.select_all(action="DESELECT")
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh objects found in source asset")

    for obj in meshes:
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        obj.data.update()
        obj.select_set(False)


def collect_geometry_stats() -> dict:
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    vertices = sum(len(obj.data.vertices) for obj in objects)
    polygons = sum(len(obj.data.polygons) for obj in objects)
    triangles = sum(sum(max(0, len(poly.vertices) - 2) for poly in obj.data.polygons) for obj in objects)

    min_corner = [float("inf"), float("inf"), float("inf")]
    max_corner = [float("-inf"), float("-inf"), float("-inf")]
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ corner
            for axis in range(3):
                min_corner[axis] = min(min_corner[axis], float(world[axis]))
                max_corner[axis] = max(max_corner[axis], float(world[axis]))

    dimensions = [max_corner[i] - min_corner[i] for i in range(3)]
    return {
        "meshObjects": len(objects),
        "vertices": vertices,
        "polygons": polygons,
        "trianglesEstimated": triangles,
        "boundsMin": min_corner,
        "boundsMax": max_corner,
        "dimensions": dimensions,
    }


def collect_material_stats() -> dict:
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    names = sorted({mat.name for obj in objects for mat in obj.data.materials if mat})
    node_materials = sum(1 for mat in bpy.data.materials if mat.use_nodes)
    return {
        "materials": len(names),
        "materialNames": names,
        "nodeMaterialsInScene": node_materials,
    }


def collect_animation_stats() -> dict:
    actions = []
    for action in bpy.data.actions:
        frame_start, frame_end = action.frame_range
        actions.append({
            "name": action.name,
            "frameStart": float(frame_start),
            "frameEnd": float(frame_end),
            "frameLength": float(max(0.0, frame_end - frame_start)),
            "fcurves": len(action.fcurves),
        })

    armatures = []
    for obj in bpy.context.scene.objects:
        if obj.type == "ARMATURE":
            armatures.append({
                "name": obj.name,
                "bones": len(obj.data.bones),
                "deformBones": sum(1 for bone in obj.data.bones if bone.use_deform),
            })

    return {
        "actionCount": len(actions),
        "actions": sorted(actions, key=lambda item: item["name"]),
        "armatureCount": len(armatures),
        "armatures": armatures,
    }


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def export_glb(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        export_apply=True,
        export_copyright="GoPAL-AI normalized world asset",
        export_animations=True,
        export_skins=True,
        export_optimize_animation_size=True,
    )


def main() -> None:
    args = args_after_separator()
    if len(args) != 2:
        raise SystemExit("Expected: -- <input.blend|input.glb|input.gltf> <output.glb>")

    source = Path(os.path.abspath(args[0]))
    output = Path(os.path.abspath(args[1]))
    if not source.exists():
        raise SystemExit(f"Source does not exist: {source}")
    if output.suffix.lower() != ".glb":
        raise SystemExit("Output must use .glb")

    import_source(source)
    normalize_meshes()

    geometry = collect_geometry_stats()
    materials = collect_material_stats()
    animations = collect_animation_stats()
    export_glb(output)

    if not output.exists() or output.stat().st_size == 0:
        raise RuntimeError(f"Blender export did not produce a non-empty GLB: {output}")

    report = output.with_suffix(".normalization.json")
    report.write_text(json.dumps({
        "evidenceSchemaVersion": EVIDENCE_SCHEMA_VERSION,
        "source": str(source),
        "output": str(output),
        "sourceFormat": source.suffix.lower().lstrip("."),
        "runtimeFormat": "glb",
        "outputBytes": output.stat().st_size,
        "outputSha256": sha256_file(output),
        "stats": {
            **geometry,
            **materials,
            **animations,
        },
        "observed": {
            "geometry": True,
            "materials": True,
            "animations": True,
            "outputArtifact": True,
            "checksum": True,
        },
        "normalized": True,
    }, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "evidenceSchemaVersion": EVIDENCE_SCHEMA_VERSION,
        "outputBytes": output.stat().st_size,
        "outputSha256": sha256_file(output),
        "geometry": geometry,
        "materials": materials,
        "animations": animations,
    }, indent=2))
    print(f"[OK] normalized world asset: {output}")
    print(f"[OK] normalization evidence: {report}")


if __name__ == "__main__":
    main()
