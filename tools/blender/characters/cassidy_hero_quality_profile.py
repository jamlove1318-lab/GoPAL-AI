"""Strict, explainable quality analysis for an authored Cassidy hero source.

This module is deliberately analysis-only. It never creates geometry, changes
identity, or turns a weak asset into an approved one. Canonical numeric targets
come from the machine-readable projection of the human-authored character sheet.
"""
from __future__ import annotations

from typing import Any
import bpy

from .cassidy_hero_asset_contract import CHARACTER, REQUIRED_COMPONENTS, REQUIRED_ROLES
from .cassidy_canonical_reference_contract import reference_requirements

PROFILE_VERSION = "3N.35-hero-quality-profile"


def _targets() -> dict[str, Any]:
    reference = reference_requirements()
    geometry = reference["geometry"]
    facial = reference["facial"]
    return {
        "hero_triangles_min": int(geometry["triangles_min"]),
        "hero_triangles_max": int(geometry["triangles_max"]),
        "body_vertices_floor": 1500,
        "body_polygons_floor": 1000,
        "loose_vertices_max": 0,
        "non_manifold_edges_max": 0,
        "boundary_edges_max": 0,
        "materials_max": 12,
        "bones_max": 64,
        "expression_blendshape_min": int(facial["blendshapes_min"]),
        "lod_levels_required": len(reference["lod"]),
    }


def _cassidy_meshes() -> list[Any]:
    return [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and obj.get("gopal_character") == CHARACTER
    ]


def _component_id(obj: Any) -> str | None:
    value = obj.get("gopal_component_id")
    return str(value) if value else None


def _geometry_role(obj: Any) -> str:
    return str(obj.get("gopal_geometry_role", "")).strip().lower()


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
    triangles = sum(len(polygon.vertices) - 2 for polygon in mesh.polygons if len(polygon.vertices) >= 3)
    shape_key_count = len(mesh.shape_keys.key_blocks) if mesh.shape_keys else 0
    return {
        "name": obj.name,
        "component_id": _component_id(obj),
        "role": _geometry_role(obj),
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "triangles": triangles,
        "loose_vertices": loose_vertices,
        "boundary_edges": boundary_edges,
        "non_manifold_edges": non_manifold_edges,
        "uv_layers": len(uv_layers) if uv_layers is not None else 0,
        "shape_keys": mesh.shape_keys is not None,
        "shape_key_count": shape_key_count,
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


def _lod_levels() -> set[str]:
    levels: set[str] = set()
    for obj in _cassidy_meshes():
        for key in ("gopal_lod", "gopal_lod_level"):
            value = obj.get(key)
            if value is not None:
                levels.add(str(value).upper().replace("-", ""))
    return levels


def analyze_hero_quality() -> dict[str, Any]:
    targets = _targets()
    meshes = _cassidy_meshes()
    metrics = [_mesh_metrics(obj) for obj in meshes]
    component_ids = {m["component_id"] for m in metrics if m["component_id"]}
    missing_components = sorted(set(REQUIRED_COMPONENTS) - component_ids)

    observed_roles = {_geometry_role(obj) for obj in meshes}
    missing_roles = sorted(
        role for role in REQUIRED_ROLES
        if role != "head" and role not in observed_roles
    )
    if "cassidy-face-base" not in component_ids:
        missing_roles.extend(["head", "face"])

    body = [m for m in metrics if m["component_id"] == "cassidy-body-base"]
    body_best = max(body, key=lambda item: item["vertices"], default=None)
    hero_triangles = sum(item["triangles"] for item in metrics)
    reasons: list[str] = []

    if not meshes:
        reasons.append("no Cassidy authored mesh objects found")
    if missing_components:
        reasons.append("missing required semantic components: " + ", ".join(missing_components))
    if missing_roles:
        reasons.append("missing required semantic roles: " + ", ".join(sorted(set(missing_roles))))
    if body_best is None:
        reasons.append("no viable Cassidy body-base mesh")
    else:
        if body_best["vertices"] < targets["body_vertices_floor"]:
            reasons.append("body vertex count is below diagnostic floor")
        if body_best["polygons"] < targets["body_polygons_floor"]:
            reasons.append("body polygon count is below diagnostic floor")
        if body_best["loose_vertices"] > targets["loose_vertices_max"]:
            reasons.append("body has loose vertices")
        if body_best["non_manifold_edges"] > targets["non_manifold_edges_max"]:
            reasons.append("body has non-manifold edges")

    if hero_triangles < targets["hero_triangles_min"]:
        reasons.append("hero geometry is below the canonical 15K triangle floor")
    elif hero_triangles > targets["hero_triangles_max"]:
        reasons.append("hero geometry exceeds the canonical 45K triangle ceiling")

    armature = _armature_metrics()
    if armature["bone_count"] > targets["bones_max"]:
        reasons.append("armature exceeds mobile diagnostic bone budget")

    all_materials = sorted({name for item in metrics for name in item["materials"]})
    if len(all_materials) > targets["materials_max"]:
        reasons.append("source uses more than the diagnostic material budget")

    expression_shapes = max((m["shape_key_count"] for m in metrics), default=0)
    if expression_shapes < targets["expression_blendshape_min"]:
        reasons.append("facial shape-key count is below the 60+ blendshape target")

    required_lods = set(reference_requirements()["lod"])
    lod_levels = sorted(_lod_levels())
    missing_lods = sorted(required_lods - set(lod_levels))
    if missing_lods:
        reasons.append("missing required LOD levels: " + ", ".join(missing_lods))

    return {
        "version": PROFILE_VERSION,
        "character": CHARACTER,
        "valid": not reasons,
        "analysis_only": True,
        "approval": "human_visual_review_required",
        "source_of_truth": "docs/cassidy-character-reference.md",
        "reasons": reasons,
        "required_components": list(REQUIRED_COMPONENTS),
        "required_roles": list(REQUIRED_ROLES),
        "semantic_role_aliases": {"head": "cassidy-face-base"},
        "missing_components": missing_components,
        "missing_roles": sorted(set(missing_roles)),
        "body": body_best,
        "hero_triangles": hero_triangles,
        "facial_shape_key_count": expression_shapes,
        "lod_levels": lod_levels,
        "missing_lods": missing_lods,
        "meshes": metrics,
        "armature": armature,
        "materials": all_materials,
        "targets": targets,
    }
