"""Import and preserve a genuine Cassidy source asset."""
from __future__ import annotations
import hashlib, shutil, sys
from pathlib import Path
import bpy

SOURCE_COLLECTION="CASSIDY_SOURCE_MODEL"
CHARACTER_NAME="Cassidy"
SOURCE_SNAPSHOT=Path("build/cassidy/source/cassidy-source.blend")

def _argument_path()->Path:
    args=sys.argv; values=args[args.index("--")+1:] if "--" in args else []
    if len(values)!=1: raise RuntimeError("Pass exactly one .blend, .glb or .gltf source asset path after '--'.")
    path=Path(values[0]).expanduser().resolve()
    if not path.is_file(): raise FileNotFoundError(f"Cassidy source asset not found: {path}")
    if path.suffix.lower() not in {".blend",".glb",".gltf"}: raise ValueError("Cassidy source asset must be .blend, .glb or .gltf")
    return path

def _collection():
    collection=bpy.data.collections.get(SOURCE_COLLECTION)
    if collection is None:
        collection=bpy.data.collections.new(SOURCE_COLLECTION); bpy.context.scene.collection.children.link(collection)
    return collection

def _tag(obj):
    obj["gopal_character"]=CHARACTER_NAME; obj["gopal_asset_stage"]="external-source-intake"; obj["gopal_authored_geometry_required"]=True

def _sha256(path:Path)->str:
    digest=hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda:handle.read(1024*1024),b""): digest.update(chunk)
    return digest.hexdigest()

def _snapshot(path:Path)->Path:
    # characters -> blender -> tools -> repository
    destination=Path(__file__).resolve().parents[3]/SOURCE_SNAPSHOT
    destination.parent.mkdir(parents=True,exist_ok=True)
    if path.resolve()!=destination.resolve(): shutil.copy2(path,destination)
    return destination

def _import_blend(path:Path):
    before=set(bpy.data.objects); before_collections=set(bpy.data.collections)
    with bpy.data.libraries.load(str(path),link=False) as (data_from,data_to): data_to.collections=list(data_from.collections)
    imported_collections=[c for c in bpy.data.collections if c not in before_collections]
    for collection in imported_collections:
        try: bpy.context.scene.collection.children.link(collection)
        except RuntimeError: pass
    imported=[o for o in bpy.data.objects if o not in before]
    if not imported:
        with bpy.data.libraries.load(str(path),link=False) as (data_from,data_to): data_to.objects=list(data_from.objects)
        imported=[o for o in bpy.data.objects if o not in before]
        target=_collection()
        for obj in imported:
            for c in list(obj.users_collection): c.objects.unlink(obj)
            target.objects.link(obj)
    return imported

def _import_gltf(path:Path):
    before=set(bpy.data.objects); result=bpy.ops.import_scene.gltf(filepath=str(path))
    if "FINISHED" not in result: raise RuntimeError(f"Blender GLTF import failed: {result}")
    imported=[o for o in bpy.data.objects if o not in before]
    if not imported: raise RuntimeError("GLTF import completed without importing any objects")
    target=_collection()
    for obj in imported:
        for c in list(obj.users_collection): c.objects.unlink(obj)
        target.objects.link(obj)
    return imported

def import_source(path:Path)->dict:
    snapshot=_snapshot(path)
    imported=_import_blend(path) if path.suffix.lower()==".blend" else _import_gltf(path)
    for obj in imported: _tag(obj)
    meshes=[o for o in imported if o.type=="MESH"]; armatures=[o for o in imported if o.type=="ARMATURE"]
    cameras=[o for o in imported if o.type=="CAMERA"]; lights=[o for o in imported if o.type=="LIGHT"]
    sha=_sha256(path); scene=bpy.context.scene
    scene["gopal_cassidy_source_model"]=str(path); scene["gopal_cassidy_source_snapshot"]=str(snapshot)
    scene["gopal_cassidy_source_model_bytes"]=path.stat().st_size; scene["gopal_cassidy_source_model_sha256"]=sha
    scene["gopal_cassidy_source_format"]=path.suffix.lower().lstrip("."); scene["gopal_cassidy_source_stage"]="external-source-intake"
    return {"source":str(path),"snapshot":str(snapshot),"sha256":sha,"bytes":path.stat().st_size,"imported_objects":len(imported),"meshes":len(meshes),"armatures":len(armatures),"cameras":len(cameras),"lights":len(lights),"collection":SOURCE_COLLECTION,"status":"IMPORTED_FOR_PRODUCTION_UPGRADE"}

def main():
    report=import_source(_argument_path()); print("=== CASSIDY_REAL_SOURCE_IMPORTED ===")
    for key,value in report.items(): print(f"{key}: {value}")
    return report

if __name__=="__main__": main()
