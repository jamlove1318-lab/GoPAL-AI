"""Deterministic mobile GLB exporter; excludes hidden LOD variants from runtime."""
from pathlib import Path
from typing import Optional
DEFAULT_EXPORT_PATH=Path("artifacts/cassidy/cassidy-runtime.glb")

def export_glb(output_path:Optional[str]=None,base_dir:Optional[Path]=None)->Path:
    import bpy
    target=Path(output_path).expanduser() if output_path else DEFAULT_EXPORT_PATH
    if not target.is_absolute(): target=(base_dir or Path(".")).resolve()/target
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.suffix.lower()!=".glb": raise ValueError("Production export must use .glb")
    if bpy.context.active_object and bpy.context.active_object.mode!="OBJECT": bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    exportable=[]
    for obj in bpy.context.scene.objects:
        if obj.name.startswith(("LOD1_","LOD2_")) or obj.name.startswith("CASSIDY_LOD"):
            continue
        if obj.type in {"MESH","ARMATURE","EMPTY"}:
            obj.select_set(True); exportable.append(obj)
    bpy.context.view_layer.objects.active=bpy.data.objects.get("Cassidy_Root") or (exportable[0] if exportable else None)
    result=bpy.ops.export_scene.gltf(filepath=str(target),export_format="GLB",export_yup=True,export_apply=False,export_animations=True,export_morph=True,export_materials="EXPORT",export_attributes=True,export_skins=True,export_def_bones=True,use_selection=True)
    bpy.ops.object.select_all(action="DESELECT")
    if 'FINISHED' not in result or not target.is_file() or target.stat().st_size<=1024: raise RuntimeError("GLB export failed or produced an invalid file")
    return target
