"""
GoPAL-AI Blender Production Factory - Checkpoint System.
Guarantees stage-by-stage durability and crash resumption.
"""

from pathlib import Path
from typing import Dict, Optional, Tuple

CHECKPOINTS_DIR = Path("build/cassidy/checkpoints")

CHECKPOINT_FILES = {
    "INIT": "00-init.blend",
    "REFERENCE": "01-reference.blend",
    "BASE_MESH": "02-base-mesh.blend",
    "FACE": "03-face.blend",
    "EYES": "03-face.blend",
    "HAIR": "04-hair.blend",
    "OUTFIT": "05-outfit.blend",
    "CHARM": "05-outfit.blend",
    "MATERIALS": "05-outfit.blend",
    "BODY_RIG": "06-rig.blend",
    "FACIAL_RIG": "07-facial-rig.blend",
    "GAZE": "07-facial-rig.blend",
    "EXPRESSIONS": "08-animation.blend",
    "ANIMATIONS": "08-animation.blend",
    "LODS": "09-lod.blend",
    "VISUAL_STAGING": "09-lod.blend",
    "VALIDATION": "10-final.blend",
    "EXPORT": "10-final.blend",
    "PACKAGE": "10-final.blend",
    "ACCEPTANCE": "10-final.blend",
    "DONE": "10-final.blend",
}

STAGE_SEQUENCE = [
    "INIT",
    "REFERENCE",
    "BASE_MESH",
    "FACE",
    "EYES",
    "HAIR",
    "OUTFIT",
    "CHARM",
    "MATERIALS",
    "BODY_RIG",
    "FACIAL_RIG",
    "GAZE",
    "EXPRESSIONS",
    "ANIMATIONS",
    "LODS",
    "VISUAL_STAGING",
    "VALIDATION",
    "EXPORT",
    "PACKAGE",
    "ACCEPTANCE",
    "DONE",
]


def ensure_checkpoint_dir(base_dir: Optional[Path] = None) -> Path:
    """Create and return checkpoint directory."""
    chk_dir = (base_dir or Path(".")) / CHECKPOINTS_DIR
    chk_dir.mkdir(parents=True, exist_ok=True)
    return chk_dir


def get_checkpoint_path(stage: str, base_dir: Optional[Path] = None) -> Path:
    """Return full Path for a stage's designated checkpoint."""
    chk_dir = ensure_checkpoint_dir(base_dir)
    filename = CHECKPOINT_FILES.get(stage, "10-final.blend")
    return chk_dir / filename


def is_valid_checkpoint(filepath: Path) -> bool:
    """Verify that a checkpoint exists, is non-empty, and has Blender or ZSTD magic bytes."""
    if not filepath.is_file() or filepath.stat().st_size < 12:
        return False
    try:
        with open(filepath, "rb") as f:
            magic = f.read(4)
            return (
                magic == b"BLEN"
                or magic == b"\x28\xb5\x2f\xfd"
                or magic.startswith(b"\x1f\x8b")
            )
    except Exception:
        return False


def save_checkpoint(stage: str, base_dir: Optional[Path] = None) -> Path:
    """Save current Blender scene as the stage checkpoint."""
    import bpy

    path = get_checkpoint_path(stage, base_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(path.resolve()))
    print(f"[GoPAL-FACTORY] Checkpoint saved: {path} ({path.stat().st_size} bytes)", flush=True)
    return path


def load_checkpoint(filepath: Path) -> bool:
    """Load a checkpoint into active Blender session."""
    import bpy

    if not is_valid_checkpoint(filepath):
        raise FileNotFoundError(f"Cannot load invalid checkpoint: {filepath}")

    bpy.ops.wm.open_mainfile(filepath=str(filepath.resolve()))
    print(f"[GoPAL-FACTORY] Checkpoint loaded: {filepath}", flush=True)
    return True


def find_latest_checkpoint(base_dir: Optional[Path] = None) -> Tuple[Optional[str], Optional[Path]]:
    """Scan backward through STAGE_SEQUENCE to locate the most recent valid checkpoint."""
    chk_dir = ensure_checkpoint_dir(base_dir)
    for stage in reversed(STAGE_SEQUENCE):
        chk_file = CHECKPOINT_FILES.get(stage)
        if chk_file:
            path = chk_dir / chk_file
            if is_valid_checkpoint(path):
                return stage, path
    return None, None
