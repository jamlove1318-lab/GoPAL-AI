"""
GoPAL-AI Cassidy Hair Authoring.
Constructs layered stylized hair hierarchy: Cassidy_Hair_Root, crown, bangs, and side locks.
"""

from typing import Dict


def create_hair_hierarchy(head_obj, materials: Dict):
    """Author Cassidy_Hair_Root and styled layered hair locks."""
    import bpy
    import bmesh

    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
    hair_mat = materials.get("M_Cassidy_Hair")
    hi_mat = materials.get("M_Cassidy_Hair_Highlight")

    # 1. Cassidy_Hair_Root
    hair_root = bpy.data.objects.get("Cassidy_Hair_Root")
    if hair_root is None:
        mesh = bpy.data.meshes.new("Cassidy_Hair_Root_Mesh")
        hair_root = bpy.data.objects.new("Cassidy_Hair_Root", mesh)
        coll.objects.link(hair_root)
        hair_root.parent = head_obj
        hair_root.location = (0.0, 0.0, 0.04)

        bm = bmesh.new()

        # A. Crown volume helmet
        bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=0.142)
        # Retain only top and back half of sphere
        del_verts = [v for v in bm.verts if (v.co.z < -0.02 and v.co.y > 0.02)]
        bmesh.ops.delete(bm, geom=del_verts, context='VERTS')

        # Tag as main hair
        for f in bm.faces:
            f.material_index = 0

        # B. Front Bangs / Fringe
        bm_bangs = bmesh.new()
        bmesh.ops.create_cone(bm_bangs, cap_ends=True, segments=8, radius1=0.08, radius2=0.02, depth=0.06)
        for v in bm_bangs.verts:
            v.co.y += 0.12
            v.co.z += 0.02
        for f in bm_bangs.faces:
            f.material_index = 1
        bm_bangs.to_mesh(mesh)
        bm.from_mesh(mesh)
        bm_bangs.free()

        # C. Side Tresses / Sway locks (Left & Right)
        for sign in (-1, 1):
            bm_lock = bmesh.new()
            bmesh.ops.create_cone(bm_lock, cap_ends=True, segments=6, radius1=0.035, radius2=0.012, depth=0.18)
            for v in bm_lock.verts:
                v.co.x += sign * 0.11
                v.co.y += 0.04
                v.co.z -= 0.07
            for f in bm_lock.faces:
                f.material_index = 0
            bm_lock.to_mesh(mesh)
            bm.from_mesh(mesh)
            bm_lock.free()

        # D. Back Hair Fall
        bm_back = bmesh.new()
        bmesh.ops.create_cube(bm_back, size=0.16)
        for v in bm_back.verts:
            v.co.y -= 0.06
            v.co.z -= 0.10
            v.co.x *= 0.85
        for f in bm_back.faces:
            f.material_index = 0
        bm_back.to_mesh(mesh)
        bm.from_mesh(mesh)
        bm_back.free()

        bm.to_mesh(mesh)
        bm.free()

        if hair_mat:
            hair_root.data.materials.append(hair_mat)
        if hi_mat:
            hair_root.data.materials.append(hi_mat)

    return hair_root
