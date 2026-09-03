"""GitHub Actions entrypoint for the Cassidy Blender production pipeline.

Runs the existing fail-closed authoring/validation pipeline, persists the
scene and machine-readable report, and exports only when every production gate
passes. No visual review gate is auto-approved.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import bpy

TOOLS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TOOLS_ROOT.parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.build_cassidy import main as build_cassidy
from characters.cassidy_export import export_runtime_package


def _json_safe(value: Any) -> Any:
    """Convert Blender/runtime values into deterministic JSON-safe data.

    Authoring helpers legitimately return bpy objects (for example review
    cameras) because those objects are useful inside Blender. Reports are a
    separate machine-readable boundary and must never contain live Blender
    RNA objects. Keep names and stable scalar metadata rather than coercing
    objects to opaque strings.
    """
    if value is None or isinstance(value, (str, int, float, bool)):
        return value

    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}

    if isinstance(value, (list, tuple, set, frozenset)):
        return [_json_safe(item) for item in value]

    if isinstance(value, bpy.types.Object):
        data: dict[str, Any] = {
            "name": value.name,
            "type": value.type,
        }
        if value.data is not None:
            data["data_name"] = getattr(value.data, "name", None)
        return data

    if isinstance(value, bpy.types.ID):
        return {
            "name": value.name,
            "type": value.__class__.__name__,
        }

    # Blender math types expose a stable iterable representation.
    if hasattr(value, "to_tuple"):
        try:
            return [_json_safe(item) for item in value.to_tuple()]
        except Exception:
            pass

    try:
        return [_json_safe(item) for item in value]
    except (TypeError, ValueError):
        return str(value)


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    safe_payload = _json_safe(payload)
    path.write_text(
        json.dumps(safe_payload, indent=2, sort_keys=True, allow_nan=False) + "\n",
        encoding="utf-8",
    )


def run() -> int:
    output = REPO_ROOT / "artifacts" / "cassidy"
    output.mkdir(parents=True, exist_ok=True)

    print("[Cassidy-CI] Starting deterministic production preparation")
    report = build_cassidy()
    _write_json(output / "production-report.json", report)

    # Persist the exact prepared/validated Blender scene for inspection.
    blend_path = output / "cassidy-production.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

    if not report.get("ready"):
        print("[Cassidy-CI] PRODUCTION_BLOCKED")
        print(json.dumps(_json_safe(report.get("quality", {})), indent=2, sort_keys=True))
        return 2

    print("[Cassidy-CI] Production gate passed; exporting runtime package")
    package = export_runtime_package(output)
    _write_json(output / "export-report.json", package)
    print("[Cassidy-CI] PRODUCTION_READY")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
