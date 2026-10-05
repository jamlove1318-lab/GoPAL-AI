"""
GoPAL-AI Blender Production Factory - Validation Evidence Collector.
Extracts deep inspection metrics for acceptance auditing.
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


def hash_file(filepath: Path) -> str:
    """Compute SHA-256 hash of file."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def collect_blender_evidence() -> Dict[str, Any]:
    """Inspect active Blender scene and compile rich evidence metadata."""
    import bpy

    nodes: List[Dict[str, Any]] = []
    total_vertices = 0
    total_triangles = 0
    mesh_objects: List[Dict[str, Any]] = []
    materials: List[str] = []
    shape_keys: Dict[str, List[str]] = {}
    actions: List[Dict[str, Any]] = []
    bones: List[str] = []

    for obj in bpy.data.objects:
        node_info = {
            "name": obj.name,
            "type": obj.type,
            "parent": obj.parent.name if obj.parent else None,
            "location": [round(float(c), 4) for c in obj.location],
        }
        nodes.append(node_info)

        if obj.type == "MESH" and obj.data:
            mesh = obj.data
            v_count = len(mesh.vertices)
            p_count = len(mesh.polygons)
            total_vertices += v_count
            total_triangles += p_count

            keys = []
            if mesh.shape_keys and mesh.shape_keys.key_blocks:
                keys = [k.name for k in mesh.shape_keys.key_blocks if k.name != "Basis"]
                shape_keys[obj.name] = keys

            obj_materials = [slot.material.name for slot in obj.material_slots if slot.material]
            for m in obj_materials:
                if m not in materials:
                    materials.append(m)

            mesh_objects.append({
                "name": obj.name,
                "vertices": v_count,
                "polygons": p_count,
                "shape_keys": keys,
                "materials": obj_materials,
            })

        elif obj.type == "ARMATURE" and obj.data:
            arm = obj.data
            bones = [b.name for b in arm.bones]

    for action in bpy.data.actions:
        duration = 0.0
        if action.frame_range:
            duration = float(action.frame_range[1] - action.frame_range[0])
        actions.append({
            "name": action.name,
            "frame_range": [float(action.frame_range[0]), float(action.frame_range[1])],
            "duration_frames": duration,
        })

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_objects": len(bpy.data.objects),
        "total_vertices": total_vertices,
        "total_triangles": total_triangles,
        "nodes": [n["name"] for n in nodes],
        "mesh_objects": mesh_objects,
        "materials": materials,
        "shape_keys": shape_keys,
        "actions": actions,
        "bones": bones,
    }


def save_evidence_report(evidence: Dict[str, Any], output_path: Path) -> Path:
    """Save evidence dictionary to machine-readable JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(evidence, f, indent=2)
    return output_path
