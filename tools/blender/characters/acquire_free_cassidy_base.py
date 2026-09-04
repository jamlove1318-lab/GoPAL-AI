"""Acquire and inventory a free human base candidate for Cassidy.

This module deliberately separates acquisition from acceptance. A downloaded
candidate is never automatically declared Cassidy and is never automatically
copied into the canonical source registry.

Preferred source: Blender Studio's free Stylized Character Workflow base
meshes. The public documentation describes full stylized human base meshes
with evenly distributed quad topology, closed volumes, face sets and UDIM UVs.
Because the public page may require an interactive download/login depending on
current Blender Studio delivery, the script supports an explicit local source
path as well as an explicit URL instead of guessing a hidden bundle URL.

Fallback: a locally downloaded MakeHuman/MPFB asset. MPFB's bundled graphical
assets are CC0 according to its upstream license documentation.

Usage:
    # Inventory an already downloaded candidate:
    python3 tools/blender/characters/acquire_free_cassidy_base.py \
        --source /path/to/candidate.blend \
        --name "Blender Studio Stylized Female Base" \
        --license CC0-1.0 \
        --source-url https://studio.blender.org/training/stylized-character-workflow/base-meshes/

    # Download from an explicitly supplied URL:
    python3 tools/blender/characters/acquire_free_cassidy_base.py \
        --url <direct-download-url> \
        --name "..." \
        --license CC0-1.0 \
        --source-url <publisher-page>

Artifacts are intentionally kept outside tracked source under:
    artifacts/cassidy/free-base-source/
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
OUTPUT_ROOT = REPO_ROOT / "artifacts" / "cassidy" / "free-base-source"
PROVENANCE = OUTPUT_ROOT / "source-provenance.json"

DEFAULT_PUBLISHER_PAGE = (
    "https://studio.blender.org/training/stylized-character-workflow/base-meshes/"
)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "GoPAL-AI-Cassidy-Asset-Pipeline/1.1"},
    )
    with urllib.request.urlopen(request, timeout=180) as response, destination.open("wb") as out:
        shutil.copyfileobj(response, out)
    if destination.stat().st_size == 0:
        raise RuntimeError("Downloaded source is empty")


def _copy_source(source: Path) -> Path:
    source = source.expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Source does not exist: {source}")
    destination = OUTPUT_ROOT / source.name
    if source != destination:
        shutil.copy2(source, destination)
    return destination


def _inventory_file(path: Path) -> dict:
    return {
        "path": str(path.relative_to(OUTPUT_ROOT)),
        "size": path.stat().st_size,
        "sha256": _sha256(path),
        "suffix": path.suffix.lower(),
    }


def _write_provenance(args: argparse.Namespace, source_file: Path) -> dict:
    payload = {
        "version": "3N.2-free-base-acquisition",
        "candidate": {
            "name": args.name,
            "file": _inventory_file(source_file),
            "source_url": args.source_url or DEFAULT_PUBLISHER_PAGE,
            "license": args.license,
        },
        "policy": {
            "automatic_cassidy_assignment": False,
            "automatic_visual_approval": False,
            "hero_intake_required": True,
            "semantic_mapping_required": True,
            "canonical_preservation_baseline_required": True,
            "human_visual_review_required": True,
        },
        "next_step": "Run Cassidy hero intake against this candidate; do not bypass the source contract.",
    }
    PROVENANCE.parent.mkdir(parents=True, exist_ok=True)
    PROVENANCE.write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return payload


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Acquire/inventory a free Cassidy base candidate")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--source", type=Path, help="Existing local .blend/.glb/.gltf/.fbx candidate")
    group.add_argument("--url", help="Explicit direct-download URL supplied by the publisher")
    parser.add_argument("--name", required=True, help="Publisher/candidate name")
    parser.add_argument("--license", required=True, help="Exact published license, e.g. CC0-1.0 or CC-BY")
    parser.add_argument("--source-url", help="Publisher/source page URL for provenance")
    args = parser.parse_args(argv)

    try:
        OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
        if args.source:
            source_file = _copy_source(args.source)
        else:
            suffix = Path(urllib.request.urlparse(args.url).path).suffix or ".asset"
            destination = OUTPUT_ROOT / f"downloaded-candidate{suffix}"
            print(f"[Cassidy-Base] Downloading explicit source URL: {args.url}")
            _download(args.url, destination)
            source_file = destination

        payload = _write_provenance(args, source_file)
        print(f"[Cassidy-Base] Candidate: {payload['candidate']['name']}")
        print(f"[Cassidy-Base] File: {source_file}")
        print(f"[Cassidy-Base] SHA-256: {payload['candidate']['file']['sha256']}")
        print(f"[Cassidy-Base] License: {payload['candidate']['license']}")
        print(f"[Cassidy-Base] Provenance: {PROVENANCE}")
        print("[Cassidy-Base] Candidate acquired; Cassidy acceptance is still gated.")
        return 0
    except Exception as exc:
        print(f"[Cassidy-Base] BLOCKED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
