# Cassidy Phase 3H — Canonical Reference Intake

Phase 3H establishes a machine-readable boundary between the exact approved canonical artwork and the authored production reference set.

## Source of truth

The canonical artwork is the exact repository binary:

`file_00000000642c821198cbd141ddc7e8d7.png`

It is recorded on the `main` branch and remains identity-locked. The runtime must not replace it with another image, generated avatar, placeholder, recolor, or approximation.

## Why this phase exists

The repository can verify that the binary exists and can preserve its provenance, but pixel-level visual analysis must only be recorded after an image-capable inspection step actually examines the artwork.

Therefore Phase 3H explicitly separates:

1. **Binary provenance** — where the real canonical image comes from.
2. **Visual inspection** — what the image actually contains.
3. **Production derivation** — the authored turnaround, face, eyes, hair, clothing, expression, pose, accessory and material references.

This prevents accidental invention of visual facts.

## Intake record

`src/characters/cassidyCanonicalReferenceIntake.ts` owns the intake contract. It does not create another asset registry or another character identity system.

The record tracks:

- exact source URI
- approved repository branch
- optional blob/checksum/size metadata
- visual inspection status
- inspection provenance
- confidence
- observations by production-critical category
- required-reference coverage
- review notes

## Inspection gate

The canonical image begins in `pending-visual-inspection` state.

It may become `inspected`, `revision-required`, or `approved` only through a real inspection workflow. An `approved` analysis requires inspection provenance, confidence, and actual observations.

No code path may treat an uninspected image as visually analyzed.

## Production categories

The inspection schema reserves explicit fields for:

- face
- eyes
- hair
- body
- outfit
- accessory
- materials
- silhouette
- palette
- proportions

These fields are intentionally empty until the artwork is actually inspected.

## Reference derivation

Once visual inspection is complete, the production team derives the 14 required references already defined by Phase 3G:

`hero-full-body`, `front`, `three-quarter-front`, `side`, `three-quarter-back`, `back`, `face-closeup`, `eye-closeup`, `hair`, `base-outfit`, `expression-sheet`, `pose-sheet`, `accessory`, `material-sheet`.

Those derivatives remain governed by the existing reference package and production asset registry.

## Definition of done

Phase 3H is complete when:

- the exact canonical binary remains the source of truth;
- provenance is machine-readable;
- visual inspection has real evidence and provenance;
- production-critical observations are recorded;
- the 14-reference derivation can proceed without guessing;
- no duplicate registry or character-state owner is introduced;
- the resulting production package remains compatible with the existing runtime contracts.
