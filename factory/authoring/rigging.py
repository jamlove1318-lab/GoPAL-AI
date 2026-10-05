"""
GoPAL-AI Cassidy Armature Rigging.
Constructs humanoid bone hierarchy and binds meshes with vertex weighting.
"""

from typing import Dict, List


def create_armature(root_obj):
    """Author Cassidy_Armature and bone hierarchy."""
    import bpy
    from mathutils import Vector

    arm_obj = bpy.data.objects.get("Cassidy_Armature")
    if arm_obj is not None:
        return arm_obj

    arm_data = bpy.data.armatures.new("Cassidy_Armature_Data")
    arm_obj = bpy.data.objects.new("Cassidy_Armature", arm_data)

    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
    coll.objects.link(arm_obj)
    arm_obj.parent = root_obj
    arm_obj.location = (0.0, 0.0, 0.0)

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='EDIT')

    edit_bones = arm_data.edit_bones

    # 1. Core Spine Chain
    root_b = edit_bones.new("Root")
    root_b.head = Vector((0.0, 0.0, 0.0))
    root_b.tail = Vector((0.0, 0.0, 0.1))

    hips_b = edit_bones.new("Hips")
    hips_b.parent = root_b
    hips_b.head = Vector((0.0, 0.0, 0.88))
    hips_b.tail = Vector((0.0, 0.0, 1.02))

    spine_b = edit_bones.new("Spine")
    spine_b.parent = hips_b
    spine_b.head = Vector((0.0, 0.0, 1.02))
    spine_b.tail = Vector((0.0, 0.0, 1.18))

    chest_b = edit_bones.new("Chest")
    chest_b.parent = spine_b
    chest_b.head = Vector((0.0, 0.0, 1.18))
    chest_b.tail = Vector((0.0, 0.0, 1.34))

    neck_b = edit_bones.new("Neck")
    neck_b.parent = chest_b
    neck_b.head = Vector((0.0, 0.0, 1.34))
    neck_b.tail = Vector((0.0, 0.0, 1.40))

    head_b = edit_bones.new("Head")
    head_b.parent = neck_b
    head_b.head = Vector((0.0, 0.0, 1.40))
    head_b.tail = Vector((0.0, 0.0, 1.62))

    # 2. Arms (L & R)
    for sign, side in [(-1, "L"), (1, "R")]:
        sh_b = edit_bones.new(f"Shoulder.{side}")
        sh_b.parent = chest_b
        sh_b.head = Vector((sign * 0.05, 0.0, 1.30))
        sh_b.tail = Vector((sign * 0.15, 0.0, 1.30))

        uarm_b = edit_bones.new(f"UpperArm.{side}")
        uarm_b.parent = sh_b
        uarm_b.head = Vector((sign * 0.15, 0.0, 1.30))
        uarm_b.tail = Vector((sign * 0.22, 0.0, 1.04))

        larm_b = edit_bones.new(f"LowerArm.{side}")
        larm_b.parent = uarm_b
        larm_b.head = Vector((sign * 0.22, 0.0, 1.04))
        larm_b.tail = Vector((sign * 0.24, 0.0, 0.80))

        hand_b = edit_bones.new(f"Hand.{side}")
        hand_b.parent = larm_b
        hand_b.head = Vector((sign * 0.24, 0.0, 0.80))
        hand_b.tail = Vector((sign * 0.25, 0.0, 0.70))

    # 3. Legs (L & R)
    for sign, side in [(-1, "L"), (1, "R")]:
        uleg_b = edit_bones.new(f"UpperLeg.{side}")
        uleg_b.parent = hips_b
        uleg_b.head = Vector((sign * 0.085, 0.0, 0.88))
        uleg_b.tail = Vector((sign * 0.085, 0.0, 0.48))

        lleg_b = edit_bones.new(f"LowerLeg.{side}")
        lleg_b.parent = uleg_b
        lleg_b.head = Vector((sign * 0.085, 0.0, 0.48))
        lleg_b.tail = Vector((sign * 0.085, 0.0, 0.12))

        foot_b = edit_bones.new(f"Foot.{side}")
        foot_b.parent = lleg_b
        foot_b.head = Vector((sign * 0.085, 0.0, 0.12))
        foot_b.tail = Vector((sign * 0.085, 0.10, 0.02))

    bpy.ops.object.mode_set(mode='OBJECT')

    # Bind deformable mesh objects to Armature with modifiers and vertex groups
    bind_targets = ["Cassidy_Body", "Cassidy_Head", "Cassidy_Hand_L", "Cassidy_Hand_R"]
    for name in bind_targets:
        obj = bpy.data.objects.get(name)
        if obj and obj.type == "MESH":
            # Add armature modifier if missing
            mod = obj.modifiers.get("Armature")
            if mod is None:
                mod = obj.modifiers.new(name="Armature", type='ARMATURE')
                mod.object = arm_obj

            # Ensure basic vertex group
            vg_name = "Chest" if "Body" in name else ("Head" if "Head" in name else ("Hand.L" if "L" in name else "Hand.R"))
            vg = obj.vertex_groups.get(vg_name)
            if vg is None:
                vg = obj.vertex_groups.new(name=vg_name)
                all_v_indices = list(range(len(obj.data.vertices)))
                vg.add(all_v_indices, 1.0, 'REPLACE')

    print("[GoPAL-FACTORY] Cassidy_Armature created and bound", flush=True)
    return arm_obj
