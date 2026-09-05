"""
GoPAL-AI Cassidy Eye & Gaze Tracking System.
Creates Gaze_Target and establishes visual look-at constraints.
"""


def setup_gaze_system(root_obj):
    """Author Gaze_Target and track constraints for Cassidy_Eye_L and Cassidy_Eye_R."""
    import bpy

    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection

    gaze_target = bpy.data.objects.get("Gaze_Target")
    if gaze_target is None:
        gaze_target = bpy.data.objects.new("Gaze_Target", None)
        gaze_target.empty_display_type = 'SPHERE'
        gaze_target.empty_display_size = 0.04
        coll.objects.link(gaze_target)
        gaze_target.parent = root_obj
        gaze_target.location = (0.0, 0.65, 1.43)

    for side in ("L", "R"):
        eye = bpy.data.objects.get(f"Cassidy_Eye_{side}")
        if eye:
            constraint = eye.constraints.get("Track_Gaze")
            if constraint is None:
                constraint = eye.constraints.new(type='TRACK_TO')
                constraint.name = "Track_Gaze"
                constraint.target = gaze_target
                constraint.track_axis = 'TRACK_Y'
                constraint.up_axis = 'UP_Z'

    print("[GoPAL-FACTORY] Gaze tracking system configured", flush=True)
    return gaze_target
