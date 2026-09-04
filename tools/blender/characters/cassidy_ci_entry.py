"""GitHub/Linux entrypoint for Cassidy production.

The pipeline prepares the deterministic workspace, imports a genuine source,
performs strict hero-asset intake, applies only source-preserving technical
work, validates it, and exports only when every objective gate passes. Visual
approval remains human-controlled.
"""
from __future__ import annotations
import json, os, sys
from pathlib import Path
from typing import Any
import bpy

TOOLS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TOOLS_ROOT.parent
if str(TOOLS_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOLS_ROOT))

from characters.build_cassidy import main as build_cassidy
from characters.cassidy_export import export_runtime_package
from characters.import_cassidy_source import import_source
from characters import cassidy_source_upgrade as _source_upgrade
from characters.cassidy_production_authoring import run_production_authoring
from characters.cassidy_visual_review_package import generate_visual_review_package
from characters.cassidy_hero_intake import validate_hero_source, register_authored_source


def _iter_action_fcurves(action):
    """Yield F-curves across Blender 3.x/4.x/5.x Action APIs."""
    direct = getattr(action, "fcurves", None)
    if direct is not None:
        yield from direct
        return
    layers = getattr(action, "layers", None)
    if layers is None:
        return
    for layer in layers:
        strips = getattr(layer, "strips", None)
        if strips is None:
            continue
        for strip in strips:
            bags = getattr(strip, "channelbags", None)
            if bags is not None:
                for bag in bags:
                    yield from getattr(bag, "fcurves", [])
                continue
            bag = getattr(strip, "channelbag", None)
            if callable(bag):
                slots = getattr(action, "slots", None)
                if slots is not None:
                    for slot in slots:
                        try:
                            candidate = bag(slot)
                        except (TypeError, RuntimeError):
                            candidate = None
                        if candidate is not None:
                            yield from getattr(candidate, "fcurves", [])
                else:
                    try:
                        candidate = bag()
                    except (TypeError, RuntimeError):
                        candidate = None
                    if candidate is not None:
                        yield from getattr(candidate, "fcurves", [])


def _patch_blender5_action_migration() -> None:
    def _migrate_action_paths_compat(old: str, new: str) -> int:
        changed = 0
        needle = f'pose.bones["{old}"]'
        replacement = f'pose.bones["{new}"]'
        for action in bpy.data.actions:
            for fcurve in _iter_action_fcurves(action):
                if needle in fcurve.data_path:
                    fcurve.data_path = fcurve.data_path.replace(needle, replacement)
                    changed += 1
        return changed
    _source_upgrade._migrate_action_paths = _migrate_action_paths_compat


_patch_blender5_action_migration()
upgrade_imported_cassidy_source = _source_upgrade.upgrade_imported_cassidy_source


def _json_safe(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set, frozenset)):
        return [_json_safe(v) for v in value]
    if isinstance(value, bpy.types.Object):
        return {"name": value.name, "type": value.type, "data_name": getattr(value.data, "name", None)}
    if isinstance(value, bpy.types.ID):
        return {"name": value.name, "type": value.__class__.__name__}
    if hasattr(value, "to_tuple"):
        try:
            return [_json_safe(v) for v in value.to_tuple()]
        except Exception:
            pass
    try:
        return [_json_safe(v) for v in value]
    except (TypeError, ValueError):
        return str(value)


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(_json_safe(payload), indent=2, sort_keys=True, allow_nan=False) + "\n",
        encoding="utf-8",
    )


def _source_from_environment() -> Path | None:
    raw = os.environ.get("CASSIDY_SOURCE_BLEND") or os.environ.get("CASSIDY_SOURCE_ASSET")
    if not raw:
        return None
    path = Path(raw).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"CASSIDY_SOURCE_BLEND does not exist: {path}")
    return path


def _print_blockers(report: dict) -> None:
    quality = report.get("quality") or {}
    reasons = quality.get("reasons") or []
    if reasons:
        print("[Cassidy-CI] Remaining production blockers:")
        for reason in reasons:
            print(f"  - {reason}")
    detail_keys = (
        "hero_intake", "hero_asset", "quality", "mesh", "modeling", "rig", "lod",
        "mobile_lod", "animation", "animation_authoring", "face_nodes", "expressions",
        "gaze", "facial_rig", "hair_charm", "outfit", "review",
    )
    print("[Cassidy-CI] Gate evidence:")
    for key in detail_keys:
        value = report.get(key)
        if not isinstance(value, dict):
            continue
        if value.get("valid", True) is True and value.get("complete", True) is True:
            continue
        print(f"  [{key}]")
        for field in (
            "missing", "missing_nodes", "missing_animations", "missing_expressions", "empty_animations",
            "unbound_animations", "missing_materials", "invalid_outfits", "unbound_material_slots",
            "invalid_materials", "geometry_issues", "topology_issues", "issues", "loose_geometry",
            "missing_uv", "errors", "reasons",
        ):
            items = value.get(field)
            if items:
                print(f"    {field}: {items}")
        for nested_key in ("budgets", "identity", "hierarchy", "contract", "timing", "metadata", "library"):
            nested = value.get(nested_key)
            if isinstance(nested, dict) and nested.get("valid") is False:
                print(f"    {nested_key}: {nested}")
    review = quality.get("review") or {}
    if review.get("errors"):
        print("[Cassidy-CI] Visual-review status:")
        for error in review["errors"]:
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

        # Intake is deliberately before technical upgrade/rendering. A failed
        # primitive placeholder should stop immediately instead of consuming
        # several minutes on subdivision, staging and five-angle rendering.
        print("[Cassidy-CI] Running strict hero-asset intake gate")
        report["hero_intake"] = validate_hero_source()
        if not report["hero_intake"]["valid"]:
            print("[Cassidy-CI] HERO_ASSET_REJECTED")
            for reason in report["hero_intake"]["reasons"]:
                print(f"  - {reason}")
        else:
            report["hero_registration"] = register_authored_source()
            print("[Cassidy-CI] Applying source-derived technical upgrade")
            report["source_upgrade"] = upgrade_imported_cassidy_source()
            print("[Cassidy-CI] Running complete source-preserving production authoring pass")
            report["production_authoring"] = run_production_authoring(bpy.data.objects.get("Cassidy_Armature"))
            from characters.build_cassidy import validate_before_export
            report.update(validate_before_export())
            print("[Cassidy-CI] Generating non-approving visual review evidence package")
            report["visual_review_package"] = generate_visual_review_package(output, report.get("quality"))
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


if __name__ == "__main__":
    raise SystemExit(run())
