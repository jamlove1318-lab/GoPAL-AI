"""Auditable evidence normalization for Cassidy production validation.

This module never invents successful evidence and never performs visual
approval. It maps the unified production gate to stable, machine-readable
validation domains. The output is deterministic for a given gate result.
"""

from __future__ import annotations

from typing import Any, Mapping

EVIDENCE_VERSION = "3N.35"

DOMAIN_KEYS = {
    "authoring": "quality",
    "mesh": "mesh",
    "modeling": "modeling",
    "body_rig": "rig",
    "deformation": "rig",
    "face": "face_nodes",
    "facial_rig": "facial_rig",
    "hair_charm": "hair_charm",
    "outfit_materials": "outfit",
    "lod": "lod",
    "mobile_lod": "mobile_lod",
    "animation": "animation",
    "animation_authoring": "animation_authoring",
    "visual_review": "review",
}


def _bool(value: Any) -> bool:
    return value is True


def _valid_for_domain(domain: str, result: Mapping[str, Any]) -> bool:
    if domain == "body_rig":
        return _bool(result.get("body_rig_valid"))
    if domain == "deformation":
        return _bool(result.get("deformation_valid"))
    if domain == "visual_review":
        return _bool(result.get("complete"))
    return _bool(result.get("valid"))


def _reasons(result: Mapping[str, Any]) -> list[str]:
    reasons = result.get("errors", result.get("reasons", result.get("issues", [])))
    if isinstance(reasons, str):
        return [reasons]
    if not reasons:
        return []
    return [str(item) for item in reasons]


def build_validation_evidence(
    gate_result: Mapping[str, Any],
    *,
    source_path: str | None = None,
    model_path: str | None = None,
) -> dict[str, Any]:
    """Create fail-closed evidence from one unified gate result."""
    domains = []
    for public_name, internal_name in DOMAIN_KEYS.items():
        raw = gate_result.get(internal_name)
        result = raw if isinstance(raw, Mapping) else {}
        valid = _valid_for_domain(public_name, result)
        domains.append({
            "domain": public_name,
            "valid": valid,
            "status": "pass" if valid else "block",
            "reasons": _reasons(result),
        })

    blocking = [item["domain"] for item in domains if not item["valid"]]
    return {
        "evidence_version": EVIDENCE_VERSION,
        "production_ready": _bool(gate_result.get("ready")) and not blocking,
        "source_path": source_path,
        "model_path": model_path,
        "domains": domains,
        "blocking_domains": blocking,
        "gate_reasons": [str(item) for item in gate_result.get("reasons", [])],
    }


def summarize_evidence(evidence: Mapping[str, Any]) -> dict[str, Any]:
    domains = evidence.get("domains", [])
    passed = sum(1 for item in domains if item.get("valid") is True)
    return {
        "evidence_version": evidence.get("evidence_version", EVIDENCE_VERSION),
        "production_ready": evidence.get("production_ready") is True,
        "passed_domains": passed,
        "total_domains": len(domains),
        "blocking_domains": list(evidence.get("blocking_domains", [])),
    }
