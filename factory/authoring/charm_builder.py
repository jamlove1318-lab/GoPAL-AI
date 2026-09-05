"""
GoPAL-AI Cassidy Charm Authoring.
Constructs canonical Cassidy_Charm: signature Emerald Valley gem and gold setting.
"""

from typing import Dict


def create_signature_charm(body_obj, materials: Dict):
    """Author Cassidy_Charm attached to chest/collar area."""
    import bpy
    import bmesh

    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
    gem_mat = materials.get("M_Cassidy_Charm_Emerald")
    gold_mat = materials.get("M_Cassidy_Charm_Gold")

    charm_obj = bpy.data.objects.get("Cassidy_Charm")
    if charm_obj is None:
        mesh = bpy.data.meshes.new("Cassidy_Charm_Mesh")
        charm_obj = bpy.data.objects.new("Cassidy_Charm", mesh)
        coll.objects.link(charm_obj)
        charm_obj.parent = body_obj
        charm_obj.location = (0.04, 0.12, 1.22)

        bm = bmesh.new()

        # 1. Faceted Emerald Gem (Octahedral diamond shape)
        bmesh.ops.create_cone(
            bm,
            cap_ends=True,
            segments=6,
            radius1=0.016,
            radius2=0.002,
            depth=0.028,
        )
        for f in bm.faces:
            f.material_index = 0

        # 2. Gold Ring / Bale mount
        bm_ring = bmesh.new()
        bmesh.ops.create_cone(
            bm_ring,
            cap_ends=True,
            segments=8,
            radius1=0.012,
            radius2=0.008,
            depth=0.008,
        )
        for v in bm_ring.verts:
            v.co.z += 0.016
        for f in bm_ring.faces:
            f.material_index = 1
        bm_ring.to_mesh(mesh)
        bm.from_mesh(mesh)
        bm_ring.free()

        bm.to_mesh(mesh)
        bm.free()

        if gem_mat:
            charm_obj.data.materials.append(gem_mat)
        if gold_mat:
            charm_obj.data.materials.append(gold_mat)

    return charm_obj
