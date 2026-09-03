"""Headless Blender smoke test for Cassidy authoring contracts."""

import json
import sys
from pathlib import Path

import bpy

TOOLS_ROOT = Path(__file__).resolve().parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from factory.bootstrap import initialize
from characters.cassidy_production_gate import evaluate_production_readiness


def main():
    initialize()
    report = evaluate_production_readiness()

    # A clean factory scene must never be accepted as a production Cassidy.
    assert report["ready"] is False, "Empty factory scene must fail Cassidy production gate"
    assert report["reasons"], "Blocked production must provide actionable reasons"
    assert "mesh" in report and "modeling" in report
    assert "face_nodes" in report and "hair_charm" in report
    assert "outfit" in report and "mobile_lod" in report
    assert "animation_authoring" in report

    print("=== GOPAL_CASSIDY_AUTHORING_CONTRACTS_OK ===")
    print(json.dumps({"ready": report["ready"], "reason_count": len(report["reasons"])}, sort_keys=True))


if __name__ == "__main__":
    main()
