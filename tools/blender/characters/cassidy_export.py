"""Gated Cassidy GLB export and package-manifest pipeline."""

from pathlib import Path

import bpy

from ..factory.export import export_glb
from .cassidy_package import build_package_manifest, write_package_manifest
from .cassidy_production_gate import evaluate_production_readiness


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
