"""Generate a deterministic report for an authored Cassidy source asset.

This is an intake/reporting utility, not an asset generator. It records what
was supplied and leaves production approval to the unified gate.
"""

import json
import sys
from pathlib import Path

TOOLS_ROOT = Path(__file__).resolve().parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.cassidy_intake import inspect_asset_source


def build_intake_report(source_path: str) -> dict:
    source = inspect_asset_source(source_path)
    return {
        "character": "Cassidy",
        "intake_version": "3N.11",
        "source": source,
        "production_approval": "pending-until-gate-pass",
    }


def main(argv=None) -> int:
    argv = argv or sys.argv[1:]
    if not argv:
        print("Usage: blender --background --python cassidy_asset_intake_report.py -- <asset-path>")
        return 64
    report = build_intake_report(argv[0])
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["source"]["supported"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
