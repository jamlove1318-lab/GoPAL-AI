"""Headless CI entry point for the Cassidy Blender production gate.

The report contains both the unified gate and normalized audit evidence. The
process intentionally fails closed without a genuinely authored Cassidy asset.
"""

import json
import sys
from pathlib import Path

TOOLS_ROOT = Path(__file__).resolve().parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.cassidy_production_gate import evaluate_production_readiness
from characters.cassidy_validation_evidence import build_validation_evidence


def main() -> int:
    report = evaluate_production_readiness()
    evidence = build_validation_evidence(report)
    output = {"gate": report, "evidence": evidence}
    print("=== CASSIDY_PRODUCTION_GATE ===")
    print(json.dumps(output, indent=2, sort_keys=True))
    if report["ready"] and evidence["production_ready"]:
        print("=== CASSIDY_PRODUCTION_GATE_PASS ===")
        return 0
    print("=== CASSIDY_PRODUCTION_GATE_BLOCKED ===")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
