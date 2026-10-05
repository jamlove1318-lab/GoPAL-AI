"""
GoPAL-AI Cassidy Materials Builder.
Builds stylized PBR Principled BSDF materials using the canonical palette.
"""

from typing import Dict, Tuple
from factory.authoring.reference import hex_to_linear_rgb


def get_or_create_material(name: str, color_rgba: Tuple[float, float, float, float], roughness: float = 0.5, metallic: float = 0.0, emission_rgba: Tuple[float, float, float, float] = None):
    import bpy

    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True

    nodes = mat.node_tree.nodes
    principled = nodes.get("Principled BSDF")
    if principled is None:
        principled = nodes.new(type="ShaderNodeBsdfPrincipled")

    # Blender 4.x / 5.x Principled BSDF inputs
    if "Base Color" in principled.inputs:
        principled.inputs["Base Color"].default_value = color_rgba
    if "Roughness" in principled.inputs:
        principled.inputs["Roughness"].default_value = roughness
    if "Metallic" in principled.inputs:
        principled.inputs["Metallic"].default_value = metallic
    if emission_rgba and "Emission Color" in principled.inputs:
        principled.inputs["Emission Color"].default_value = emission_rgba
        if "Emission Strength" in principled.inputs:
            principled.inputs["Emission Strength"].default_value = 1.5

    return mat


def build_cassidy_materials(palette: Dict[str, str]) -> Dict[str, Any]:
    """Instantiate all required Cassidy PBR materials."""
    materials = {}

    materials["M_Cassidy_Skin"] = get_or_create_material(
        "M_Cassidy_Skin",
        hex_to_linear_rgb(palette.get("skin", "#f4c9a3")),
        roughness=0.45,
    )

    materials["M_Cassidy_Hair"] = get_or_create_material(
        "M_Cassidy_Hair",
        hex_to_linear_rgb(palette.get("hair", "#5b3a29")),
        roughness=0.35,
    )

    materials["M_Cassidy_Hair_Highlight"] = get_or_create_material(
        "M_Cassidy_Hair_Highlight",
        hex_to_linear_rgb(palette.get("hair_highlight", "#7a4f37")),
        roughness=0.3,
    )

    materials["M_Cassidy_Outfit_Emerald"] = get_or_create_material(
        "M_Cassidy_Outfit_Emerald",
        hex_to_linear_rgb(palette.get("shirt", "#10b981")),
        roughness=0.7,
    )

    materials["M_Cassidy_Outfit_Pants"] = get_or_create_material(
        "M_Cassidy_Outfit_Pants",
        hex_to_linear_rgb(palette.get("pants", "#334155")),
        roughness=0.8,
    )

    materials["M_Cassidy_Shoes"] = get_or_create_material(
        "M_Cassidy_Shoes",
        hex_to_linear_rgb(palette.get("shoes", "#1e293b")),
        roughness=0.6,
    )

    materials["M_Cassidy_Eye_Sclera"] = get_or_create_material(
        "M_Cassidy_Eye_Sclera",
        hex_to_linear_rgb(palette.get("eye_sclera", "#ffffff")),
        roughness=0.1,
    )

    materials["M_Cassidy_Eye_Iris"] = get_or_create_material(
        "M_Cassidy_Eye_Iris",
        hex_to_linear_rgb(palette.get("eye_pupil", "#3a2a1f")),
        roughness=0.1,
    )

    materials["M_Cassidy_Charm_Emerald"] = get_or_create_material(
        "M_Cassidy_Charm_Emerald",
        hex_to_linear_rgb(palette.get("charm_emerald", "#34d399")),
        roughness=0.2,
        metallic=0.1,
        emission_rgba=hex_to_linear_rgb(palette.get("shirt", "#10b981")),
    )

    materials["M_Cassidy_Charm_Gold"] = get_or_create_material(
        "M_Cassidy_Charm_Gold",
        hex_to_linear_rgb(palette.get("charm_gold", "#fbbf24")),
        roughness=0.3,
        metallic=0.9,
    )

    return materials
