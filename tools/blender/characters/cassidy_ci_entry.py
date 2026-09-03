"""GitHub Actions entrypoint for the Cassidy Blender production pipeline.

Runs the existing fail-closed authoring/validation pipeline, persists the
scene and machine-readable report, and exports only when every production gate
passes. No visual review gate is auto-approved.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import bpy

TOOLS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TOOLS_ROOT.parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.build_cassidy import main as build_cassidy
from characters.cassidy_export import export_runtime_package


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


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
        print(json.dumps(report.get("quality", {}), indent=2, sort_keys=True))
        return 2

    print("[Cassidy-CI] Production gate passed; exporting runtime package")
    package = export_runtime_package(output)
    _write_json(output / "export-report.json", package)
    print("[Cassidy-CI] PRODUCTION_READY")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
