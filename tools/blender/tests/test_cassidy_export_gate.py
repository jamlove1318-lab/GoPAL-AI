"""Headless regression test for Cassidy's export boundary.

The test intentionally uses an empty factory scene. A clean scene must never
be exportable as production Cassidy, even if exporter dependencies are present.
"""

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

    assert report["ready"] is False, "Empty factory scene must not pass Cassidy production gate"
    assert report.get("reasons"), "Blocked production report must explain why export is blocked"

    # The test is deliberately structural: no GLB is written and no authored
    # geometry is synthesized just to make the gate pass.
    print(json.dumps({
        "ready": report["ready"],
        "reason_count": len(report["reasons"]),
        "reasons": report["reasons"],
        "objects": len(bpy.data.objects),
        "production_asset_created": False,
        "status": "CASSIDY_EXPORT_BOUNDARY_OK",
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
