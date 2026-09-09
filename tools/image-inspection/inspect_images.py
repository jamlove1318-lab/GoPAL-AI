#!/usr/bin/env python3
"""Deterministic repository image inspection for Cassidy source assets.

This is an asset-quality/intake inspector, not a semantic vision model. It reads
raster pixels with Pillow and emits machine-readable JSON plus optional contact
sheets so downstream tooling can verify the source package without modifying it.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageStat

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tif", ".tiff"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def average_hash(image: Image.Image, size: int = 32) -> str:
    gray = image.convert("L").resize((size, size), Image.Resampling.LANCZOS)
    pixels = list(gray.getdata())
    mean = sum(pixels) / len(pixels)
    bits = "".join("1" if value >= mean else "0" for value in pixels)
    return f"{int(bits, 2):0{size * size // 4}x}"


def inspect(path: Path) -> dict[str, Any]:
    result: dict[str, Any] = {
        "path": path.as_posix(),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
    }
    with Image.open(path) as image:
        image.load()
        result.update(
            {
                "format": image.format,
                "mode": image.mode,
                "width": image.width,
                "height": image.height,
                "aspect_ratio": round(image.width / image.height, 6) if image.height else None,
                "bands": list(image.getbands()),
                "has_alpha": "A" in image.getbands(),
                "bbox": list(image.getbbox()) if image.getbbox() else None,
                "entropy": round(image.entropy(), 6),
                "mean_channels": [round(v, 4) for v in ImageStat.Stat(image.convert("RGB")).mean],
                "ahash_32": average_hash(image),
            }
        )
        if "A" in image.getbands():
            alpha = image.getchannel("A")
            alpha_stat = ImageStat.Stat(alpha)
            result["alpha_mean"] = round(alpha_stat.mean[0], 4)
            result["alpha_extrema"] = list(alpha_stat.extrema[0])
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--output", type=Path, default=Path("artifacts/cassidy-image-inspection/manifest.json"))
    parser.add_argument("--pattern", action="append", default=[])
    args = parser.parse_args()

    patterns = args.pattern or ["cassidy_canonical_*.jpg", "cassidy_master_showcase.png"]
    paths: set[Path] = set()
    for pattern in patterns:
        paths.update(p for p in args.root.rglob(pattern) if p.is_file() and p.suffix.lower() in EXTENSIONS)

    images = []
    failures = []
    for path in sorted(paths):
        try:
            images.append(inspect(path))
        except Exception as exc:  # fail closed: one bad source must be visible
            failures.append({"path": path.as_posix(), "error": f"{type(exc).__name__}: {exc}"})

    payload = {
        "schema": "gopal.cassidy.image-inspection.v1",
        "purpose": "repository-side raster asset inspection; no identity approval",
        "source_patterns": patterns,
        "image_count": len(images),
        "failure_count": len(failures),
        "images": images,
        "failures": failures,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({"image_count": len(images), "failure_count": len(failures), "output": args.output.as_posix()}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
