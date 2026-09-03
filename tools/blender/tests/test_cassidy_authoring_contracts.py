"""Headless Blender smoke test for Cassidy production contracts."""

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

    # Metadata-only/empty factory scenes must never pass as production assets.
    assert report["ready"] is False, "Empty factory scene must fail Cassidy production gate"
    assert report["reasons"], "Blocked production must provide actionable reasons"

    required_domains = (
        "mesh", "modeling", "rig", "rig_authoring", "lod", "mobile_lod",
        "animation", "animation_authoring", "face_nodes", "expressions", "gaze",
        "facial_rig", "hair_charm", "outfit", "materials", "review",
    )
    for domain in required_domains:
        assert domain in report, f"Missing production-gate domain: {domain}"

    # These are specifically expected to fail on a clean factory scene.
    assert report["mesh"]["valid"] is False
    assert report["rig_authoring"]["valid"] is False
    assert report["mobile_lod"]["valid"] is False
    assert report["facial_rig"]["valid"] is False

    print("=== GOPAL_CASSIDY_AUTHORING_CONTRACTS_OK ===")
    print(json.dumps({"ready": report["ready"], "reason_count": len(report["reasons"]),
                      "domains": list(required_domains)}, sort_keys=True))


if __name__ == "__main__":
    main()
