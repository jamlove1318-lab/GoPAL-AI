"""Acquire and inventory a free human base for Cassidy authoring.

This helper is intentionally source-only: it never assigns an asset to Cassidy
or approves visual quality. The downloaded source must still pass hero intake,
semantic mapping, source preservation, technical validation and human review.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
OUTPUT_ROOT = REPO_ROOT / "artifacts" / "cassidy" / "free-base-source"
ARCHIVE = OUTPUT_ROOT / "human-base-meshes-bundle-v1.4.1.zip"
EXTRACTED = OUTPUT_ROOT / "human-base-meshes"
MANIFEST = OUTPUT_ROOT / "source-provenance.json"

SOURCE_URL = "https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip"
SOURCE_PAGE = "https://www.blender.org/download/demo-files/"
SOURCE_LICENSE = "CC0-1.0"
SOURCE_NAME = "Blender Human Base Meshes v1.4.1"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _safe_extract(archive: zipfile.ZipFile, destination: Path) -> None:
    root = destination.resolve()
    for member in archive.infolist():
        target = (destination / member.filename).resolve()
        if not (target == root or str(target).startswith(str(root) + "/")):
            raise RuntimeError(f"Unsafe archive member: {member.filename}")
    archive.extractall(destination)


def download(force: bool = False) -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    if ARCHIVE.exists() and ARCHIVE.stat().st_size > 0 and not force:
        print(f"[Cassidy-Base] Reusing {ARCHIVE}")
        return
    print(f"[Cassidy-Base] Downloading {SOURCE_NAME}")
    print(f"[Cassidy-Base] Source: {SOURCE_URL}")
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "GoPAL-AI-Cassidy-Asset-Pipeline/1.0"})
    with urllib.request.urlopen(request, timeout=180) as response, ARCHIVE.open("wb") as out:
        shutil.copyfileobj(response, out)
    if ARCHIVE.stat().st_size == 0:
        raise RuntimeError("Downloaded base-mesh archive is empty")


def extract(force: bool = False) -> None:
    if EXTRACTED.exists() and not force:
        return
    if EXTRACTED.exists():
        shutil.rmtree(EXTRACTED)
    EXTRACTED.mkdir(parents=True, exist_ok=True)
    print(f"[Cassidy-Base] Extracting to {EXTRACTED}")
    with zipfile.ZipFile(ARCHIVE) as archive:
        _safe_extract(archive, EXTRACTED)


def inventory() -> dict:
    files = []
    for path in sorted(EXTRACTED.rglob("*")):
        if path.is_file():
            files.append({"path": str(path.relative_to(EXTRACTED)), "size": path.stat().st_size, "sha256": _sha256(path)})
    return {
        "version": "3N.2-free-base-acquisition",
        "source_name": SOURCE_NAME,
        "source_url": SOURCE_URL,
        "source_page": SOURCE_PAGE,
        "license": SOURCE_LICENSE,
        "download_sha256": _sha256(ARCHIVE),
        "files": files,
        "policy": {
            "automatic_cassidy_assignment": False,
            "hero_intake_required": True,
            "semantic_mapping_required": True,
            "source_preservation_required": True,
            "human_visual_review_required": True,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    try:
        download(args.force)
        extract(args.force)
        payload = inventory()
        MANIFEST.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(f"[Cassidy-Base] Provenance: {MANIFEST}")
        print(f"[Cassidy-Base] Files inventoried: {len(payload['files'])}")
        print("[Cassidy-Base] NEXT: select a suitable female .blend and pass it through Cassidy hero intake.")
        return 0
    except Exception as exc:
        print(f"[Cassidy-Base] BLOCKED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
