"""Normalize a world asset into a deterministic mobile-oriented GLB.

Usage from Blender:
  blender --background --python normalize_world_asset.py -- input.blend output.glb

The script deliberately does not invent artistic changes. It normalizes transforms,
removes non-asset scene objects when requested by the caller, records geometry
statistics, and exports a GLB suitable for the runtime promotion review gate.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import bpy


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


def collect_stats() -> dict:
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    vertices = sum(len(obj.data.vertices) for obj in objects)
    polygons = sum(len(obj.data.polygons) for obj in objects)
    materials = sorted({mat.name for obj in objects for mat in obj.data.materials if mat})
    return {
        "meshObjects": len(objects),
        "vertices": vertices,
        "polygons": polygons,
        "materials": len(materials),
        "materialNames": materials,
    }


def export_glb(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        export_apply=True,
        export_copyright="GoPAL-AI normalized world asset",
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
    stats = collect_stats()
    export_glb(output)

    report = output.with_suffix(".normalization.json")
    report.write_text(json.dumps({
        "source": str(source),
        "output": str(output),
        "stats": stats,
        "normalized": True,
    }, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(stats, indent=2))
    print(f"[OK] normalized world asset: {output}")
    print(f"[OK] normalization report: {report}")


if __name__ == "__main__":
    main()
