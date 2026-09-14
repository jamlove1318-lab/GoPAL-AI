"""Fail-closed Blender validator for reusable GoPAL world assets.

Run with Blender in background mode:
  blender --background --factory-startup --python tools/blender/validate_world_asset.py -- <blend-file>

This is a validation/export gate only. It does not create a second runtime world.
"""

import bpy
import math
import os
import sys

MAX_LODS = 4
REQUIRED_AXIS = (0.0, 0.0, 0.0)


def fail(message):
    print(f"[FAIL] {message}")
    raise SystemExit(1)


def info(message):
    print(f"[OK] {message}")


def get_target():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) != 1:
        fail("expected exactly one .blend input after --")
    target = os.path.abspath(args[0])
    if not os.path.isfile(target):
        fail(f"blend file not found: {target}")
    return target


def mesh_stats(obj):
    mesh = obj.data
    return len(mesh.vertices), len(mesh.polygons), sum(1 for p in mesh.polygons if len(p.vertices) > 4)


def validate():
    target = get_target()
    bpy.ops.wm.open_mainfile(filepath=target)

    if not bpy.data.objects:
        fail("asset contains no objects")

    cameras = [o for o in bpy.data.objects if o.type == "CAMERA"]
    lights = [o for o in bpy.data.objects if o.type == "LIGHT"]
    if cameras or lights:
        fail("runtime asset scene must not contain cameras or lights")

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        fail("asset contains no mesh objects")

    for obj in meshes:
        if not obj.name or obj.name != obj.name.lower():
            fail(f"mesh name must be lowercase: {obj.name!r}")
        if any(char in obj.name for char in " -./\\"):
            fail(f"mesh name contains unsupported punctuation: {obj.name!r}")
        if any(abs(value) > 1e-5 for value in obj.rotation_euler):
            fail(f"rotation must be applied before export: {obj.name}")
        if any(abs(value - 1.0) > 1e-5 for value in obj.scale):
            fail(f"scale must be applied before export: {obj.name}")
        if not all(math.isfinite(v) for v in obj.dimensions):
            fail(f"invalid dimensions: {obj.name}")

        vertices, polygons, ngons = mesh_stats(obj)
        if ngons:
            fail(f"ngons detected in {obj.name}: {ngons}")
        if vertices == 0 or polygons == 0:
            fail(f"empty mesh: {obj.name}")

        if not obj.data.uv_layers:
            fail(f"missing UV map: {obj.name}")

    lod_names = set()
    for obj in meshes:
        upper = obj.name.upper()
        if "_LOD" in upper:
            suffix = upper.split("_LOD", 1)[1]
            if suffix.isdigit():
                lod_names.add(int(suffix))

    if lod_names and max(lod_names) > MAX_LODS - 1:
        fail(f"more than {MAX_LODS} LOD levels detected: {sorted(lod_names)}")

    info(f"validated {len(meshes)} mesh object(s)")
    info("no cameras or lights in runtime asset")
    info("names, transforms, geometry and UVs passed")
    if lod_names:
        info(f"LOD levels present: {sorted(lod_names)}")
    else:
        print("[WARN] no explicit LOD collections detected; runtime promotion may require generated LODs")
    print("[OK] Blender world asset validation passed")


if __name__ == "__main__":
    validate()
