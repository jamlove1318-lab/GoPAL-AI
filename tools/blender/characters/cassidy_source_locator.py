"""Deterministic discovery of the genuine Cassidy source on CI/local runners.

The authored .blend is intentionally kept outside generated artifacts and may be
large enough that it is supplied by the persistent self-hosted runner rather than
GitHub checkout. This module only discovers and verifies an existing source; it
never creates, edits, or replaces source bytes.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

DEFAULT_RELATIVE = Path("build/cassidy/source/cassidy-source.blend")
DEFAULT_ROOTS = (
    Path("/root/cassidy-github-factory"),
    Path("/workspace/GoPAL-AI"),
)


def _validate(path: Path) -> Path:
    path = path.expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Cassidy source asset not found: {path}")
    if path.suffix.lower() != ".blend":
        raise ValueError(f"Cassidy source must be a .blend file: {path}")
    return path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def discover(repo_root: Path) -> Path:
    """Return the first valid canonical source candidate in deterministic order."""
    candidates: list[Path] = []
    for key in ("CASSIDY_SOURCE_BLEND", "CASSIDY_SOURCE_ASSET"):
        raw = os.environ.get(key)
        if raw:
            candidates.append(Path(raw))

    repo_root = repo_root.expanduser().resolve()
    candidates.append(repo_root / DEFAULT_RELATIVE)
    candidates.extend(root / DEFAULT_RELATIVE for root in DEFAULT_ROOTS if root != repo_root)

    seen: set[Path] = set()
    for candidate in candidates:
        resolved = candidate.expanduser().resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        if resolved.is_file():
            source = _validate(resolved)
            expected = os.environ.get("CASSIDY_SOURCE_SHA256", "").strip().lower()
            if expected and sha256(source) != expected:
                raise RuntimeError(
                    "Cassidy source SHA-256 does not match CASSIDY_SOURCE_SHA256: "
                    f"path={source} actual={sha256(source)} expected={expected}"
                )
            return source

    searched = "\n".join(f"  - {p.expanduser().resolve()}" for p in candidates)
    raise FileNotFoundError("No genuine Cassidy source was discovered. Searched:\n" + searched)
