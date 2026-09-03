"""Deterministic evidence model for Cassidy production validation.

This module does not decide whether a character is visually beautiful. It
normalizes validator output into an auditable report so every production gate
has explicit evidence, reasons, and provenance.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Mapping

EVIDENCE_VERSION = "3N.35"
DOMAINS = (
    "authoring",
    "mesh",
    "body_rig",
    "deformation",
    "face",
    "facial_rig",
    "hair_charm",
    "outfit_materials",
    "lod",
    "mobile_lod",
    "animation",
    "animation_authoring",
    "visual_review",
)


def _bool(value: Any) -> bool:
    return value is True


def _domain_evidence(domain: str, result: Mapping[str, Any] | None) -> dict[str, Any]:
    result = result or {}
    valid = _bool(result.get("valid"))
    reasons = result.get("reasons", result.get("issues", []))
    if isinstance(reasons, str):
        reasons = [reasons]
    if not isinstance(reasons, list):
        reasons = list(reasons) if reasons else []
    return {
        "domain": domain,
        "valid": valid,
        "status": "pass" if valid else "block",
        "reasons": [str(item) for item in reasons],
    }


def build_validation_evidence(
    gate_result: Mapping[str, Any],
    *,
    source_path: str | None = None,
    model_path: str | None = None,
) -> dict[str, Any]:
    """Normalize a production-gate result into deterministic evidence.

    Unknown/missing domains remain visible instead of being silently treated as
    successful. This is intentionally fail-closed.
    """
    evidence = []
    for domain in DOMAINS:
        raw = gate_result.get(domain)
        evidence.append(_domain_evidence(domain, raw if isinstance(raw, Mapping) else None))

    gate_ready = _bool(gate_result.get("ready"))
    missing = [item["domain"] for item in evidence if not item["valid"]]
    return {
        "evidence_version": EVIDENCE_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "production_ready": gate_ready and not missing,
        "source_path": source_path,
        "model_path": model_path,
        "domains": evidence,
        "blocking_domains": missing,
        "gate_reasons": [str(item) for item in gate_result.get("reasons", [])],
    }


def summarize_evidence(evidence: Mapping[str, Any]) -> dict[str, Any]:
    domains = evidence.get("domains", [])
    passed = sum(1 for item in domains if item.get("valid") is True)
    total = len(domains)
    return {
        "evidence_version": evidence.get("evidence_version", EVIDENCE_VERSION),
        "production_ready": evidence.get("production_ready") is True,
        "passed_domains": passed,
        "total_domains": total,
        "blocking_domains": list(evidence.get("blocking_domains", [])),
    }
