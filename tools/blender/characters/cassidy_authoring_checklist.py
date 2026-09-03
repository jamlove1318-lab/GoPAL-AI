"""Reusable, fail-closed checklist for Cassidy asset authoring handoff.

This module describes the order in which a real artist-authored Cassidy asset
should be built and reviewed. It does not create geometry or mark any gate as
passed. The same checklist can be reused by future character factories.
"""

CHECKLIST_VERSION = "3N.33"

AUTHORING_STAGES = (
    ("reference", "Lock the canonical Cassidy concept and approved identity."),
    ("blockout", "Establish authored full-body silhouette and proportions."),
    ("face", "Author the face, eyes, eyelids, and readable facial forms."),
    ("hair", "Author the layered hair silhouette and secondary-motion structure."),
    ("outfit", "Author clothing construction and world-safe material separation."),
    ("charm", "Author the signature leaf-star-compass charm as a secondary asset."),
    ("materials", "Author production materials for all required material slots."),
    ("rig", "Author the full-body deformation rig and verified bindings."),
    ("facial-rig", "Author facial controls, expressions, eyelids, and gaze."),
    ("animation", "Author the required movement and interaction clips."),
    ("lod", "Author validated mobile LOD0/LOD1/LOD2 variants without identity loss."),
    ("review", "Complete every visual review gate before production approval."),
)

IDENTITY_LOCKS = (
    "face",
    "eyes",
    "hair",
    "body-proportions",
    "core-silhouette",
    "signature-charm",
)


def authoring_handoff_checklist() -> dict:
    return {
        "version": CHECKLIST_VERSION,
        "character": "Cassidy",
        "status": "not-started",
        "stages": [
            {"id": stage_id, "instruction": instruction, "status": "pending"}
            for stage_id, instruction in AUTHORING_STAGES
        ],
        "identity_locks": list(IDENTITY_LOCKS),
        "policy": "authored-only",
        "approval": "production-gate-required",
    }


def validate_checklist(checklist: dict) -> dict:
    errors = []
    if not isinstance(checklist, dict):
        return {"valid": False, "errors": ["Checklist is missing."]}
    if checklist.get("version") != CHECKLIST_VERSION:
        errors.append("Authoring checklist version mismatch.")
    if checklist.get("character") != "Cassidy":
        errors.append("Checklist character must be Cassidy.")
    stages = checklist.get("stages")
    if not isinstance(stages, list):
        errors.append("Authoring stages are missing.")
    else:
        expected = [stage_id for stage_id, _ in AUTHORING_STAGES]
        actual = [stage.get("id") for stage in stages if isinstance(stage, dict)]
        if actual != expected:
            errors.append("Authoring stage order or coverage does not match the production workflow.")
    if checklist.get("policy") != "authored-only":
        errors.append("Checklist must use the authored-only policy.")
    return {"valid": not errors, "errors": errors}


if __name__ == "__main__":
    report = authoring_handoff_checklist()
    print("=== CASSIDY_AUTHORING_CHECKLIST_READY ===")
    print(report)
