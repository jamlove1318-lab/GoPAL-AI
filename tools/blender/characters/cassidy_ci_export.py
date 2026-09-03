"""Headless CI entry point for gated Cassidy GLB export."""
from __future__ import annotations

import sys
from pathlib import Path

import bpy

TOOLS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TOOLS_ROOT.parents[1]
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.cassidy_export import export_runtime_package


def main() -> int:
    output = REPO_ROOT / "artifacts" / "cassidy"
    output.mkdir(parents=True, exist_ok=True)
    result = export_runtime_package(output)
    print("=== CASSIDY_EXPORT_PASS ===")
    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
