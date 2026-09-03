"""Headless CI entry point for the Cassidy Blender production gate.

This command is intentionally fail-closed: without a real authored Cassidy
scene the process exits non-zero and reports exactly which production gates
remain incomplete.
"""

import json
import sys

from .cassidy_production_gate import evaluate_production_readiness


def main() -> int:
    report = evaluate_production_readiness()
    print("=== CASSIDY_PRODUCTION_GATE ===")
    print(json.dumps(report, indent=2, sort_keys=True))
    if report["ready"]:
        print("=== CASSIDY_PRODUCTION_GATE_PASS ===")
        return 0
    print("=== CASSIDY_PRODUCTION_GATE_BLOCKED ===")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
