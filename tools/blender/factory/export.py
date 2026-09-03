"""Deterministic glTF/GLB export layer."""

from pathlib import Path
import bpy


def export_glb(output_path: str) -> Path:
    output = Path(output_path).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.suffix.lower() != ".glb":
        raise ValueError("Production export must use the .glb extension.")

    result = bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB")
    if result != {'FINISHED'}:
        raise RuntimeError(f"GLB export did not finish: {result}")
    if not output.exists() or output.stat().st_size == 0:
        raise RuntimeError(f"GLB export produced no usable file: {output}")

    print(f"[GoPAL-FACTORY] GLB exported: {output}")
    print(f"[GoPAL-FACTORY] Size: {output.stat().st_size} bytes")
    return output
