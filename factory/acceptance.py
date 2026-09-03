"""Final Cassidy production acceptance gate.

This gate is deliberately stricter than the legacy structural validator. It
combines scene validation, true triangle counting, deformation/gaze checks,
package checks, and a real GLB round-trip import.
"""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from factory.evidence import hash_file
from factory.validation.scene_validator import validate_production_scene
from factory.quality.placeholder_blocker import inspect_scene, validate_artifact_manifest

DEFAULT_ARTIFACTS_DIR = Path("artifacts/cassidy")


def _roundtrip_glb(path: Path) -> Dict[str, Any]:
    import bpy
    if not path.is_file() or path.stat().st_size <= 1024:
        return {"valid": False, "error": "GLB missing or too small"}
    before = set(bpy.data.objects.keys())
    try:
        bpy.ops.import_scene.gltf(filepath=str(path.resolve()))
        imported = [o for o in bpy.data.objects if o.name not in before]
        meshes = [o for o in imported if o.type == "MESH"]
        actions = {a.name for a in bpy.data.actions}
        return {"valid": bool(imported and meshes), "objects_imported": len(imported), "mesh_objects_imported": len(meshes), "animations_seen": sorted(actions)}
    except Exception as exc:
        return {"valid": False, "error": f"GLB import failed: {exc}"}
    finally:
        for obj in [o for o in bpy.data.objects if o.name not in before]:
            bpy.data.objects.remove(obj, do_unlink=True)


def run_acceptance_gate(glb_path: Optional[Path] = None, artifacts_dir: Optional[Path] = None) -> Dict[str, Any]:
    import bpy
    out_dir = artifacts_dir or DEFAULT_ARTIFACTS_DIR
    target = glb_path or (out_dir / "cassidy-runtime.glb")
    scene_errors = validate_production_scene()
    strict = inspect_scene()
    roundtrip = _roundtrip_glb(target)
    manifest = validate_artifact_manifest(out_dir / "cassidy-package.json")
    checks = {
        "scene_structure_clean": not scene_errors,
        "strict_production_quality": strict["valid"],
        "glb_exists_and_sized": target.is_file() and target.stat().st_size > 1024,
        "glb_roundtrip_import": roundtrip["valid"],
        "package_contract_valid": manifest["valid"],
    }
    report = {
        "verdict": "PASS" if all(checks.values()) else "FAIL",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "character": "Cassidy",
        "checks": checks,
        "scene_errors": scene_errors,
        "strict_quality": strict,
        "roundtrip": roundtrip,
        "package_validation": manifest,
        "glb_asset": {"path": str(target), "size_bytes": target.stat().st_size if target.is_file() else 0, "sha256": hash_file(target) if target.is_file() else None},
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "acceptance-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"[GoPAL-FACTORY] Acceptance Gate Verdict: {report['verdict']}", flush=True)
    return report
