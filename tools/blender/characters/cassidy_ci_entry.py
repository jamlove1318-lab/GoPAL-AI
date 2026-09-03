"""GitHub/Linux entrypoint for Cassidy production.

The pipeline prepares the deterministic workspace, imports a genuine source,
applies only objective source-derived technical upgrades, validates it, and
exports only when all production gates pass.
"""
from __future__ import annotations
import json, os, sys
from pathlib import Path
from typing import Any
import bpy

TOOLS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TOOLS_ROOT.parents[1]
if str(TOOLS_ROOT) not in sys.path: sys.path.insert(0, str(TOOLS_ROOT))

from characters.build_cassidy import main as build_cassidy
from characters.cassidy_export import export_runtime_package
from characters.import_cassidy_source import import_source
from characters.cassidy_source_upgrade import upgrade_imported_cassidy_source


def _json_safe(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)): return value
    if isinstance(value, dict): return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set, frozenset)): return [_json_safe(v) for v in value]
    if isinstance(value, bpy.types.Object): return {"name": value.name, "type": value.type, "data_name": getattr(value.data, "name", None)}
    if isinstance(value, bpy.types.ID): return {"name": value.name, "type": value.__class__.__name__}
    if hasattr(value, "to_tuple"):
        try: return [_json_safe(v) for v in value.to_tuple()]
        except Exception: pass
    try: return [_json_safe(v) for v in value]
    except (TypeError, ValueError): return str(value)


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_json_safe(payload), indent=2, sort_keys=True, allow_nan=False) + "\n", encoding="utf-8")


def _source_from_environment() -> Path | None:
    raw = os.environ.get("CASSIDY_SOURCE_BLEND") or os.environ.get("CASSIDY_SOURCE_ASSET")
    if not raw: return None
    path = Path(raw).expanduser().resolve()
    if not path.is_file(): raise FileNotFoundError(f"CASSIDY_SOURCE_BLEND does not exist: {path}")
    return path


def _print_blockers(report: dict) -> None:
    quality = report.get("quality") or {}
    reasons = quality.get("reasons") or []
    if reasons:
        print("[Cassidy-CI] Remaining production blockers:")
        for reason in reasons:
            print(f"  - {reason}")
    review = quality.get("review") or {}
    errors = review.get("errors") or []
    if errors:
        print("[Cassidy-CI] Visual-review status:")
        for error in errors:
            print(f"  - {error}")


def run() -> int:
    output = REPO_ROOT / "artifacts" / "cassidy"
    output.mkdir(parents=True, exist_ok=True)
    print("[Cassidy-CI] Starting deterministic production preparation")

    report = build_cassidy()
    source = _source_from_environment()
    if source:
        print(f"[Cassidy-CI] Importing genuine source: {source}")
        report["source_intake"] = import_source(source)
        print("[Cassidy-CI] Applying source-derived technical upgrade")
        report["source_upgrade"] = upgrade_imported_cassidy_source()
        from characters.build_cassidy import validate_before_export
        report.update(validate_before_export())
    else:
        print("[Cassidy-CI] No genuine Cassidy source supplied; production remains blocked")

    _print_blockers(report)
    _write_json(output / "production-report.json", report)
    blend_path = output / "cassidy-production.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

    if not report.get("ready"):
        print("[Cassidy-CI] PRODUCTION_BLOCKED")
        return 2

    print("[Cassidy-CI] Production gate passed; exporting runtime package")
    package = export_runtime_package(output)
    _write_json(output / "export-report.json", package)
    print("[Cassidy-CI] PRODUCTION_READY")
    return 0

if __name__ == "__main__": raise SystemExit(run())
