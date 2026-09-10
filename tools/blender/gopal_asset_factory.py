import bpy
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

SCHEMA_VERSION = 1
DEFAULT_MAX_TRIS = 30000
DEFAULT_MAX_MATERIALS = 12


def _arg_value(name, default=None):
    argv = sys.argv
    if name not in argv:
        return default
    index = argv.index(name)
    return argv[index + 1] if index + 1 < len(argv) else default


def _sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _mesh_stats():
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    triangles = 0
    vertices = 0
    materials = set()
    for obj in objects:
        mesh = obj.data
        vertices += len(mesh.vertices)
        triangles += sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons)
        for slot in obj.material_slots:
            if slot.material:
                materials.add(slot.material.name)
    return {
        "meshObjects": len(objects),
        "vertices": vertices,
        "triangles": triangles,
        "materials": len(materials),
    }


def _animation_stats():
    actions = []
    for action in bpy.data.actions:
        actions.append({
            "name": action.name,
            "frameStart": float(action.frame_range[0]),
            "frameEnd": float(action.frame_range[1]),
            "frameCount": int(max(0, action.frame_range[1] - action.frame_range[0])),
        })
    return actions


def _normalize():
    bpy.ops.object.select_all(action="SELECT")
    selected = list(bpy.context.selected_objects)
    for obj in selected:
        if obj.type in {"MESH", "ARMATURE"}:
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for obj in selected:
        if obj.type == "MESH":
            obj.data.validate(verbose=False)
            obj.data.update()


def _export(output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_apply=True,
        export_animations=True,
        export_skins=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )


def main():
    input_path = _arg_value("--input")
    output_path = Path(_arg_value("--output", "artifacts/world-runtime/asset.glb"))
    evidence_path = Path(_arg_value("--evidence", str(output_path.with_suffix(".evidence.json"))))
    max_tris = int(_arg_value("--max-triangles", DEFAULT_MAX_TRIS))
    max_materials = int(_arg_value("--max-materials", DEFAULT_MAX_MATERIALS))

    if input_path:
        bpy.ops.wm.open_mainfile(filepath=os.path.abspath(input_path))

    source_stats = _mesh_stats()
    source_actions = _animation_stats()
    _normalize()
    normalized_stats = _mesh_stats()
    _export(output_path)

    output_hash = _sha256(output_path)
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    evidence = {
        "schemaVersion": SCHEMA_VERSION,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "tool": "GoPAL Blender Asset Factory",
        "blenderVersion": bpy.app.version_string,
        "source": {
            "path": os.path.abspath(input_path) if input_path else None,
            "stats": source_stats,
            "animations": source_actions,
        },
        "normalization": {
            "passed": normalized_stats["meshObjects"] > 0,
            "stats": normalized_stats,
        },
        "optimization": {
            "policy": {
                "maxTriangles": max_tris,
                "maxMaterials": max_materials,
            },
            "passed": (
                normalized_stats["meshObjects"] > 0
                and normalized_stats["triangles"] <= max_tris
                and normalized_stats["materials"] <= max_materials
            ),
        },
        "runtimeExport": {
            "format": "glb",
            "path": str(output_path),
            "sha256": output_hash,
            "bytes": output_path.stat().st_size,
            "passed": output_path.exists() and output_path.stat().st_size > 0,
        },
        "animationBinding": {
            "actions": source_actions,
            "passed": True,
        },
        "promotion": {
            "passed": False,
            "reason": "Human visual approval and device validation are still required.",
        },
    }
    evidence_path.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "ok": True,
        "output": str(output_path),
        "evidence": str(evidence_path),
        "triangles": normalized_stats["triangles"],
        "materials": normalized_stats["materials"],
        "animations": len(source_actions),
        "sha256": output_hash,
        "promotion": False,
    }, indent=2))


if __name__ == "__main__":
    main()
