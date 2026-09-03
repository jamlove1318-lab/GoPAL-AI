# Cassidy Phase 3N.18 — Reference-Driven Modeling Guides

## Purpose

3N.18 establishes a reusable Blender workspace for creating the real Cassidy
mesh against the approved canonical reference.

The tooling is **non-destructive** and **authored-geometry-only**. It creates
measurement aids and semantic guides, never a placeholder humanoid.

## Guides

- symmetry centerline
- normalized body proportion checkpoints
- facial landmarks
- front / three-quarter / side / three-quarter-back / back view guides
- canonical reference alignment metadata

## Source of truth

The canonical Cassidy concept remains the identity reference. Geometry must be
a real authored asset. Guide positions are measurement aids and must not be
interpreted as automatically correct character proportions.

## Modeling checkpoints

1. Establish overall silhouette against the reference.
2. Confirm head/face identity before detail work.
3. Confirm eye placement and readable eye spacing.
4. Confirm hair mass and silhouette.
5. Confirm full-body proportions.
6. Confirm hands and feet are complete.
7. Confirm outfit construction and signature charm placement.
8. Run structural mesh-quality validation.
9. Proceed to rigging only after authored geometry is structurally sound.

## Quality boundary

Automated checks can detect structural failures, but they cannot approve
beauty, likeness, animation appeal, or artistic quality. Those remain explicit
visual-review gates.

## Reuse

The guide architecture is intentionally generic enough to become a reusable
character-authoring foundation for future GoPAL-AI characters while keeping
Cassidy's canonical identity locked.
