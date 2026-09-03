# Cassidy Phase 3N.37 — Package Round-Trip Integrity

## Purpose

The Cassidy production package now has a portable integrity boundary independent
of Blender scene state.

## Flow

`authored Blender scene → production gate → GLB → manifest + evidence → round-trip checker`

The round-trip checker verifies:

- Cassidy identity
- GLB runtime format
- positive model size
- SHA-256 metadata
- canonical expression coverage
- canonical animation coverage
- LOD coverage
- production readiness
- validation evidence
- exported model checksum when the model is present beside the manifest

## Safety rules

The checker never repairs a package, modifies geometry, or upgrades a failed
manifest. Missing or contradictory evidence remains a failure.

## Current limitation

No production Cassidy GLB exists in the repository yet. This phase therefore
adds the acceptance mechanism; it does not manufacture a test character.

## Acceptance

A real authored Cassidy package must pass both the Blender production gate and
this portable round-trip check before it is considered suitable for runtime
intake.
