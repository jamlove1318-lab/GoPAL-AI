"""GitHub/Linux entrypoint for Cassidy production.

The pipeline prepares the deterministic workspace, inventories and imports a
genuine source, performs strict hero-asset intake, records structural quality
evidence, applies only source-preserving technical work, validates it, and
exports only when every objective gate passes. Visual approval remains
human-controlled.
"""
from __future__ import annotations
import json, os, subprocess, sys
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
from characters.cassidy_hero_source_manifest import load_manifest, apply_manifest
from characters.cassidy_hero_quality_profile import analyze_hero_quality
from characters.cassidy_canonical_source_registry import capture_source_snapshot, write_registry
from characters.cassidy_canonical_preservation_gate import evaluate_preservation
from characters.cassidy_canonical_component_identity import inspect_component_identity
from characters.cassidy_canonical_reference_contract import load_canonical_reference


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
    path.write_text(json.dumps(_json_safe(payload), indent=2, sort_keys=True, allow_nan=False) + "\n", encoding="utf-8")


def _source_from_environment() -> Path | None:
    raw = os.environ.get("CASSIDY_SOURCE_BLEND") or os.environ.get("CASSIDY_SOURCE_ASSET")
    if not raw:
        return None
    path = Path(raw).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"CASSIDY_SOURCE_BLEND does not exist: {path}")
    return path


def _manifest_from_environment() -> Path | None:
    raw = os.environ.get("CASSIDY_SOURCE_MANIFEST")
    if not raw:
        return None
    path = Path(raw).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"CASSIDY_SOURCE_MANIFEST does not exist: {path}")
    return path


def _run_source_inventory(source: Path, output: Path) -> dict[str, Any]:
    """Run evidence-only inventory in a separate Blender process.

    The inventory loader intentionally resets/opens Blender state. Running it
    in-process would destroy the production scene, so CI isolates it in a
    second headless Blender process before the real production build.
    """
    inventory_script = Path(__file__).with_name("cassidy_source_asset_inventory.py")
    inventory_report = output / "source-asset-inventory.json"
    command = [
        bpy.app.binary_path,
        "--background",
        "--python",
        str(inventory_script),
        "--",
        str(source),
        "--output",
        str(inventory_report),
    ]
    completed = subprocess.run(
        command,
        cwd=str(REPO_ROOT),
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "inventory process failed").strip()
        raise RuntimeError(f"Source inventory failed ({completed.returncode}): {detail}")
    if not inventory_report.is_file():
        raise RuntimeError("Source inventory completed without producing its JSON report")
    return json.loads(inventory_report.read_text(encoding="utf-8"))


def _print_blockers(report: dict) -> None:
    quality = report.get("quality") or {}
    reasons = quality.get("reasons") or []
    if reasons:
        print("[Cassidy-CI] Remaining production blockers:")
        for reason in reasons:
            print(f"  - {reason}")
    detail_keys = (
        "canonical_reference", "source_asset_inventory", "hero_intake", "hero_quality_profile", "hero_component_identity", "hero_asset", "quality", "mesh", "modeling", "rig", "lod",
        "mobile_lod", "animation", "animation_authoring", "face_nodes", "expressions", "gaze", "facial_rig",
        "hair_charm", "outfit", "review", "canonical_source_preservation",
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
            "missing", "missing_components", "duplicate_components", "missing_roles", "missing_nodes", "missing_animations", "missing_expressions",
            "empty_animations", "unbound_animations", "missing_materials", "invalid_outfits", "unbound_material_slots",
            "invalid_materials", "geometry_issues", "topology_issues", "issues", "loose_geometry", "missing_uv", "errors", "reasons",
            "changed_components", "role_conflicts", "unowned_objects", "unsupported_components",
        ):
            items = value.get(field)
            if items:
                print(f"    {field}: {items}")
    review = quality.get("review") or {}
    if review.get("errors"):
        print("[Cassidy-CI] Visual-review status:")
        for error in review["errors"]:
            print(f"  - {error}")


