"""Single acceptance orchestration for Cassidy production packages.

This is an orchestration layer only. Existing validators remain authoritative;
this module never repairs assets or duplicates their validation rules.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .cassidy_production_gate import evaluate_production_readiness
from .cassidy_validation_evidence import build_validation_evidence, summarize_evidence
from .cassidy_package_roundtrip import inspect_package

ACCEPTANCE_VERSION = "3N.38"


def evaluate_scene_acceptance(*, source_path: str | None = None) -> dict[str, Any]:
    gate = evaluate_production_readiness()
    evidence = build_validation_evidence(gate, source_path=source_path)
    accepted = gate.get("ready") is True and evidence.get("production_ready") is True
    return {
        "acceptance_version": ACCEPTANCE_VERSION,
        "status": "ACCEPTED" if accepted else "BLOCKED",
        "production_gate": gate,
        "evidence": evidence,
        "summary": summarize_evidence(evidence),
    }


def evaluate_package_acceptance(manifest_path: str | Path) -> dict[str, Any]:
    result = inspect_package(manifest_path)
    return {
        "acceptance_version": ACCEPTANCE_VERSION,
        "status": "ACCEPTED" if result["valid"] else "BLOCKED",
        "roundtrip": result,
    }


def write_acceptance_report(report: dict[str, Any], output_path: str | Path) -> Path:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path
