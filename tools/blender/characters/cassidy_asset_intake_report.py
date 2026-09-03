"""Generate a deterministic report for an authored Cassidy source asset.

This compatibility entrypoint delegates to the current 3N.32 intake layer so
older tooling does not maintain a second, drifting source-validation contract.
"""

import json
import sys
from pathlib import Path

TOOLS_ROOT = Path(__file__).resolve().parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.cassidy_asset_authoring_intake import validate_source_asset


def build_intake_report(source_path: str) -> dict:
    source = validate_source_asset(source_path)
    return {
        "character": "Cassidy",
        "intake_version": source["version"],
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
    return 0 if report["source"]["valid"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
