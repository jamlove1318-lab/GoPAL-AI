"""Gated Cassidy GLB export and package-manifest pipeline."""

import sys
from pathlib import Path

import bpy

# Make the repository's Blender tool root importable when Blender executes this
# file directly with ``--python``. This does not change runtime package imports.
TOOLS_ROOT = Path(__file__).resolve().parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from factory.export import export_glb
from characters.cassidy_package import build_package_manifest, write_package_manifest
from characters.cassidy_production_gate import evaluate_production_readiness


def export_runtime_package(output_dir):
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    report = evaluate_production_readiness()
    if not report["ready"]:
        raise RuntimeError("Cassidy production export blocked: " + "; ".join(report["reasons"]))

    model_path = output / "cassidy-runtime.glb"
    export_glb(model_path)
    manifest = build_package_manifest(model_path)
    manifest_path = write_package_manifest(manifest, output / "cassidy-runtime.manifest.json")
    return {"model": str(model_path), "manifest": str(manifest_path), "validation": report}
