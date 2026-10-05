"""
Deterministic naming utilities for GoPAL-AI production assets.
Reuses and extends canonical naming contracts.
"""

import re
from typing import Iterable, List


VALID_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")


def sanitize_name(name: str) -> str:
    """Sanitize any raw string into a clean production identifier."""
    name = re.sub(r"[^A-Za-z0-9_]+", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.strip("_")


def is_valid_name(name: str) -> bool:
    """Verify string complies with production naming contract."""
    return bool(VALID_NAME.fullmatch(name))


def require_name(name: str) -> str:
    """Ensure clean production asset name or raise ValueError."""
    clean = sanitize_name(name)

    if not clean:
        raise ValueError("Production asset name cannot be empty.")

    if not is_valid_name(clean):
        raise ValueError(f"Invalid production asset name: {name!r}")

    return clean


def require_unique_object_names(objects: Iterable) -> List[str]:
    """Verify that all objects in the collection have distinct names."""
    seen = set()
    errors = []

    for obj in objects:
        name = getattr(obj, "name", str(obj))
        if name in seen:
            errors.append(f"Duplicate object name: {name}")
        seen.add(name)

    return errors
