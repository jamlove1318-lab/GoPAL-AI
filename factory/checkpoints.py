"""Durable, job-bound Cassidy checkpoints."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
from typing import Optional, Tuple

CHECKPOINTS_DIR=Path("build/cassidy/checkpoints")
CHECKPOINT_FILES={s:f"{i:02d}-{s.lower().replace('_','-')}.blend" for i,s in enumerate(["INIT","REFERENCE","BASE_MESH","FACE","EYES","HAIR","OUTFIT","CHARM","MATERIALS","BODY_RIG","FACIAL_RIG","GAZE","EXPRESSIONS","ANIMATIONS","LODS","VISUAL_STAGING","VALIDATION","EXPORT","PACKAGE","ACCEPTANCE","DONE"])}
STAGE_SEQUENCE=list(CHECKPOINT_FILES)


def ensure_checkpoint_dir(base_dir:Optional[Path]=None)->Path:
    p=(base_dir or Path("."))/CHECKPOINTS_DIR; p.mkdir(parents=True,exist_ok=True); return p


def get_checkpoint_path(stage:str,base_dir:Optional[Path]=None)->Path:
    return ensure_checkpoint_dir(base_dir)/CHECKPOINT_FILES.get(stage,"99-final.blend")


def _job_hash(base_dir:Path)->Optional[str]:
    job=base_dir/"jobs/cassidy-production.json"
    if not job.is_file(): return None
    return hashlib.sha256(job.read_bytes()).hexdigest()


def is_valid_checkpoint(filepath:Path, expected_job_hash:Optional[str]=None)->bool:
    if not filepath.is_file() or filepath.stat().st_size<12: return False
    try:
        with open(filepath,"rb") as f: magic=f.read(4)
        if magic not in (b"BLEN",b"\x28\xb5\x2f\xfd") and not magic.startswith(b"\x1f\x8b"): return False
        meta=filepath.with_suffix(filepath.suffix+".meta.json")
        if not meta.is_file(): return False
        data=json.loads(meta.read_text(encoding="utf-8"))
        if data.get("stage") != filepath.stem.split("-",1)[1].upper().replace("-","_"): return False
        if expected_job_hash is not None and data.get("job_hash") != expected_job_hash: return False
        return True
    except Exception: return False


def save_checkpoint(stage:str,base_dir:Optional[Path]=None)->Path:
    import bpy
    base=base_dir or Path("."); path=get_checkpoint_path(stage,base); path.parent.mkdir(parents=True,exist_ok=True)
    result=bpy.ops.wm.save_as_mainfile(filepath=str(path.resolve()))
    if 'FINISHED' not in result: raise RuntimeError(f"Blender failed to save checkpoint: {stage}")
    meta={"stage":stage,"job_hash":_job_hash(base),"factory":"cassidy-production-v2","file_size":path.stat().st_size}
    path.with_suffix(path.suffix+".meta.json").write_text(json.dumps(meta,indent=2),encoding="utf-8")
    return path


def load_checkpoint(filepath:Path)->bool:
    import bpy
    if not is_valid_checkpoint(filepath): raise FileNotFoundError(f"Cannot load invalid/unbound checkpoint: {filepath}")
    return 'FINISHED' in bpy.ops.wm.open_mainfile(filepath=str(filepath.resolve()))


def find_latest_checkpoint(base_dir:Optional[Path]=None)->Tuple[Optional[str],Optional[Path]]:
    base=base_dir or Path("."); expected=_job_hash(base); d=ensure_checkpoint_dir(base)
    for stage in reversed(STAGE_SEQUENCE):
        p=d/CHECKPOINT_FILES[stage]
        if is_valid_checkpoint(p,expected): return stage,p
    return None,None
