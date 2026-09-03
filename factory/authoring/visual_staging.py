"""
GoPAL-AI Cassidy Visual Staging & Review Framing.
Sets up review cameras and lighting for visual quality audit.
"""


def setup_visual_staging():
    """Create standard cameras (Front, Three-Quarter, Portrait) and lighting."""
    import bpy

    cam_coll = bpy.data.collections.get("CAMERAS") or bpy.context.scene.collection
    light_coll = bpy.data.collections.get("LIGHTING") or bpy.context.scene.collection

    # 1. Front Review Camera
    if not bpy.data.objects.get("Camera_Front"):
        cam_data = bpy.data.cameras.new("Camera_Front_Data")
        cam_obj = bpy.data.objects.new("Camera_Front", cam_data)
        cam_coll.objects.link(cam_obj)
        cam_obj.location = (0.0, 3.2, 1.1)
        cam_obj.rotation_euler = (1.5708, 0.0, 3.14159)

    # 2. Portrait Camera (headshot)
    if not bpy.data.objects.get("Camera_Portrait"):
        cam_data = bpy.data.cameras.new("Camera_Portrait_Data")
        cam_obj = bpy.data.objects.new("Camera_Portrait", cam_data)
        cam_coll.objects.link(cam_obj)
        cam_obj.location = (0.0, 1.2, 1.45)
        cam_obj.rotation_euler = (1.5708, 0.0, 3.14159)

    # 3. Three-point lighting
    if not bpy.data.objects.get("Light_Key"):
        light_data = bpy.data.lights.new("Light_Key_Data", type='SUN')
        light_data.energy = 3.0
        light_obj = bpy.data.objects.new("Light_Key", light_data)
        light_coll.objects.link(light_obj)
        light_obj.location = (1.5, 2.0, 3.0)

    print("[GoPAL-FACTORY] Visual staging cameras and lighting configured", flush=True)
