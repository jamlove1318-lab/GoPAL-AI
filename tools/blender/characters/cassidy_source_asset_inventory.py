"""Deterministic inventory for externally authored Cassidy source assets.

This is an evidence-only tool. It opens a source .blend/.glb/.gltf for
inspection, records every mesh object and useful structural metadata, and
writes a JSON inventory. It never assigns Cassidy identity, changes geometry,
or saves the source asset.

The inventory is intentionally separate from semantic approval: object names
and keyword matches are evidence, never production mappings.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

import bpy

VERSION = "3N.1-source-asset-inventory"
SUPPORTED = {".blend", ".glb", ".gltf"}


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _component_count(mesh: Any) -> int:
    adjacency = [[] for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = int(edge.vertices[0]), int(edge.vertices[1])
        adjacency[a].append(b)
        adjacency[b].append(a)
    seen: set[int] = set()
    count = 0
    for start in range(len(adjacency)):
        if start in seen:
            continue
        count += 1
        stack = [start]
        seen.add(start)
        while stack:
            node = stack.pop()
            for nxt in adjacency[node]:
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
    return count


def _edge_usage(mesh: Any) -> tuple[int, int, int]:
    edge_index = {
        tuple(sorted((int(edge.vertices[0]), int(edge.vertices[1])))): index
        for index, edge in enumerate(mesh.edges)
    }
    users = [0] * len(mesh.edges)
    for polygon in mesh.polygons:
        vertices = list(polygon.vertices)
        for index, a in enumerate(vertices):
            key = tuple(sorted((int(a), int(vertices[(index + 1) % len(vertices)]))))
            edge = edge_index.get(key)
            if edge is not None:
                users[edge] += 1
    boundary = sum(1 for count in users if count == 1)
    non_manifold = sum(1 for count in users if count > 2)
    return boundary, non_manifold, sum(1 for count in users if count == 0)


def _mesh_record(obj: Any) -> dict[str, Any]:
    mesh = obj.data
    boundary, non_manifold, unused_edges = _edge_usage(mesh)
    used_vertices = {index for polygon in mesh.polygons for index in polygon.vertices}
    dimensions = [round(float(value), 5) for value in obj.dimensions]
    text = " ".join(
        [obj.name, mesh.name, *(collection.name for collection in obj.users_collection)]
    ).lower()
    semantic_hints = []
    for label, tokens in {
        "female": ("female", "woman", "girl"),
        "body": ("body", "wholebody", "full body", "human", "character"),
        "face": ("face", "head"),
        "eye": ("eye", "iris", "pupil"),
        "hair": ("hair", "fringe", "bang"),
        "outfit": ("outfit", "shirt", "jacket", "dress", "top"),
        "shoes": ("shoe", "boot", "sneaker", "footwear"),
        "accessory": ("charm", "companion", "leaf", "compass"),
        "realistic": ("realistic",),
        "stylized": ("stylized",),
    }.items():
        if any(token in text for token in tokens):
            semantic_hints.append(label)
    return {
        "object": obj.name,
        "data": mesh.name,
        "collections": sorted(collection.name for collection in obj.users_collection),
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "triangles": sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons),
        "uv_layers": len(mesh.uv_layers),
        "shape_keys": len(mesh.shape_keys.key_blocks) if mesh.shape_keys else 0,
        "connected_components": _component_count(mesh),
        "boundary_edges": boundary,
        "non_manifold_edges": non_manifold,
        "unused_edges": unused_edges,
        "loose_vertices": len(mesh.vertices) - len(used_vertices),
        "dimensions": dimensions,
        "materials": [slot.material.name if slot.material else None for slot in obj.material_slots],
        "vertex_groups": len(obj.vertex_groups),
        "modifiers": [modifier.type for modifier in obj.modifiers],
        "semantic_hints": sorted(semantic_hints),
    }


def _open_source(path: Path) -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if path.suffix.lower() == ".blend":
        bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=False)
        return
    before = set(bpy.data.objects)
    result = bpy.ops.import_scene.gltf(filepath=str(path))
    if "FINISHED" not in result:
        raise RuntimeError(f"GLTF import failed: {result}")
    if not [obj for obj in bpy.data.objects if obj not in before]:
        raise RuntimeError("Source import completed without objects")


def inspect_source(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"Source asset not found: {path}")
    if path.suffix.lower() not in SUPPORTED:
        raise ValueError(f"Unsupported source format: {path.suffix}")
    source_hash = _sha256(path)
    _open_source(path)
    meshes = sorted(
        (obj for obj in bpy.data.objects if obj.type == "MESH"),
        key=lambda obj: obj.name,
    )
    return {
        "version": VERSION,
        "policy": "evidence-only; source is never saved or modified",
        "source": {
            "path": str(path.resolve()),
            "bytes": path.stat().st_size,
            "sha256": source_hash,
            "format": path.suffix.lower().lstrip("."),
        },
        "inventory": {
            "object_count": len(bpy.data.objects),
            "mesh_count": len(meshes),
            "armature_count": sum(1 for obj in bpy.data.objects if obj.type == "ARMATURE"),
            "camera_count": sum(1 for obj in bpy.data.objects if obj.type == "CAMERA"),
            "light_count": sum(1 for obj in bpy.data.objects if obj.type == "LIGHT"),
        },
        "meshes": [_mesh_record(obj) for obj in meshes],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory a genuine Cassidy source asset without modifying it.")
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    argv = sys.argv
    script_args = argv[argv.index("--") + 1:] if "--" in argv else []
    args = parser.parse_args(script_args)
    report = inspect_source(args.source.expanduser().resolve())
    destination = args.output.expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        json.dumps(report, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"[Cassidy-Source-Inventory] Source: {report['source']['path']}")
    print(f"[Cassidy-Source-Inventory] SHA256: {report['source']['sha256']}")
    print(f"[Cassidy-Source-Inventory] Mesh objects: {report['inventory']['mesh_count']}")
    print(f"[Cassidy-Source-Inventory] Report: {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
