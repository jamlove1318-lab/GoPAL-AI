"""Reusable, fail-closed checklist for Cassidy asset authoring handoff.

The checklist is derived from the canonical ``docs/cassidy-character-reference.md``.
It describes what an artist/DCC pipeline must deliver; it never creates geometry,
approves visuals, or substitutes procedural primitives for authored work.
"""

CHECKLIST_VERSION = "3N.34"

AUTHORING_STAGES = (
    ("reference", "Lock the canonical Cassidy concept/reference and identity."),
    ("blockout", "Author the full-body heroic-realism silhouette and proportions."),
    ("face", "Author a distinctive face with near-black warm-brown eyes and readable eyelids."),
    ("hair", "Author rich dark-chocolate hair with subtle warm highlights and a side braid."),
    ("outfit", "Author the Emerald Valley vest, cream blouse, leather gear, trousers and boots."),
    ("charm", "Author the luminous Leaf-Star Compass Charm with emerald/teal center and gold."),
    ("materials", "Author PBR materials with natural skin, fabric, leather, metal and glow separation."),
    ("rig", "Author a full-body deformation rig with production-safe bindings."),
    ("facial-rig", "Author advanced facial controls, 60+ blendshapes, independent eyes, eyelids and gaze."),
    ("animation", "Author fluid Idle Breath, Walk, Run, Talk, Think and Celebrate performance."),
    ("lod", "Deliver LOD0/LOD1/LOD2/LOD3 with identity and readability preserved."),
    ("review", "Render Front, 3/4 Front, Side and 3/4 Back plus required presentation shots; pass every visual gate."),
)

IDENTITY_LOCKS = (
    "face",
    "eyes",
    "hair",
    "side-braid",
    "body-proportions",
    "core-silhouette",
    "emerald-valley-outfit",
    "leaf-star-compass-charm",
    "world-consistency",
)

REFERENCE_REQUIREMENTS = {
    "triangle_range": {"min": 15000, "max": 45000},
    "facial_blendshapes_min": 60,
    "lod_levels": ["LOD0", "LOD1", "LOD2", "LOD3"],
    "expressions": [
        "neutral", "happy", "curious", "excited", "surprised",
        "thoughtful", "playful", "concerned", "gentle",
    ],
    "poses": [
        "greeting", "explaining", "listening", "thinking", "encouraging", "celebrating",
    ],
    "animations": ["idle-breath", "walk", "run", "talk", "think", "celebrate"],
    "hair_pipeline": "Hair Cards + Strand Hybrid",
    "texture_resolution": "2K-4K PBR",
    "platforms": ["mobile", "tablet", "desktop"],
}


def authoring_handoff_checklist() -> dict:
    return {
        "version": CHECKLIST_VERSION,
        "character": "Cassidy",
        "status": "not-started",
        "source_of_truth": "docs/cassidy-character-reference.md",
        "stages": [
            {"id": stage_id, "instruction": instruction, "status": "pending"}
            for stage_id, instruction in AUTHORING_STAGES
        ],
        "identity_locks": list(IDENTITY_LOCKS),
        "reference_requirements": REFERENCE_REQUIREMENTS,
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
    if checklist.get("source_of_truth") != "docs/cassidy-character-reference.md":
        errors.append("Checklist source of truth must be docs/cassidy-character-reference.md.")
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
