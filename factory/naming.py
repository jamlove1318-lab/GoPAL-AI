"""Deterministic naming utilities for production assets."""
from __future__ import annotations
import re
from typing import Iterable

VALID_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")


def sanitize_name(name: str) -> str:
    name = re.sub(r"[^A-Za-z0-9_]+", "_", name)
    return re.sub(r"_+", "_", name).strip("_")


def is_valid_name(name: str) -> bool:
    return bool(VALID_NAME.fullmatch(name))


def require_name(name: str) -> str:
    clean = sanitize_name(name)
    if not clean:
        raise ValueError("Production asset name cannot be empty.")
    if not is_valid_name(clean):
        raise ValueError(f"Invalid production asset name: {name!r}")
    return clean


def require_unique_object_names(objects: Iterable) -> list[str]:
    seen = set()
    errors = []
    for obj in objects:
        name = getattr(obj, "name", str(obj))
        if name in seen:
            errors.append(f"Duplicate object name: {name}")
        seen.add(name)
    return errors
