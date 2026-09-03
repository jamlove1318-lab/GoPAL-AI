"""Headless CI entry point for the Cassidy Blender production gate.

This file is executable directly by Blender after the repository's
``tools/blender`` directory is on ``sys.path``. It intentionally fails closed:
without a real authored Cassidy scene the process exits non-zero.
"""

import json
import sys
from pathlib import Path

# Support both ``blender --python`` execution and package/module execution.
TOOLS_ROOT = Path(__file__).resolve().parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.cassidy_production_gate import evaluate_production_readiness


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
