"""
GoPAL-AI Blender Production Factory - Deterministic glTF/GLB Exporter.
Exports production assets formatted specifically for mobile runtime.
"""

from pathlib import Path
from typing import Optional


DEFAULT_EXPORT_PATH = Path("artifacts/cassidy/cassidy-runtime.glb")


def export_glb(output_path: Optional[str] = None, base_dir: Optional[Path] = None) -> Path:
    """Export the active production scene to a GLB file."""
    import bpy

    if output_path:
        target = Path(output_path).expanduser()
        if not target.is_absolute():
            target = (base_dir or Path(".")).resolve() / target
    else:
        target = (base_dir or Path(".")).resolve() / DEFAULT_EXPORT_PATH

    target.parent.mkdir(parents=True, exist_ok=True)

    if target.suffix.lower() != ".glb":
        raise ValueError(f"Production export must use .glb extension, received: {target.suffix}")

    # Ensure in object mode before export
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

    # Deselect all, then select scene objects
    for obj in bpy.context.scene.objects:
        obj.select_set(True)

    print(f"[GoPAL-FACTORY] Starting GLB export to: {target}", flush=True)

    bpy.ops.export_scene.gltf(
        filepath=str(target),
        export_format="GLB",
        export_yup=True,
        export_apply=False,
        export_animations=True,
        export_morph=True,
        export_materials='EXPORT',
        export_attributes=True,
        export_skins=True,
        export_def_bones=True,
    )

    if not target.exists():
        raise RuntimeError(f"GLB export failed to create output file: {target}")

    file_size = target.stat().st_size
    if file_size == 0:
        raise RuntimeError(f"GLB export generated 0-byte file: {target}")

    print(f"[GoPAL-FACTORY] GLB exported successfully: {target} ({file_size} bytes)", flush=True)
    return target
