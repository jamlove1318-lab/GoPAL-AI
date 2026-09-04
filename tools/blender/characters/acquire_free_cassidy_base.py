"""Acquire a free, permissively licensed human base for Cassidy authoring.

This helper never marks a downloaded asset as Cassidy automatically. It only
acquires and inventories a source so the existing hero-intake + semantic
mapping gates can decide whether it is suitable.

Default source: Blender Studio Human Base Meshes v1.2.0. The source bundle is
published by Blender and the human-base assets are CC0; the helper records the
source URL and expected license in a local manifest for provenance.

Usage (from the repository root):
    python3 tools/blender/characters/acquire_free_cassidy_base.py

The downloaded archive is intentionally kept outside Git-tracked source under
artifacts/cassidy/free-base-source/.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
OUTPUT_ROOT = REPO_ROOT / "artifacts" / "cassidy" / "free-base-source"
ARCHIVE = OUTPUT_ROOT / "human-base-meshes-bundle-v1.2.0.zip"
EXTRACTED = OUTPUT_ROOT / "human-base-meshes"
MANIFEST = OUTPUT_ROOT / "source-provenance.json"

SOURCE_URL = (
    "https://download.blender.org/demo/asset-bundles/human-base-meshes/"
    "human-base-meshes-bundle-v1.2.0.zip"
)
SOURCE_LICENSE = "CC0-1.0"
SOURCE_NAME = "Blender Studio Human Base Meshes v1.2.0"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    if ARCHIVE.exists() and ARCHIVE.stat().st_size > 0:
        print(f"[Cassidy-Base] Reusing {ARCHIVE}")
        return
    print(f"[Cassidy-Base] Downloading {SOURCE_NAME}")
    print(f"[Cassidy-Base] Source: {SOURCE_URL}")
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "GoPAL-AI-Cassidy-Asset-Pipeline/1.0"},
    )
    with urllib.request.urlopen(request, timeout=120) as response, ARCHIVE.open("wb") as out:
        shutil.copyfileobj(response, out)
    if ARCHIVE.stat().st_size == 0:
        raise RuntimeError("Downloaded base-mesh archive is empty")


def extract() -> None:
    if EXTRACTED.exists():
        return
    print(f"[Cassidy-Base] Extracting to {EXTRACTED}")
    EXTRACTED.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ARCHIVE) as archive:
        for member in archive.infolist():
            # Prevent zip-slip while preserving the vendor bundle layout.
            target = (EXTRACTED / member.filename).resolve()
            if not str(target).startswith(str(EXTRACTED.resolve()) + "/") and target != EXTRACTED.resolve():
                raise RuntimeError(f"Unsafe archive member: {member.filename}")
        archive.extractall(EXTRACTED)


def inventory() -> dict:
    files = []
    for path in sorted(EXTRACTED.rglob("*")):
        if path.is_file():
            files.append({
                "path": str(path.relative_to(EXTRACTED)),
                "size": path.stat().st_size,
                "sha256": _sha256(path),
            })
    return {
        "version": "3N.1-free-base-acquisition",
        "source_name": SOURCE_NAME,
        "source_url": SOURCE_URL,
        "license": SOURCE_LICENSE,
        "download_sha256": _sha256(ARCHIVE),
        "files": files,
        "policy": {
            "automatic_cassidy_assignment": False,
            "hero_intake_required": True,
            "semantic_mapping_required": True,
            "human_visual_review_required": True,
        },
    }


def main() -> int:
    try:
        download()
        extract()
        payload = inventory()
        MANIFEST.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(f"[Cassidy-Base] Provenance: {MANIFEST}")
        print(f"[Cassidy-Base] Files inventoried: {len(payload['files'])}")
        print("[Cassidy-Base] NEXT: pass a suitable extracted .blend to the hero-intake pipeline.")
        return 0
    except Exception as exc:
        print(f"[Cassidy-Base] BLOCKED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
