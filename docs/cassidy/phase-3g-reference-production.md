# Cassidy Phase 3G — Reference Package & Production Intake

Phase 3G turns Cassidy's approved visual direction into a controlled reference-intake layer for the external art pipeline.

## Goal

The runtime must never guess Cassidy's appearance. Art production may create derivative references and production assets, but every one of them must trace back to the canonical concept and remain identity-locked.

## Reference set

The package contains exactly these 14 reference kinds:

1. `hero-full-body`
2. `front`
3. `three-quarter-front`
4. `side`
5. `three-quarter-back`
6. `back`
7. `face-closeup`
8. `eye-closeup`
9. `hair`
10. `base-outfit`
11. `expression-sheet`
12. `pose-sheet`
13. `accessory`
14. `material-sheet`

The canonical concept remains the source of truth. The existing production asset registry remains the asset metadata owner; Phase 3G does not introduce another registry.

## Approval states

- `pending` — asset has not passed review.
- `approved` — safe to use as production input.
- `revision-required` — authored asset exists but must be corrected.
- `rejected` — asset cannot enter production.

A reference being present is not equivalent to being approved.

## Identity lock

Every reference carries:

- `characterId = cassidy`
- `identityLocked = true`
- `canonicalSource = cassidy-canonical-concept-v1`
- a source production-asset ID
- a version
- an approval state

No derivative reference is allowed to redefine Cassidy's face, eyes, hair silhouette, body identity, signature charm, or core proportions.

## Production unlock

`canCassidyProductionBegin()` requires every required reference to be approved. This prevents the art pipeline from silently proceeding with missing or guessed references.

The intended order is:

`canonical concept → reference package → approval → 3D production → validation → runtime integration`

## External art handoff

The authored assets themselves are produced outside the TypeScript runtime. The repository contracts are the intake boundary for Blender/DCC work. A generic avatar, placeholder mesh, or unrelated generated character must never be promoted into the Cassidy production package merely to satisfy a missing asset slot.

## Future binary intake

When the real reference image and later production files are available, they should be added to the documented asset paths and registered by version/checksum as appropriate. The code is intentionally ready for that intake without pretending that artwork already exists.

## Definition of done for Phase 3G

- Reference package contract exists.
- All 14 reference kinds are explicitly enumerated.
- Reference-to-production traceability is explicit.
- Approval states are machine-readable.
- Identity remains locked.
- Duplicate reference IDs/kinds are rejected.
- Missing required references are rejected.
- Production cannot begin until all references are approved.
- Existing production asset registry remains the single asset metadata owner.
- No visual placeholder is introduced.
