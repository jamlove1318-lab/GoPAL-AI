"""Cassidy humanoid rig with real multi-bone deformation weights."""
from __future__ import annotations


def create_armature(root_obj):
    import bpy
    from mathutils import Vector
    arm_obj = bpy.data.objects.get("Cassidy_Armature")
    if arm_obj is None:
        data=bpy.data.armatures.new("Cassidy_Armature_Data"); arm_obj=bpy.data.objects.new("Cassidy_Armature",data)
        (bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection).objects.link(arm_obj); arm_obj.parent=root_obj
        bpy.context.view_layer.objects.active=arm_obj; arm_obj.select_set(True); bpy.ops.object.mode_set(mode="EDIT")
        eb=data.edit_bones
        def B(n,h,t,p=None):
            b=eb.new(n); b.head=Vector(h); b.tail=Vector(t); b.parent=p; return b
        root=B("Root",(0,0,0),(0,0,.12)); hips=B("Hips",(0,0,.82),(0,0,1),root); spine=B("Spine",(0,0,1),(0,0,1.16),hips); chest=B("Chest",(0,0,1.16),(0,0,1.31),spine); neck=B("Neck",(0,0,1.31),(0,0,1.39),chest); B("Head",(0,0,1.39),(0,0,1.62),neck)
        for s,side in ((-1,"L"),(1,"R")):
            sh=B(f"Shoulder.{side}",(s*.07,0,1.29),(s*.16,0,1.29),chest); ua=B(f"UpperArm.{side}",(s*.16,0,1.29),(s*.23,0,1.05),sh); la=B(f"LowerArm.{side}",(s*.23,0,1.05),(s*.25,0,.81),ua); B(f"Hand.{side}",(s*.25,0,.81),(s*.27,.03,.72),la)
            ul=B(f"UpperLeg.{side}",(s*.085,0,.88),(s*.085,0,.48),hips); ll=B(f"LowerLeg.{side}",(s*.085,0,.48),(s*.085,0,.12),ul); B(f"Foot.{side}",(s*.085,0,.12),(s*.085,.12,.03),ll)
        bpy.ops.object.mode_set(mode="OBJECT"); arm_obj.select_set(False)
    _bind(arm_obj); arm_obj["gopal_rig_quality"]="weighted-deformation-v3"; return arm_obj


def _bind(arm):
    import bpy
    for obj in bpy.data.objects:
        if obj.type!="MESH" or not obj.name.startswith("Cassidy_") or obj.name.startswith(("LOD0_","LOD1_","LOD2_")): continue
        mod=obj.modifiers.get("Armature") or obj.modifiers.new("Armature","ARMATURE"); mod.object=arm
        for vg in list(obj.vertex_groups):
            if vg.name in arm.data.bones: obj.vertex_groups.remove(vg)
        for b in arm.data.bones: obj.vertex_groups.new(name=b.name)
        for v in obj.data.vertices:
            z=obj.matrix_world @ v.co
            if obj.name=="Cassidy_Head" or obj.name=="Cassidy_Face" or "Eyelid" in obj.name:
                pairs=[("Head",.82),("Neck",.18)]
            elif obj.name.endswith("Hand_L"):
                pairs=[("Hand.L",.85),("LowerArm.L",.15)]
            elif obj.name.endswith("Hand_R"):
                pairs=[("Hand.R",.85),("LowerArm.R",.15)]
            elif obj.name=="Cassidy_Body":
                side="L" if z.x<0 else "R"
                if z.z<.18: pairs=[(f"Foot.{side}",.65),(f"LowerLeg.{side}",.35)]
                elif z.z<.52: pairs=[(f"LowerLeg.{side}",.70),(f"UpperLeg.{side}",.30)]
                elif z.z<.90: pairs=[(f"UpperLeg.{side}",.72),("Hips",.28)]
                elif z.z<1.08: pairs=[("Spine",.50),("Chest",.30),(f"UpperArm.{side}",.20)]
                else: pairs=[("Chest",.60),("Neck",.20),(f"UpperArm.{side}",.20)]
            else:
                continue
            for name,w in pairs:
                vg=obj.vertex_groups.get(name)
                if vg: vg.add([v.index],w,"REPLACE")
        obj["gopal_deformation_weighted"]=True
