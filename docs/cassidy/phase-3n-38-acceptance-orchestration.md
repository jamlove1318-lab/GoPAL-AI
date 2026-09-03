# Cassidy Phase 3N.38 — Acceptance Orchestration

## Goal

Provide one reusable acceptance boundary without replacing the existing
specialized validators.

## Scene acceptance

`evaluate_scene_acceptance()` runs the unified production gate, converts its
result into validation evidence, and returns exactly one status:

- `ACCEPTED` only when the production gate and evidence both certify readiness.
- `BLOCKED` otherwise.

## Package acceptance

`evaluate_package_acceptance()` delegates binary/package integrity to the
existing round-trip checker and exposes the same `ACCEPTED` / `BLOCKED`
boundary.

## Design rule

This module is orchestration, not another validation implementation. Existing
mesh, rig, facial, animation, LOD, material, review, and package validators
remain authoritative.

## Safety

No geometry is generated, repaired, decimated, or promoted by this phase.
Missing evidence remains a block.
