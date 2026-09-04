"""Strict intake validation for a real Cassidy hero asset.

The intake gate runs before technical upgrade. It prevents a collection of
floating primitives from being mistaken for an authored hero character.
"""
from __future__ import annotations

from typing import Any

import bpy

from .cassidy_hero_asset_contract import CHARACTER, mark_authored_asset

INTAKE_VERSION = "3N.1-hero-intake"
MAX_BODY_MESHES = 2
MIN_BODY_VERTICES = 1500
MIN_BODY_POLYGONS = 1000


def _candidate_meshes() -> list[Any]:
    return [obj for obj in bpy.data.objects if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER]


def _connected_components(mesh) -> int:
    vertices = len(mesh.vertices)
    if vertices == 0:
        return 0
    adjacency = [[] for _ in range(vertices)]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacency[a].append(b)
        adjacency[b].append(a)
    seen = set()
    components = 0
    for start in range(vertices):
        if start in seen:
            continue
        components += 1
        stack = [start]
        seen.add(start)
        while stack:
            current = stack.pop()
            for nxt in adjacency[current]:
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
    return components


def _mesh_metrics(obj) -> dict[str, Any]:
    mesh = obj.data
    loose = sum(1 for vertex in mesh.vertices if not vertex.link_edges)
    boundary = 0
    for edge in mesh.edges:
        if len(edge.link_faces) == 1:
            boundary += 1
    non_manifold = sum(1 for edge in mesh.edges if not edge.is_loose and len(edge.link_faces) > 2)
    return {
        "name": obj.name,
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "connected_components": _connected_components(mesh),
        "loose_vertices": loose,
        "boundary_edges": boundary,
        "non_manifold_edges": non_manifold,
        "has_shape_keys": mesh.shape_keys is not None,
    }


def validate_hero_source() -> dict[str, Any]:
    meshes = _candidate_meshes()
    metrics = [_mesh_metrics(obj) for obj in meshes]
    body_candidates = [m for m in metrics if "body" in m["name"].lower() or "base" in m["name"].lower()]
    reasons: list[str] = []

    if not meshes:
        reasons.append("no Cassidy mesh objects are present")
    if len(meshes) > MAX_BODY_MESHES and not any(obj.get("gopal_component_id") for obj in meshes):
        reasons.append("source contains too many unstructured Cassidy mesh objects")
    viable = [m for m in body_candidates if m["vertices"] >= MIN_BODY_VERTICES and m["polygons"] >= MIN_BODY_POLYGONS]
    if not viable:
        reasons.append("no sufficiently detailed authored body/base mesh was found")
    if any(m["connected_components"] > 3 for m in viable):
        reasons.append("hero body contains excessive disconnected geometry")
    if any(m["loose_vertices"] > 0 for m in viable):
        reasons.append("hero body contains loose vertices")

    return {
        "version": INTAKE_VERSION,
        "character": CHARACTER,
        "valid": not reasons,
        "reasons": reasons,
        "mesh_count": len(meshes),
        "body_candidates": body_candidates,
        "metrics": metrics,
        "policy": "reject-primitive-placeholder-before-upgrade",
    }


def register_authored_source() -> dict[str, Any]:
    """Tag a validated source without inventing geometry."""
    report = validate_hero_source()
    if not report["valid"]:
        return {"registered": False, "intake": report}

    meshes = _candidate_meshes()
    body = max(meshes, key=lambda obj: len(obj.data.vertices))
    mark_authored_asset(body, "body", "cassidy-body-base", continuous=True)
    return {
        "registered": True,
        "intake": report,
        "base_object": body.name,
        "component_id": "cassidy-body-base",
    }
