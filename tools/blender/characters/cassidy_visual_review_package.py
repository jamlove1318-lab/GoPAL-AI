"""Deterministic visual-review package generation for Cassidy.

This module prepares review evidence from the authored Cassidy scene without
approving any visual gate. It renders the canonical turnaround views from the
actual source-derived model and writes a machine-readable checklist/evidence
bundle for human art review.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

import bpy
from mathutils import Vector

from .cassidy_review import REVIEW_GATES, REVIEW_VERSION

PACKAGE_VERSION = "3N.1"
VIEW_SPECS = (
    ("01-front", 0.0),
    ("02-three-quarter-front", math.radians(45.0)),
    ("03-side", math.radians(90.0)),
    ("04-three-quarter-back", math.radians(135.0)),
    ("05-back", math.radians(180.0)),
)
CHARACTER_PREFIXES = ("Cassidy_", "LOD0_Cassidy_", "LOD1_Cassidy_", "LOD2_Cassidy_")


def _json_safe(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set, frozenset)):
        return [_json_safe(v) for v in value]
    return str(value)


def _cassidy_meshes():
    return [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and obj.get("gopal_character") == "Cassidy"
    ]


def _primary_objects():
    lod0 = [o for o in _cassidy_meshes() if str(o.get("gopal_lod", "")) in {"LOD0", "0"}]
    if lod0:
        return lod0
    excluded = {o for o in _cassidy_meshes() if str(o.get("gopal_lod", "")).upper() in {"LOD1", "LOD2", "1", "2"}}
    return [o for o in _cassidy_meshes() if o not in excluded]


def _bounds(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        # Blender 5 exposes bound_box corners as bpy_prop_array values rather
        # than mathutils.Vector instances. Convert explicitly before matrix
        # multiplication so this remains compatible with Blender 5.x.
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not points:
        return None
    mins = [min(p[i] for p in points) for i in range(3)]
    maxs = [max(p[i] for p in points) for i in range(3)]
    center = [(mins[i] + maxs[i]) * 0.5 for i in range(3)]
    size = [maxs[i] - mins[i] for i in range(3)]
    return center, size


def _look_at(camera, target):
    direction = target - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def _ensure_review_camera():
    camera = bpy.data.objects.get("Cassidy_Review_Camera")
    if camera is None:
        data = bpy.data.cameras.new("Cassidy_Review_Camera_Data")
        camera = bpy.data.objects.new("Cassidy_Review_Camera", data)
        bpy.context.scene.collection.objects.link(camera)
    return camera


def _ensure_light(name, location, energy, size):
    light = bpy.data.objects.get(name)
    if light is None:
        data = bpy.data.lights.new(name + "_Data", "AREA")
        light = bpy.data.objects.new(name, data)
        bpy.context.scene.collection.objects.link(light)
    light.location = location
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    return light


def _render_turnaround(output_dir: Path) -> list[dict[str, Any]]:
    scene = bpy.context.scene
    objects = _primary_objects()
    bounds = _bounds(objects)
    if bounds is None:
        return [{"view": name, "rendered": False, "error": "No authored Cassidy mesh bounds found."} for name, _ in VIEW_SPECS]

    center_values, size_values = bounds
    center = Vector(center_values)
    height = max(size_values[2], 1.0)
    radius = max(size_values[0], size_values[1], height) * 1.7

    camera = _ensure_review_camera()
    camera.data.lens = 52
    camera.data.sensor_width = 36
    scene.camera = camera

    _ensure_light("Cassidy_Review_Key", (radius * 0.65, -radius * 0.9, height * 1.2), 850, radius * 0.65)
    _ensure_light("Cassidy_Review_Fill", (-radius * 0.8, -radius * 0.35, height * 0.8), 500, radius * 0.55)
    _ensure_light("Cassidy_Review_Rim", (radius * 0.25, radius * 0.9, height * 1.35), 950, radius * 0.45)

    original_res = (scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage)
    original_filepath = scene.render.filepath
    original_engine = scene.render.engine
    original_transparent = scene.render.film_transparent
    try:
        scene.render.resolution_x = 768
        scene.render.resolution_y = 1024
        scene.render.resolution_percentage = 100
        scene.render.film_transparent = False
        try:
            scene.render.engine = "BLENDER_EEVEE_NEXT"
        except Exception:
            pass
        results = []
        target = center + Vector((0.0, 0.0, height * 0.04))
        for view_name, angle in VIEW_SPECS:
            camera.location = Vector((math.sin(angle) * radius, -math.cos(angle) * radius, height * 0.56))
            _look_at(camera, target)
            path = output_dir / view_name / "render.png"
            path.parent.mkdir(parents=True, exist_ok=True)
            scene.render.filepath = str(path)
            try:
                bpy.ops.render.render(write_still=True)
                results.append({"view": view_name, "rendered": path.is_file(), "path": str(path)})
            except Exception as exc:
                results.append({"view": view_name, "rendered": False, "error": str(exc)})
        return results
    finally:
        scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = original_res
        scene.render.filepath = original_filepath
        scene.render.engine = original_engine
        scene.render.film_transparent = original_transparent
        for name in ("Cassidy_Review_Camera", "Cassidy_Review_Key", "Cassidy_Review_Fill", "Cassidy_Review_Rim"):
            obj = bpy.data.objects.get(name)
            if obj is not None:
                bpy.data.objects.remove(obj, do_unlink=True)


def build_review_checklist(gate_report: dict[str, Any] | None = None) -> dict[str, Any]:
    report = gate_report or {}
    return {
        "package_version": PACKAGE_VERSION,
        "review_version": REVIEW_VERSION,
        "character": "Cassidy",
        "approval_policy": "human_visual_review_required",
        "approved_automatically": False,
        "gates": [
            {"id": gate, "status": "pending", "notes": "Human/art review required."}
            for gate in REVIEW_GATES
        ],
        "objective_evidence": {
            "production_ready_except_visual_review": not bool(report.get("reasons")),
            "production_gate_reasons": list(report.get("reasons", [])),
            "outfit_valid": bool((report.get("outfit") or {}).get("valid")),
            "animation_valid": bool((report.get("animation") or {}).get("valid")),
        },
    }


def generate_visual_review_package(output_dir, gate_report: dict[str, Any] | None = None) -> dict[str, Any]:
    output = Path(output_dir) / "visual-review"
    output.mkdir(parents=True, exist_ok=True)
    renders = _render_turnaround(output)
    checklist = build_review_checklist(gate_report)
    checklist["turnaround_views"] = renders
    checklist_path = output / "review-checklist.json"
    checklist_path.write_text(json.dumps(_json_safe(checklist), indent=2, sort_keys=True) + "\n", encoding="utf-8")

    summary = {
        "package_version": PACKAGE_VERSION,
        "review_version": REVIEW_VERSION,
        "character": "Cassidy",
        "visual_review_required": True,
        "automatic_approval": False,
        "rendered_views": sum(1 for item in renders if item.get("rendered")),
        "total_views": len(renders),
        "checklist": str(checklist_path),
        "turnaround_views": renders,
    }
    (output / "review-report.json").write_text(json.dumps(_json_safe(summary), indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return summary
