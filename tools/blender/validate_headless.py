import bpy
import sys

print("[INFO] GoPAL Blender headless validation")
print(f"[OK] Blender version: {bpy.app.version_string}")
print(f"[OK] Scene count: {len(bpy.data.scenes)}")
print(f"[OK] Object count: {len(bpy.data.objects)}")

# Fail closed on an obviously empty production scene.
if len(bpy.data.scenes) == 0:
    print("[FAIL] No Blender scenes found")
    sys.exit(2)

print("[OK] Headless Blender validation passed")
