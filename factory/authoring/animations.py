"""Cassidy animation authoring with distinct, meaningful motion clips."""
from __future__ import annotations

REQUIRED_ANIMATIONS = ["idle","walk","run","turn","sit","talk","gesture","point","celebrate","think","react"]
DURATION = {"idle":72,"walk":48,"run":36,"turn":36,"sit":48,"talk":48,"gesture":48,"point":36,"celebrate":60,"think":60,"react":36}


def _key(arm, bone, frame, loc=None, rot=None):
    pb = arm.pose.bones.get(bone)
    if not pb: return
    if loc is not None: pb.location = loc; arm.keyframe_insert(data_path=f'pose.bones["{bone}"].location', frame=frame)
    if rot is not None: pb.rotation_mode = "XYZ"; pb.rotation_euler = rot; arm.keyframe_insert(data_path=f'pose.bones["{bone}"].rotation_euler', frame=frame)


def _reset(arm):
    for pb in arm.pose.bones:
        pb.location = (0,0,0); pb.rotation_mode = "XYZ"; pb.rotation_euler = (0,0,0); pb.scale = (1,1,1)


def _build(arm, name):
    import bpy
    action = bpy.data.actions.get(name) or bpy.data.actions.new(name=name)
    action.use_fake_user = True
    action["gopal_character"] = "Cassidy"
    action["gopal_animation_version"] = "4.0"
    action["gopal_expected_frames"] = DURATION[name]
    arm.animation_data.action = action
    _reset(arm)
    d = DURATION[name]
    if name == "idle":
        for f,z in ((1,0),(24,0.012),(48,-0.006),(72,0)): _key(arm,"Chest",f,loc=(0,0,z))
        for f,r in ((1,0),(36,0.035),(72,0)): _key(arm,"Head",f,rot=(r,0,0))
    elif name in ("walk","run"):
        amp = 0.48 if name == "walk" else 0.78
        step = 12 if name == "walk" else 9
        for f,phase in ((1,1),(1+step,-1),(1+2*step,1),(1+3*step,-1),(d,1)):
            a=amp*phase
            _key(arm,"UpperLeg.L",f,rot=(a,0,0)); _key(arm,"UpperLeg.R",f,rot=(-a,0,0))
            _key(arm,"UpperArm.L",f,rot=(-a*0.65,0,0)); _key(arm,"UpperArm.R",f,rot=(a*0.65,0,0))
    elif name == "turn":
        _key(arm,"Spine",1,rot=(0,0,-0.45)); _key(arm,"Spine",18,rot=(0,0,0.45)); _key(arm,"Spine",d,rot=(0,0,0))
        _key(arm,"Head",1,rot=(0,0,-0.65)); _key(arm,"Head",18,rot=(0,0,0.65)); _key(arm,"Head",d,rot=(0,0,0))
    elif name == "sit":
        _key(arm,"Hips",1,loc=(0,0,0)); _key(arm,"Hips",24,loc=(0,0,-0.28)); _key(arm,"Hips",d,loc=(0,0,-0.28))
        for side in ("L","R"): _key(arm,f"UpperLeg.{side}",24,rot=(-1.05,0,0)); _key(arm,f"LowerLeg.{side}",24,rot=(1.0,0,0))
    elif name == "talk":
        for f,r in ((1,0.04),(10,-0.05),(20,0.07),(30,-0.04),(40,0.05),(48,0)): _key(arm,"Head",f,rot=(r,0,0))
        for f,r in ((1,0),(16,0.08),(32,-0.06),(48,0)): _key(arm,"Neck",f,rot=(r,0,0))
    elif name == "gesture":
        _key(arm,"UpperArm.R",1,rot=(0,0,-0.15)); _key(arm,"UpperArm.R",20,rot=(-0.5,0,-0.65)); _key(arm,"UpperArm.R",36,rot=(-0.25,0,-0.4)); _key(arm,"UpperArm.R",48,rot=(0,0,-0.15))
        _key(arm,"LowerArm.R",20,rot=(-0.4,0,0))
    elif name == "point":
        _key(arm,"UpperArm.R",1,rot=(0,0,-0.1)); _key(arm,"UpperArm.R",12,rot=(-0.75,0,-0.55)); _key(arm,"LowerArm.R",12,rot=(0.0,0,0.35)); _key(arm,"UpperArm.R",d,rot=(0,0,-0.1))
    elif name == "celebrate":
        _key(arm,"Hips",1,loc=(0,0,0)); _key(arm,"Hips",30,loc=(0,0,0.16)); _key(arm,"Hips",60,loc=(0,0,0))
        for side in ("L","R"):
            _key(arm,f"UpperArm.{side}",1,rot=(0,0,0)); _key(arm,f"UpperArm.{side}",30,rot=(-1.25,0,0.55 if side=="L" else -0.55)); _key(arm,f"UpperArm.{side}",60,rot=(0,0,0))
    elif name == "think":
        _key(arm,"Head",1,rot=(0,0,0)); _key(arm,"Head",30,rot=(0.12,0,-0.22)); _key(arm,"Head",60,rot=(0,0,0))
        _key(arm,"UpperArm.R",30,rot=(-0.85,0,-0.45)); _key(arm,"LowerArm.R",30,rot=(-0.9,0,0.25))
    elif name == "react":
        _key(arm,"Hips",1,loc=(0,0,0)); _key(arm,"Hips",8,loc=(0,0,0.08)); _key(arm,"Hips",18,loc=(0,0,0)); _key(arm,"Head",8,rot=(0.15,0,0)); _key(arm,"Head",18,rot=(0,0,0))
    # Make action cyclic where appropriate and set range explicitly.
    action.frame_start = 1; action.frame_end = d
    return action


def author_animations(arm_obj):
    if not arm_obj or arm_obj.type != "ARMATURE": raise RuntimeError("Cassidy armature required")
    if arm_obj.mode != "OBJECT":
        import bpy; bpy.ops.object.mode_set(mode="OBJECT")
    for name in REQUIRED_ANIMATIONS: _build(arm_obj, name)
    arm_obj.animation_data.action = bpy.data.actions.get("idle")
    print(f"[GoPAL-FACTORY] Authored {len(REQUIRED_ANIMATIONS)} distinct animation clips", flush=True)
