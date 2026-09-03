"""Cassidy canonical PBR materials plus a reusable geometry detail pass."""
from __future__ import annotations
from typing import Any, Dict, Tuple
from factory.authoring.reference import hex_to_linear_rgb


def get_or_create_material(name: str, color_rgba: Tuple[float,float,float,float], roughness: float=.5, metallic: float=0., emission_rgba=None):
    import bpy
    mat=bpy.data.materials.get(name) or bpy.data.materials.new(name=name); mat.use_nodes=True
    p=mat.node_tree.nodes.get("Principled BSDF") or mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    if "Base Color" in p.inputs: p.inputs["Base Color"].default_value=color_rgba
    if "Roughness" in p.inputs: p.inputs["Roughness"].default_value=roughness
    if "Metallic" in p.inputs: p.inputs["Metallic"].default_value=metallic
    if emission_rgba and "Emission Color" in p.inputs:
        p.inputs["Emission Color"].default_value=emission_rgba
        if "Emission Strength" in p.inputs: p.inputs["Emission Strength"].default_value=1.25
    return mat


def _apply_geometry_detail():
    """Increase surface resolution without inventing a second character system."""
    import bpy
    if bpy.context.scene.get("cassidy_detail_pass_v1"): return
    for obj in list(bpy.data.objects):
        if obj.type!="MESH" or not obj.name.startswith("Cassidy_"): continue
        level=2 if obj.name in {"Cassidy_Head","Cassidy_Body","Cassidy_Face"} else 1
        mod=obj.modifiers.get("Cassidy_SurfaceDetail") or obj.modifiers.new("Cassidy_SurfaceDetail","SUBSURF")
        mod.subdivision_type="CATMULL_CLARK"; mod.levels=level; mod.render_levels=level
        bpy.context.view_layer.objects.active=obj; obj.select_set(True)
        try: bpy.ops.object.modifier_apply(modifier=mod.name)
        finally: obj.select_set(False)
        obj["gopal_geometry_detail"]="subdivision-authored"
    bpy.context.scene["cassidy_detail_pass_v1"]=True


def build_cassidy_materials(palette: Dict[str,str]) -> Dict[str,Any]:
    p=lambda k,d: hex_to_linear_rgb(palette.get(k,d))
    mats={
      "M_Cassidy_Skin":get_or_create_material("M_Cassidy_Skin",p("skin","#f4c9a3"),.45),
      "M_Cassidy_Hair":get_or_create_material("M_Cassidy_Hair",p("hair","#3b2419"),.35),
      "M_Cassidy_Hair_Highlight":get_or_create_material("M_Cassidy_Hair_Highlight",p("hair_highlight","#70462f"),.3),
      "M_Cassidy_Outfit_Emerald":get_or_create_material("M_Cassidy_Outfit_Emerald",p("shirt","#0f8a62"),.7),
      "M_Cassidy_Outfit_Pants":get_or_create_material("M_Cassidy_Outfit_Pants",p("pants","#334155"),.8),
      "M_Cassidy_Shoes":get_or_create_material("M_Cassidy_Shoes",p("shoes","#1e293b"),.6),
      "M_Cassidy_Eye_Sclera":get_or_create_material("M_Cassidy_Eye_Sclera",p("eye_sclera","#ffffff"),.1),
      "M_Cassidy_Eye_Iris":get_or_create_material("M_Cassidy_Eye_Iris",p("eye_pupil","#17110e"),.1),
      "M_Cassidy_Charm_Emerald":get_or_create_material("M_Cassidy_Charm_Emerald",p("charm_emerald","#66e0b5"),.2,.1,p("charm_emerald","#66e0b5")),
      "M_Cassidy_Charm_Gold":get_or_create_material("M_Cassidy_Charm_Gold",p("charm_gold","#d6a84f"),.3,.9),
    }
    _apply_geometry_detail()
    return mats
