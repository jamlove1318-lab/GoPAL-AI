"""Deterministic naming utilities for production assets."""

import re

_VALID_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")


def sanitize_name(name: str) -> str:
    clean = re.sub(r"[^A-Za-z0-9_]+", "_", name)
    clean = re.sub(r"_+", "_", clean)
    return clean.strip("_")


def is_valid_name(name: str) -> bool:
    return bool(_VALID_NAME.fullmatch(name))


def require_name(name: str) -> str:
    clean = sanitize_name(name)
    if not clean or not is_valid_name(clean):
        raise ValueError(f"Invalid production asset name: {name!r}")
    return clean


def find_duplicate_names(names) -> list[str]:
    seen = set()
    duplicates = set()
    for name in names:
        if name in seen:
            duplicates.add(name)
        seen.add(name)
    return sorted(duplicates)
