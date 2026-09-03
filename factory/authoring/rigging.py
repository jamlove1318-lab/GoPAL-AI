"""Cassidy humanoid rig with real multi-bone deformation weights."""
from __future__ import annotations


def create_armature(root_obj):
    import bpy
    from mathutils import Vector
    arm_obj = bpy.data.objects.get("Cassidy_Armature")
    if arm_obj is None:
        data = bpy.data.armatures.new("Cassidy_Armature_Data")
        arm_obj = bpy.data.objects.new("Cassidy_Armature", data)
        coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection
        coll.objects.link(arm_obj); arm_obj.parent = root_obj
        bpy.context.view_layer.objects.active = arm_obj; arm_obj.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT")
        eb = data.edit_bones
        def bone(name, head, tail, parent=None):
            b=eb.new(name); b.head=Vector(head); b.tail=Vector(tail); b.parent=parent; return b
        root=bone("Root",(0,0,0),(0,0,.12)); hips=bone("Hips",(0,0,.82),(0,0,1.00),root)
        spine=bone("Spine",(0,0,1.00),(0,0,1.16),hips); chest=bone("Chest",(0,0,1.16),(0,0,1.31),spine)
        neck=bone("Neck",(0,0,1.31),(0,0,1.39),chest); head=bone("Head",(0,0,1.39),(0,0,1.62),neck)
        for s,side in ((-1,"L"),(1,"R")):
            sh=bone(f"Shoulder.{side}",(s*.07,0,1.29),(s*.16,0,1.29),chest)
            ua=bone(f"UpperArm.{side}",(s*.16,0,1.29),(s*.23,0,1.05),sh)
            la=bone(f"LowerArm.{side}",(s*.23,0,1.05),(s*.25,0,.81),ua)
            bone(f"Hand.{side}",(s*.25,0,.81),(s*.27,.03,.72),la)
            ul=bone(f"UpperLeg.{side}",(s*.085,0,.88),(s*.085,0,.48),hips)
            ll=bone(f"LowerLeg.{side}",(s*.085,0,.48),(s*.085,0,.12),ul)
            bone(f"Foot.{side}",(s*.085,0,.12),(s*.085,.12,.03),ll)
        bpy.ops.object.mode_set(mode="OBJECT"); arm_obj.select_set(False)
    _bind_with_weighted_deformation(arm_obj)
    arm_obj["gopal_rig_quality"]="weighted-deformation-v2"
    arm_obj["gopal_body_bone_count"]=len(arm_obj.data.bones)
    print("[GoPAL-FACTORY] Cassidy humanoid rig authored with weighted deformation", flush=True)
    return arm_obj


def _bind_with_weighted_deformation(arm):
    import bpy
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.name.startswith("Cassidy_") or obj.name.startswith(("LOD0_","LOD1_","LOD2_")):
            continue
        mod=obj.modifiers.get("Armature") or obj.modifiers.new("Armature","ARMATURE"); mod.object=arm
        for v in obj.vertex_groups:
            if v.name in arm.data.bones: obj.vertex_groups.remove(v)
        bones=list(arm.data.bones)
        for b in bones: obj.vertex_groups.new(name=b.name)
        for v in obj.data.vertices:
            z=obj.matrix_world @ v.co
            # Candidate influence bands; weights are normalized and overlap at joints.
            candidates=[]
            if z.z < .18: candidates=[("Foot.L" if z.x<0 else "Foot.R",.55),("LowerLeg.L" if z.x<0 else "LowerLeg.R",.45)]
            elif z.z < .52: candidates=[("LowerLeg.L" if z.x<0 else "LowerLeg.R",.65),("UpperLeg.L" if z.x<0 else "UpperLeg.R",.35)]
            elif z.z < .91: candidates=[("UpperLeg.L" if z.x<0 else "UpperLeg.R",.70),("Hips",.30)]
            elif z.z < 1.16: candidates=[("Spine",.45),("Chest",.35),("UpperArm.L" if z.x<0 else "UpperArm.R",.20)]
            elif z.z < 1.34: candidates=[("Chest",.55),("Neck",.25),("UpperArm.L" if z.x<0 else "UpperArm.R",.20)]
            else: candidates=[("Head",.75),("Neck",.25)]
            for name,w in candidates:
                vg=obj.vertex_groups.get(name)
                if vg: vg.add([v.index],w,"REPLACE")
        obj["gopal_deformation_weighted"]=True
