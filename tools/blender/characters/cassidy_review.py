"""Reusable visual-review metadata for Cassidy authoring.

The checklist records what must be reviewed by a human or art-validation
process. It does not mark an asset as approved by itself.
"""

import bpy

REVIEW_VERSION = "3N.12"

REVIEW_GATES = (
    "face-identity",
    "eye-expression-readability",
    "hair-silhouette",
    "body-proportions",
    "hands-and-feet",
    "outfit-construction",
    "signature-charm",
    "material-separation",
    "expression-coverage",
    "gaze-and-eyelids",
    "animation-quality",
    "world-consistency",
    "mobile-readability",
)


def create_review_record(status="pending"):
    if status not in {"pending", "pass", "fail"}:
        raise ValueError(f"Unsupported review status: {status}")
    return {
        "version": REVIEW_VERSION,
        "status": status,
        "gates": {gate: "pending" for gate in REVIEW_GATES},
    }


def ensure_scene_review_record():
    """Create a pending review record without approving any visual gate."""
    record = create_review_record()
    bpy.context.scene["gopal_cassidy_review"] = record
    return record


def validate_review_record(record):
    if not isinstance(record, dict):
        return {"valid": False, "errors": ["Review record is missing."]}
    if record.get("version") != REVIEW_VERSION:
        return {"valid": False, "errors": ["Review version mismatch."]}
    gates = record.get("gates")
    if not isinstance(gates, dict):
        return {"valid": False, "errors": ["Review gates are missing."]}
    missing = sorted(set(REVIEW_GATES) - set(gates))
    invalid = sorted(
        gate for gate, value in gates.items()
        if gate in REVIEW_GATES and value not in {"pending", "pass", "fail"}
    )
    errors = []
    if missing:
        errors.append(f"Missing review gates: {', '.join(missing)}")
    if invalid:
        errors.append(f"Invalid review statuses: {', '.join(invalid)}")
    return {"valid": not errors, "errors": errors}


def is_review_complete(record):
    validation = validate_review_record(record)
    if not validation["valid"]:
        return False
    return all(record["gates"].get(gate) == "pass" for gate in REVIEW_GATES)
