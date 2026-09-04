"""Strict intake validation for a real Cassidy hero asset.

Intake is deliberately conservative: semantic component IDs are preferred to
names, structural evidence is recorded before expensive processing, and no
weak asset is upgraded merely to make it pass.
"""
from __future__ import annotations

from typing import Any
import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS, REQUIRED_ROLES, mark_authored_asset

INTAKE_VERSION = "3N.22-hero-intake"
MAX_BODY_MESHES = 2
MIN_BODY_VERTICES = 1500
MIN_BODY_POLYGONS = 1000


def _candidate_meshes() -> list[Any]:
    return [obj for obj in bpy.data.objects if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER]


def _component_id(obj: Any) -> str | None:
    value = obj.get("gopal_component_id")
    return str(value).strip() if value else None


def _role(obj: Any) -> str:
    return str(obj.get("gopal_geometry_role", "")).strip().lower()


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
    boundary = sum(1 for edge in mesh.edges if len(edge.link_faces) == 1)
    non_manifold = sum(1 for edge in mesh.edges if not edge.is_loose and len(edge.link_faces) > 2)
    materials = sorted({slot.material.name for slot in obj.material_slots if slot.material})
    uv_layers = getattr(mesh, "uv_layers", None)
    shape_keys = mesh.shape_keys
    return {
        "name": obj.name,
        "component_id": _component_id(obj),
        "role": _role(obj),
        "authored": obj.get("gopal_authored_asset") is True,
        "continuous": obj.get("gopal_continuous_mesh") is True,
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "connected_components": _connected_components(mesh),
        "loose_vertices": loose,
        "boundary_edges": boundary,
        "non_manifold_edges": non_manifold,
        "uv_layers": len(uv_layers) if uv_layers is not None else 0,
        "shape_key_count": len(shape_keys.key_blocks) if shape_keys else 0,
        "materials": materials,
    }


def _skeleton_metrics() -> dict[str, Any]:
    armatures = [obj for obj in bpy.data.objects if obj.type == "ARMATURE" and obj.get("gopal_character") == CHARACTER]
    bones = sorted({bone.name for obj in armatures for bone in obj.data.bones})
    return {"armature_count": len(armatures), "bone_count": len(bones), "bones": bones}


def validate_hero_source() -> dict[str, Any]:
    meshes = _candidate_meshes()
    metrics = [_mesh_metrics(obj) for obj in meshes]
    by_component = {m["component_id"]: m for m in metrics if m["component_id"]}
    roles = {m["role"] for m in metrics if m["role"]}
    missing_components = sorted(set(REQUIRED_COMPONENTS) - set(by_component))
    missing_roles = sorted(set(REQUIRED_ROLES) - roles)
    reasons: list[str] = []

    if not meshes:
        reasons.append("no Cassidy mesh objects are present")
    if len(meshes) > MAX_BODY_MESHES and not by_component:
        reasons.append("source contains too many unstructured Cassidy mesh objects")
    if missing_components:
        reasons.append("missing required Cassidy components: " + ", ".join(missing_components))
    if missing_roles:
        reasons.append("missing required Cassidy roles: " + ", ".join(missing_roles))

    body = by_component.get("cassidy-body-base")
    if body is None:
        authored_body = [m for m in metrics if m["role"] == "body" and m["authored"]]
        body = max(authored_body, key=lambda m: m["vertices"], default=None)
    if body is None:
        reasons.append("no authored Cassidy body-base mesh was found")
    else:
        if body["vertices"] < MIN_BODY_VERTICES or body["polygons"] < MIN_BODY_POLYGONS:
            reasons.append("authored Cassidy body-base mesh is below the minimum structural density")
        if body["connected_components"] > 3:
            reasons.append("hero body contains excessive disconnected geometry")
        if body["loose_vertices"] > 0:
            reasons.append("hero body contains loose vertices")
        if body["non_manifold_edges"] > 0:
            reasons.append("hero body contains non-manifold edges")
        if body["uv_layers"] == 0:
            reasons.append("hero body has no UV layer")

    unauthored = [m["name"] for m in metrics if not m["authored"]]
    if unauthored:
        reasons.append("Cassidy mesh objects are not all explicitly marked authored: " + ", ".join(unauthored))

    return {
        "version": INTAKE_VERSION,
        "character": CHARACTER,
        "valid": not reasons,
        "reasons": reasons,
        "mesh_count": len(meshes),
        "body_candidates": [m for m in metrics if m["role"] == "body" or "body" in m["name"].lower()],
        "metrics": metrics,
        "missing_components": missing_components,
        "missing_roles": missing_roles,
        "skeleton": _skeleton_metrics(),
        "policy": "manifest-first-authored-only-no-quality-lowering",
    }


def register_authored_source() -> dict[str, Any]:
    """Register the explicit body component without inventing geometry."""
    report = validate_hero_source()
    if not report["valid"]:
        return {"registered": False, "intake": report}

    meshes = _candidate_meshes()
    body = next((obj for obj in meshes if _component_id(obj) == "cassidy-body-base"), None)
    if body is None:
        body = max(meshes, key=lambda obj: len(obj.data.vertices))
    mark_authored_asset(body, "body", "cassidy-body-base", continuous=True)
    return {"registered": True, "intake": report, "base_object": body.name, "component_id": "cassidy-body-base"}
