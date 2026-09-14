"""
GoPAL-AI Cassidy Facial Rigging.
Adds facial articulation bones to Cassidy_Armature.
"""


def add_facial_bones(arm_obj):
    """Add jaw, mouth, and brow deformation bones to armature."""
    import bpy
    from mathutils import Vector

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='EDIT')

    edit_bones = arm_obj.data.edit_bones
    head_b = edit_bones.get("Head")
    if not head_b:
        bpy.ops.object.mode_set(mode='OBJECT')
        return

    if not edit_bones.get("Jaw"):
        jaw_b = edit_bones.new("Jaw")
        jaw_b.parent = head_b
        jaw_b.head = Vector((0.0, 0.04, 1.40))
        jaw_b.tail = Vector((0.0, 0.10, 1.37))

    for sign, side in [(-1, "L"), (1, "R")]:
        brow_name = f"Brow.{side}"
        if not edit_bones.get(brow_name):
            brow_b = edit_bones.new(brow_name)
            brow_b.parent = head_b
            brow_b.head = Vector((sign * 0.04, 0.09, 1.48))
            brow_b.tail = Vector((sign * 0.07, 0.09, 1.49))

    bpy.ops.object.mode_set(mode='OBJECT')
    print("[GoPAL-FACTORY] Facial bones added to Cassidy_Armature", flush=True)