def run() -> int:
    output = REPO_ROOT / "artifacts" / "cassidy"
    output.mkdir(parents=True, exist_ok=True)
    print("[Cassidy-CI] Starting deterministic production preparation")

    source = _source_from_environment()
    report: dict[str, Any] = {}
    if source:
        print(f"[Cassidy-CI] Inventorying genuine source in isolated Blender process: {source}")
        try:
            report["source_asset_inventory"] = _run_source_inventory(source, output)
            print("[Cassidy-CI] SOURCE_INVENTORY_PASS")
        except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as exc:
            report["source_asset_inventory"] = {"valid": False, "errors": [str(exc)]}
            print("[Cassidy-CI] SOURCE_INVENTORY_REJECTED")
            print(f"  - {exc}")
    else:
        report["source_asset_inventory"] = {
            "valid": False,
            "errors": ["No genuine Cassidy source supplied; source inventory cannot run."],
        }

    report.update(build_cassidy())
    if not report.get("source_asset_inventory", {}).get("valid", False):
        report.setdefault("quality", {}).setdefault("reasons", []).extend(
            report["source_asset_inventory"].get("errors", ["Source inventory failed."])
        )
        report["ready"] = False

    # The Markdown reference is the human-authored artistic source of truth.
    # This contract checks its identity markers but never interprets prose as
    # visual approval and never replaces a missing visual review.
    report["canonical_reference"] = load_canonical_reference(REPO_ROOT)
    if not report["canonical_reference"]["valid"]:
        report.setdefault("quality", {}).setdefault("reasons", []).extend(
            report["canonical_reference"]["errors"]
        )
        report["ready"] = False
        print("[Cassidy-CI] CANONICAL_REFERENCE_REJECTED")
        for reason in report["canonical_reference"]["errors"]:
            print(f"  - {reason}")

    manifest_path = _manifest_from_environment()
    if source and report["canonical_reference"]["valid"]:
        print(f"[Cassidy-CI] Importing genuine source: {source}")
        report["source_intake"] = import_source(source)

        if manifest_path:
            print(f"[Cassidy-CI] Applying explicit source manifest: {manifest_path}")
            try:
                manifest = load_manifest(manifest_path)
                report["source_manifest"] = apply_manifest(manifest)
            except (OSError, ValueError, json.JSONDecodeError) as exc:
                report["source_manifest"] = {"valid": False, "errors": [str(exc)]}
        else:
            report["source_manifest"] = {
                "valid": False,
                "errors": ["No CASSIDY_SOURCE_MANIFEST supplied; semantic component mapping remains unverified."],
            }

        print("[Cassidy-CI] Running strict hero-asset intake gate")
        report["hero_intake"] = validate_hero_source()
        print("[Cassidy-CI] Recording 3N.22 hero quality evidence")
        report["hero_quality_profile"] = analyze_hero_quality()
        if not report["hero_intake"]["valid"]:
            print("[Cassidy-CI] HERO_ASSET_REJECTED")
            for reason in report["hero_intake"]["reasons"]:
                print(f"  - {reason}")
        elif not report.get("source_manifest", {}).get("valid"):
            print("[Cassidy-CI] HERO_ASSET_MAPPING_REJECTED")
            for reason in report["source_manifest"]["errors"]:
                print(f"  - {reason}")
        else:
            report["hero_registration"] = register_authored_source()
            report["hero_component_identity"] = inspect_component_identity()
            if not report["hero_component_identity"]["valid"]:
                print("[Cassidy-CI] HERO_COMPONENT_IDENTITY_REJECTED")
                report.setdefault("quality", {}).setdefault("reasons", []).extend(
                    report["hero_component_identity"]["errors"]
                )
                report["ready"] = False
            else:
                report["canonical_source_before"] = capture_source_snapshot("before-technical-processing")
                registry_path = output / "canonical-source-registry.json"
                write_registry(registry_path, report["canonical_source_before"], "source-intake")
                print("[Cassidy-CI] Applying source-derived technical upgrade")
                report["source_upgrade"] = upgrade_imported_cassidy_source()
                print("[Cassidy-CI] Running complete source-preserving production authoring pass")
                report["production_authoring"] = run_production_authoring(bpy.data.objects.get("Cassidy_Armature"))
                report["canonical_source_after"] = capture_source_snapshot("after-technical-processing")
                report["canonical_source_preservation"] = evaluate_preservation(
                    report["canonical_source_before"], report["canonical_source_after"]
                )
                _write_json(output / "canonical-source-preservation.json", report["canonical_source_preservation"])
                if not report["canonical_source_preservation"]["valid"]:
                    report.setdefault("quality", {}).setdefault("reasons", []).extend(
                        report["canonical_source_preservation"]["reasons"]
                    )
                    report["ready"] = False
                    print("[Cassidy-CI] CANONICAL_SOURCE_PRESERVATION_REJECTED")
                else:
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
