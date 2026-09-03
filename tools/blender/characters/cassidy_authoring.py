"""Reusable Cassidy authoring interfaces for the Blender factory.

This layer deliberately separates *authoring* from runtime validation. It
creates production-ready semantic containers and material definitions, but it
does not fabricate a finished humanoid mesh. Real geometry remains an authored
asset that must pass the Cassidy contract before export.
"""

from dataclasses import dataclass
from typing import Dict, Tuple

import bpy

from factory.bootstrap import ensure_collection
from factory.naming import require_name


@dataclass(frozen=True)
class CassidyMaterialSpec:
    slot: str
    base_color: Tuple[float, float, float, float]
    roughness: float
    metallic: float = 0.0
    emission_strength: float = 0.0


MATERIAL_SPECS = (
    CassidyMaterialSpec("skin", (0.65, 0.42, 0.30, 1.0), 0.48),
    CassidyMaterialSpec("hair", (0.12, 0.055, 0.025, 1.0), 0.34),
    CassidyMaterialSpec("eyes", (0.055, 0.035, 0.025, 1.0), 0.18),
    CassidyMaterialSpec("brows", (0.10, 0.045, 0.022, 1.0), 0.50),
    CassidyMaterialSpec("outfit", (0.055, 0.30, 0.20, 1.0), 0.42),
    CassidyMaterialSpec("shoes", (0.075, 0.055, 0.040, 1.0), 0.50),
    CassidyMaterialSpec("accessory", (0.84, 0.66, 0.31, 1.0), 0.24, 0.25, 0.16),
)


@dataclass(frozen=True)
class CassidyAuthoringState:
    geometry: str = "not-authored"
    materials: str = "spec-defined"
    rig: str = "not-authored"
    facial_controls: str = "not-authored"
    eye_gaze: str = "not-authored"
    animation: str = "not-authored"
    lods: str = "not-authored"


def _material_name(slot: str) -> str:
    return require_name(f"Cassidy_MAT_{slot}")


def ensure_materials() -> Dict[str, bpy.types.Material]:
    """Create/reuse canonical material slots without touching authored meshes."""
    materials = {}
    for spec in MATERIAL_SPECS:
        name = _material_name(spec.slot)
        material = bpy.data.materials.get(name)
        if material is None:
            material = bpy.data.materials.new(name)
            material.use_nodes = True
        nodes = material.node_tree.nodes
        principled = nodes.get("Principled BSDF")
        if principled is not None:
            principled.inputs["Base Color"].default_value = spec.base_color
            principled.inputs["Roughness"].default_value = spec.roughness
            principled.inputs["Metallic"].default_value = spec.metallic
            if "Emission Color" in principled.inputs:
                principled.inputs["Emission Color"].default_value = spec.base_color
            if "Emission Strength" in principled.inputs:
                principled.inputs["Emission Strength"].default_value = spec.emission_strength
        material["gopal_character"] = "Cassidy"
        material["gopal_material_slot"] = spec.slot
        material["gopal_material_version"] = "3N.5"
        materials[spec.slot] = material
    return materials


def ensure_authoring_collection() -> bpy.types.Collection:
    collection = ensure_collection("CHARACTERS")
    collection["gopal_character"] = "Cassidy"
    collection["gopal_authoring_layer"] = "3N.5"
    return collection


def attach_authoring_metadata(state: CassidyAuthoringState = CassidyAuthoringState()) -> None:
    scene = bpy.context.scene
    scene["gopal_character"] = "Cassidy"
    scene["gopal_authoring_version"] = "3N.5"
    scene["gopal_authoring_state"] = state.__dict__
    scene["gopal_production_warning"] = (
        "Materials are canonical defaults; authored geometry, rig, facial controls, "
        "gaze, animation and LODs still require production authoring."
    )


def prepare_authoring_environment() -> dict:
    collection = ensure_authoring_collection()
    materials = ensure_materials()
    attach_authoring_metadata()
    return {
        "character": "Cassidy",
        "version": "3N.5",
        "collection": collection.name,
        "material_slots": tuple(materials.keys()),
        "state": CassidyAuthoringState().__dict__.copy(),
    }
