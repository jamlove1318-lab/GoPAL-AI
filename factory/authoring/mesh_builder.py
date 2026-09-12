"""
GoPAL-AI Cassidy Geometry Authoring - Base Mesh & Anatomy Builder.
Constructs canonical stylized humanoid geometry for Cassidy.
"""

import math
from typing import Dict, Optional


def create_root_node():
    """Create or get the master Cassidy_Root node at origin."""
    import bpy

    root = bpy.data.objects.get("Cassidy_Root")
    if root is None:
        root = bpy.data.objects.new("Cassidy_Root", None)
        root.empty_display_type = 'PLAIN_AXES'
        root.empty_display_size = 0.5
        root.location = (0.0, 0.0, 0.0)

        coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
        coll.objects.link(root)

    return root


def create_stylized_head(root_obj, materials: Dict):
    """Author Cassidy_Head with anime proportions, jawline, and chin."""
    import bpy
    import bmesh

    existing = bpy.data.objects.get("Cassidy_Head")
    if existing:
        return existing

    mesh = bpy.data.meshes.new("Cassidy_Head_Mesh")
    obj = bpy.data.objects.new("Cassidy_Head", mesh)

    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
    coll.objects.link(obj)
    obj.parent = root_obj
    obj.location = (0.0, 0.0, 1.42)

    bm = bmesh.new()
    # Create stylized base head sphere with deformation for jaw and chin
    bmesh.ops.create_uvsphere(
        bm,
        u_segments=16,
        v_segments=12,
        radius=0.13,
    )

    # Deform vertices into stylized anime head (slender chin, tapered jaw, round forehead)
    for v in bm.verts:
        # Scale width slightly
        v.co.x *= 0.95
        # Push back of head slightly out
        if v.co.y < 0:
            v.co.y *= 1.15
        # Taper jaw downwards
        if v.co.z < 0:
            factor = 1.0 + (v.co.z / 0.13) * 0.4
            v.co.x *= max(0.4, factor)
            v.co.y *= max(0.6, factor)
            # Chin point
            if v.co.y > 0 and v.co.z < -0.06:
                v.co.y += 0.015

    bm.to_mesh(mesh)
    bm.free()

    # Assign skin material
    skin_mat = materials.get("M_Cassidy_Skin")
    if skin_mat:
        obj.data.materials.append(skin_mat)

    return obj


def create_stylized_body(root_obj, materials: Dict):
    """Author Cassidy_Body with emerald cardigan, trousers, and shoes."""
    import bpy
    import bmesh

    existing = bpy.data.objects.get("Cassidy_Body")
    if existing:
        return existing

    mesh = bpy.data.meshes.new("Cassidy_Body_Mesh")
    obj = bpy.data.objects.new("Cassidy_Body", mesh)

    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
    coll.objects.link(obj)
    obj.parent = root_obj
    obj.location = (0.0, 0.0, 0.0)

    bm = bmesh.new()

    # 1. Torso & Emerald Sweater (Z: 0.88 to 1.32)
    torso_mat_idx = 0
    bmesh.ops.create_cube(bm, size=0.28)
    for v in bm.verts:
        v.co.z = 1.08 + v.co.z * 1.5
        v.co.x *= 1.1
        v.co.y *= 0.75
        # Waist taper
        if v.co.z < 1.02:
            v.co.x *= 0.88
            v.co.y *= 0.88

    # Tag torso faces
    for f in bm.faces:
        f.material_index = 0

    # 2. Left and Right Legs / Charcoal Pants (Z: 0.12 to 0.88)
    for sign, name in [(-1, "L"), (1, "R")]:
        leg_verts = []
        offset_x = sign * 0.085
        # Thigh to ankle cylinder
        bm_leg = bmesh.new()
        bmesh.ops.create_cone(
            bm_leg,
            cap_ends=True,
            segments=10,
            radius1=0.062,
            radius2=0.045,
            depth=0.76,
        )
        for v in bm_leg.verts:
            v.co.x += offset_x
            v.co.z += 0.50
        # Tag faces
        for f in bm_leg.faces:
            f.material_index = 1
        bm_leg.to_mesh(mesh)
        # Merge into main bm
        bm.from_mesh(mesh)
        bm_leg.free()

    # 3. Left and Right Shoes (Z: 0.0 to 0.12)
    for sign in (-1, 1):
        shoe_x = sign * 0.085
        bm_shoe = bmesh.new()
        bmesh.ops.create_cube(bm_shoe, size=0.1)
        for v in bm_shoe.verts:
            v.co.x = shoe_x + v.co.x * 0.75
            v.co.y = 0.02 + v.co.y * 1.8
            v.co.z = 0.05 + v.co.z * 0.5
        for f in bm_shoe.faces:
            f.material_index = 2
        bm_shoe.to_mesh(mesh)
        bm.from_mesh(mesh)
        bm_shoe.free()

    # 4. Left and Right Arms / Cardigan Sleeves
    for sign in (-1, 1):
        arm_x = sign * 0.21
        bm_arm = bmesh.new()
        bmesh.ops.create_cone(
            bm_arm,
            cap_ends=True,
            segments=8,
            radius1=0.045,
            radius2=0.035,
            depth=0.48,
        )
        for v in bm_arm.verts:
            v.co.x += arm_x
            v.co.z += 1.05
        for f in bm_arm.faces:
            f.material_index = 0
        bm_arm.to_mesh(mesh)
        bm.from_mesh(mesh)
        bm_arm.free()

    bm.to_mesh(mesh)
    bm.free()

    # Assign materials in slot order: 0: Outfit, 1: Pants, 2: Shoes
    if materials.get("M_Cassidy_Outfit_Emerald"):
        obj.data.materials.append(materials["M_Cassidy_Outfit_Emerald"])
    if materials.get("M_Cassidy_Outfit_Pants"):
        obj.data.materials.append(materials["M_Cassidy_Outfit_Pants"])
    if materials.get("M_Cassidy_Shoes"):
        obj.data.materials.append(materials["M_Cassidy_Shoes"])

    return obj


def create_stylized_hands(root_obj, materials: Dict):
    """Author Cassidy_Hand_L and Cassidy_Hand_R with palm and finger definition."""
    import bpy
    import bmesh

    hands = {}
    skin_mat = materials.get("M_Cassidy_Skin")

    for sign, side in [(-1, "L"), (1, "R")]:
        name = f"Cassidy_Hand_{side}"
        existing = bpy.data.objects.get(name)
        if existing:
            hands[name] = existing
            continue

        mesh = bpy.data.meshes.new(f"{name}_Mesh")
        obj = bpy.data.objects.new(name, mesh)

        coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
        coll.objects.link(obj)
        obj.parent = root_obj
        obj.location = (sign * 0.22, 0.0, 0.78)

        bm = bmesh.new()
        # Palm
        bmesh.ops.create_cube(bm, size=0.06)
        for v in bm.verts:
            v.co.x *= 0.9
            v.co.y *= 0.5
            v.co.z *= 1.2

        # Thumb
        bm_thumb = bmesh.new()
        bmesh.ops.create_cone(bm_thumb, cap_ends=True, segments=6, radius1=0.012, radius2=0.008, depth=0.035)
        for v in bm_thumb.verts:
            v.co.x += -sign * 0.025
            v.co.y += 0.015
            v.co.z += -0.01
        bm_thumb.to_mesh(mesh)
        bm.from_mesh(mesh)
        bm_thumb.free()

        bm.to_mesh(mesh)
        bm.free()

        if skin_mat:
            obj.data.materials.append(skin_mat)

        hands[name] = obj

    return hands
