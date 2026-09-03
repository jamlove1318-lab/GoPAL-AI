# Cassidy Phase 3N.26 — Mobile LOD and Performance Budgets

## Purpose

3N.26 establishes a reusable measurement layer for Cassidy's three authored
mobile LOD tiers.

## LOD tiers

- **LOD0** — hero/high-quality presentation.
- **LOD1** — normal interactive gameplay.
- **LOD2** — distant/low-cost presentation.

The validator starts with conservative vertex and material-slot budgets:
30,000 / 18,000 / 9,000 vertices and a seven-slot material budget.
These values are explicit review targets, not automatic decimation commands.

## Identity preservation

Each LOD must retain semantic access to the face, both eyes, hair root, and
other identity-critical components. Combined meshes may use identity-part
metadata instead of separate objects.

## Non-destructive policy

No automatic decimation, texture compression, material replacement, or rig
mutation is performed by the validator. Artists choose the actual optimization
strategy and then the pipeline measures the result.

## Runtime goal

The validated LOD package feeds the existing GLB/runtime contracts so mobile
optimization does not create a second character representation or silently
change Cassidy's identity.
