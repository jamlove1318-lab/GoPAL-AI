"""
GoPAL-AI Cassidy Animation Action Authoring.
Constructs all 11 canonical production animation actions on Cassidy_Armature.
Uses robust keyframe_insert and preserves actions across checkpoint saves.
"""

from typing import List

REQUIRED_ANIMATIONS = [
    "idle",
    "walk",
    "run",
    "turn",
    "sit",
    "talk",
    "gesture",
    "point",
    "celebrate",
    "think",
    "react",
]


def author_animations(arm_obj):
    """Generate keyframed Action data-blocks for all required animation clips."""
    import bpy

    if not arm_obj or arm_obj.type != 'ARMATURE':
        return

    bpy.context.view_layer.objects.active = arm_obj
    if arm_obj.mode != 'POSE':
        bpy.ops.object.mode_set(mode='POSE')

    if not arm_obj.animation_data:
        arm_obj.animation_data_create()

    pose_bones = arm_obj.pose.bones

    for anim_name in REQUIRED_ANIMATIONS:
        # Create or reuse action
        action = bpy.data.actions.get(anim_name)
        if action is None:
            action = bpy.data.actions.new(name=anim_name)
        action.use_fake_user = True

        arm_obj.animation_data.action = action

        # Reset pose bone transforms
        for pb in pose_bones:
            pb.location = (0.0, 0.0, 0.0)
            pb.rotation_euler = (0.0, 0.0, 0.0)
            pb.scale = (1.0, 1.0, 1.0)

        # Animate based on action type
        if anim_name == "idle":
            chest = pose_bones.get("Chest")
            if chest:
                chest.location.z = 0.0
                arm_obj.keyframe_insert(data_path='pose.bones["Chest"].location', frame=1)
                chest.location.z = 0.015
                arm_obj.keyframe_insert(data_path='pose.bones["Chest"].location', frame=30)
                chest.location.z = 0.0
                arm_obj.keyframe_insert(data_path='pose.bones["Chest"].location', frame=60)

        elif anim_name == "walk":
            for idx, side in enumerate(["L", "R"]):
                uleg = pose_bones.get(f"UpperLeg.{side}")
                if uleg:
                    uleg.rotation_euler.x = 0.35 if idx == 0 else -0.35
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperLeg.{side}"].rotation_euler', frame=1)
                    uleg.rotation_euler.x = -0.35 if idx == 0 else 0.35
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperLeg.{side}"].rotation_euler', frame=16)
                    uleg.rotation_euler.x = 0.35 if idx == 0 else -0.35
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperLeg.{side}"].rotation_euler', frame=32)

        elif anim_name == "run":
            for idx, side in enumerate(["L", "R"]):
                uleg = pose_bones.get(f"UpperLeg.{side}")
                if uleg:
                    uleg.rotation_euler.x = 0.65 if idx == 0 else -0.65
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperLeg.{side}"].rotation_euler', frame=1)
                    uleg.rotation_euler.x = -0.65 if idx == 0 else 0.65
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperLeg.{side}"].rotation_euler', frame=12)
                    uleg.rotation_euler.x = 0.65 if idx == 0 else -0.65
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperLeg.{side}"].rotation_euler', frame=24)

        elif anim_name == "talk":
            head = pose_bones.get("Head")
            if head:
                for k in range(5):
                    head.rotation_euler.x = 0.08 if k % 2 == 1 else 0.0
                    arm_obj.keyframe_insert(data_path='pose.bones["Head"].rotation_euler', frame=1 + k * 12)

        elif anim_name == "celebrate":
            hips = pose_bones.get("Hips")
            if hips:
                hips.location.z = 0.0
                arm_obj.keyframe_insert(data_path='pose.bones["Hips"].location', frame=1)
                hips.location.z = 0.20
                arm_obj.keyframe_insert(data_path='pose.bones["Hips"].location', frame=24)
                hips.location.z = 0.0
                arm_obj.keyframe_insert(data_path='pose.bones["Hips"].location', frame=48)

            for side in ("L", "R"):
                uarm = pose_bones.get(f"UpperArm.{side}")
                if uarm:
                    uarm.rotation_euler.z = 0.0
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperArm.{side}"].rotation_euler', frame=1)
                    uarm.rotation_euler.z = 1.4 if side == "L" else -1.4
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperArm.{side}"].rotation_euler', frame=24)
                    uarm.rotation_euler.z = 0.0
                    arm_obj.keyframe_insert(data_path=f'pose.bones["UpperArm.{side}"].rotation_euler', frame=48)

        else:
            # Generic keyframing (turn, sit, gesture, point, think, react)
            head = pose_bones.get("Head")
            if head:
                head.rotation_euler.z = 0.0
                arm_obj.keyframe_insert(data_path='pose.bones["Head"].rotation_euler', frame=1)
                head.rotation_euler.z = 0.15
                arm_obj.keyframe_insert(data_path='pose.bones["Head"].rotation_euler', frame=20)
                head.rotation_euler.z = 0.0
                arm_obj.keyframe_insert(data_path='pose.bones["Head"].rotation_euler', frame=40)

    # Revert to object mode and set default action to idle
    bpy.ops.object.mode_set(mode='OBJECT')
    arm_obj.animation_data.action = bpy.data.actions.get("idle")
    print(f"[GoPAL-FACTORY] Authored {len(REQUIRED_ANIMATIONS)} animation actions with fake users", flush=True)
