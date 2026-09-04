"""Strict, explainable quality analysis for an authored Cassidy hero source.

This module is deliberately analysis-only. It never creates geometry, changes
identity, or turns a weak asset into an approved one.
"""
from __future__ import annotations

from typing import Any
import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS, REQUIRED_ROLES

PROFILE_VERSION = "3N.22-hero-quality-profile"

# These are diagnostic targets, not automatic visual approval.
TARGETS = {
    "body_vertices_floor": 1500,
    "body_polygons_floor": 1000,
    "body_components_max": 3,
    "loose_vertices_max": 0,
    "non_manifold_edges_max": 0,
    "boundary_edges_max": 0,
    "materials_max": 12,
    "bones_max": 64,
}


def _cassidy_meshes() -> list[Any]:
    return [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER
    ]


def _component_id(obj: Any) -> str | None:
    value = obj.get("gopal_component_id")
    return str(value) if value else None


def _mesh_metrics(obj: Any) -> dict[str, Any]:
    mesh = obj.data
    loose_vertices = sum(1 for vertex in mesh.vertices if not vertex.link_edges)
    boundary_edges = sum(1 for edge in mesh.edges if len(edge.link_faces) == 1)
    non_manifold_edges = sum(
        1 for edge in mesh.edges
        if not edge.is_loose and len(edge.link_faces) > 2
    )
    material_names = [slot.material.name for slot in obj.material_slots if slot.material]
    uv_layers = getattr(mesh, "uv_layers", None)
    return {
        "name": obj.name,
        "component_id": _component_id(obj),
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "loose_vertices": loose_vertices,
        "boundary_edges": boundary_edges,
        "non_manifold_edges": non_manifold_edges,
        "uv_layers": len(uv_layers) if uv_layers is not None else 0,
        "shape_keys": mesh.shape_keys is not None,
        "materials": sorted(set(material_names)),
    }


def _armature_metrics() -> dict[str, Any]:
    armatures = [
        obj for obj in bpy.data.objects
        if obj.type == "ARMATURE" and obj.get("gopal_character") == CHARACTER
    ]
    bones = []
    for obj in armatures:
        bones.extend(bone.name for bone in obj.data.bones)
    return {
        "armature_count": len(armatures),
        "bone_count": len(bones),
        "bones": sorted(set(bones)),
    }


def analyze_hero_quality() -> dict[str, Any]:
    meshes = _cassidy_meshes()
    metrics = [_mesh_metrics(obj) for obj in meshes]
    component_ids = {m["component_id"] for m in metrics if m["component_id"]}
    missing_components = sorted(set(REQUIRED_COMPONENTS) - component_ids)
    roles = {
        str(obj.get("gopal_component_id")): str(obj.get("gopal_role"))
        for obj in meshes if obj.get("gopal_component_id")
    }
    missing_roles = sorted(set(REQUIRED_ROLES) - set(roles.values()))

    body = [
        m for m in metrics
        if m["component_id"] == "cassidy-body-base"
        or ("body" in m["name"].lower() and m["vertices"] >= TARGETS["body_vertices_floor"])
    ]
    body_best = max(body, key=lambda item: item["vertices"], default=None)
    reasons: list[str] = []
    if not meshes:
        reasons.append("no Cassidy authored mesh objects found")
    if missing_components:
        reasons.append("missing required semantic components: " + ", ".join(missing_components))
    if missing_roles:
        reasons.append("missing required semantic roles: " + ", ".join(missing_roles))
    if body_best is None:
        reasons.append("no viable Cassidy body-base mesh")
    else:
        if body_best["vertices"] < TARGETS["body_vertices_floor"]:
            reasons.append("body vertex count is below diagnostic floor")
        if body_best["polygons"] < TARGETS["body_polygons_floor"]:
            reasons.append("body polygon count is below diagnostic floor")
        if body_best["loose_vertices"] > TARGETS["loose_vertices_max"]:
            reasons.append("body has loose vertices")
        if body_best["non_manifold_edges"] > TARGETS["non_manifold_edges_max"]:
            reasons.append("body has non-manifold edges")

    armature = _armature_metrics()
    if armature["bone_count"] > TARGETS["bones_max"]:
        reasons.append("armature exceeds mobile diagnostic bone budget")

    all_materials = sorted({name for item in metrics for name in item["materials"]})
    if len(all_materials) > TARGETS["materials_max"]:
        reasons.append("source uses more than the diagnostic material budget")

    return {
        "version": PROFILE_VERSION,
        "character": CHARACTER,
        "valid": not reasons,
        "analysis_only": True,
        "approval": "human_visual_review_required",
        "reasons": reasons,
        "required_components": list(REQUIRED_COMPONENTS),
        "required_roles": list(REQUIRED_ROLES),
        "missing_components": missing_components,
        "missing_roles": missing_roles,
        "body": body_best,
        "meshes": metrics,
        "armature": armature,
        "materials": all_materials,
        "targets": dict(TARGETS),
    }
