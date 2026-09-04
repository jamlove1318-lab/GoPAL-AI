"""Deterministic inspector for free Cassidy base-mesh candidates.

This tool ranks *source candidates*, never assigns Cassidy identity and never
approves visual quality. It is designed to inspect a directory containing
Blender .blend files and emit evidence that can be reviewed before intake.

Run with Blender's Python interpreter:
    blender --background --factory-startup --python cassidy_base_candidate_inspector.py -- /path/to/candidates
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

import bpy


VERSION = "3N.2-base-candidate-inspector"
MIN_VERTICES = 1500
MIN_POLYGONS = 1000
MIN_DIMENSION = 0.5


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


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


def _mesh_metrics(obj: Any) -> dict[str, Any]:
    mesh = obj.data
    edge_users = [0] * len(mesh.edges)
    edge_index = {
        tuple(sorted((int(e.vertices[0]), int(e.vertices[1])))): i
        for i, e in enumerate(mesh.edges)
    }
    for poly in mesh.polygons:
        verts = list(poly.vertices)
        for i, a in enumerate(verts):
            key = tuple(sorted((int(a), int(verts[(i + 1) % len(verts)]))))
            idx = edge_index.get(key)
            if idx is not None:
                edge_users[idx] += 1
    boundary = sum(1 for count in edge_users if count == 1)
    non_manifold = sum(1 for count in edge_users if count > 2)
    loose_vertices = sum(1 for v in mesh.vertices if not v.link_edges)
    dimensions = [round(float(v), 5) for v in obj.dimensions]
    return {
        "object": obj.name,
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "triangles": sum(len(poly.vertices) - 2 for poly in mesh.polygons if len(poly.vertices) >= 3),
        "uv_layers": len(mesh.uv_layers),
        "shape_key_count": len(mesh.shape_keys.key_blocks) if mesh.shape_keys else 0,
        "connected_components": _component_count(mesh),
        "boundary_edges": boundary,
        "non_manifold_edges": non_manifold,
        "loose_vertices": loose_vertices,
        "materials": [slot.material.name if slot.material else None for slot in obj.material_slots],
        "dimensions": dimensions,
        "height": max(dimensions) if dimensions else 0.0,
    }


def _collection_names(obj: Any) -> list[str]:
    names: list[str] = []
    for collection in getattr(obj, "users_collection", []):
        names.append(collection.name)
    return names


def _semantic_hints(obj: Any) -> list[str]:
    text = " ".join([obj.name, *_collection_names(obj)]).lower()
    hints: list[str] = []
    if any(token in text for token in ("female", "woman", "girl")):
        hints.append("female")
    if any(token in text for token in ("body", "wholebody", "full body", "human")):
        hints.append("body")
    if "stylized" in text:
        hints.append("stylized")
    if any(token in text for token in ("head", "eye", "hand", "foot", "skeleton")):
        hints.append("body-part")
    return hints


def _score(metrics: dict[str, Any], filename: str, semantic_hints: list[str]) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []
    if metrics["vertices"] >= MIN_VERTICES:
        score += 30
    else:
        reasons.append(f"candidate below {MIN_VERTICES} vertices")
    if metrics["polygons"] >= MIN_POLYGONS:
        score += 20
    else:
        reasons.append(f"candidate below {MIN_POLYGONS} polygons")
    if metrics["uv_layers"] > 0:
        score += 10
    else:
        reasons.append("no UV layer")
    if metrics["boundary_edges"] == 0:
        score += 10
    else:
        reasons.append("open boundary edges detected")
    if metrics["non_manifold_edges"] == 0:
        score += 10
    else:
        reasons.append("non-manifold edges detected")
    if metrics["loose_vertices"] == 0:
        score += 5
    else:
        reasons.append("loose vertices detected")
    if metrics["connected_components"] <= 3:
        score += 10
    else:
        reasons.append("too many disconnected components")
    if "female" in semantic_hints:
        score += 12
    if "body" in semantic_hints:
        score += 12
    if "stylized" in semantic_hints:
        score += 8
    if "body-part" in semantic_hints and "body" not in semantic_hints:
        score -= 20
        reasons.append("appears to be a body-part asset rather than a full body")
    if metrics["height"] < MIN_DIMENSION:
        score -= 15
        reasons.append("dimensions are too small to be a full-body candidate")
    lower = filename.lower()
    if "female" in lower:
        score += 5
    if "body female" in lower or "wholebody" in lower:
        score += 8
    return score, reasons


def inspect_blend(path: Path) -> dict[str, Any]:
    _clear_scene()
    bpy.ops.wm.open_mainfile(filepath=str(path))
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    candidates = []
    for obj in meshes:
        metrics = _mesh_metrics(obj)
        hints = _semantic_hints(obj)
        score, reasons = _score(metrics, path.name, hints)
        candidates.append({
            "metrics": metrics,
            "semantic_hints": hints,
            "collections": _collection_names(obj),
            "score": score,
            "reasons": reasons,
        })
    candidates.sort(key=lambda item: (-item["score"], -item["metrics"]["vertices"], item["metrics"]["object"]))
    return {
        "path": str(path),
        "sha256": _sha256(path),
        "mesh_objects": len(meshes),
        "candidates": candidates,
        "best_candidate": candidates[0] if candidates else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()
    root = args.directory.expanduser().resolve()
    files = sorted(root.rglob("*.blend"))
    report = {
        "version": VERSION,
        "directory": str(root),
        "candidate_files": len(files),
        "policy": "analysis-only; no Cassidy assignment; no visual approval",
        "selection_policy": {
            "prefer": ["female", "full-body", "stylized", "healthy topology", "UVs"],
            "reject_signals": ["body-part-only", "open boundaries", "non-manifold", "loose vertices", "very small dimensions"],
        },
        "candidates": [],
    }
    for path in files:
        try:
            report["candidates"].append(inspect_blend(path))
        except Exception as exc:
            report["candidates"].append({"path": str(path), "error": f"{type(exc).__name__}: {exc}"})
    report["candidates"].sort(key=lambda item: (-((item.get("best_candidate") or {}).get("score", -1)), item["path"]))
    destination = args.output or (root / "cassidy-base-candidate-report.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"[Cassidy-Base-Inspector] Files inspected: {len(files)}")
    print(f"[Cassidy-Base-Inspector] Report: {destination}")
    if report["candidates"]:
        best = report["candidates"][0]
        candidate = best.get("best_candidate") or {}
        print(f"[Cassidy-Base-Inspector] Best candidate: {best.get('path')} score={candidate.get('score')}")
        print(f"[Cassidy-Base-Inspector] Best object: {(candidate.get('metrics') or {}).get('object')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
