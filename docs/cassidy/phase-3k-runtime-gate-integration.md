# Cassidy Phase 3K — Runtime Production Gate Integration

## Purpose

Phase 3K connects the Cassidy production-readiness contract to the existing visual resolver without creating a second asset registry or a circular dependency.

## Runtime rule

The visual resolver may select `lod0`, `lod1`, or `lod2` only when all of the following are true:

- A runtime model URI exists.
- The Cassidy model asset is explicitly `integrated`.
- The Cassidy rig asset is explicitly `integrated`.
- The Cassidy animation asset is explicitly `integrated`.
- Rig and animation versions are no longer `pending`.

Otherwise the resolver returns the existing `fallback` tier and does not expose a production model URI.

## Dependency direction

`cassidyProductionIntegrationGate.ts` may use the low-level runtime readiness predicate exposed by `cassidyVisualResolver.ts`.

The visual resolver must **not** import the integration gate. This prevents a circular dependency because the integration gate also composes the canonical-reference and production-package contracts.

## Why this is intentionally strict

The repository currently contains the canonical concept image but does not yet contain an explicitly integrated production GLB/glTF, rig, and animation package. The runtime therefore remains in the fallback state until the real authored production package passes the complete pipeline.

No generated avatar, generic replacement, partial model, or placeholder 3D character is promoted to production by this phase.

## Phase 3K result

- Fixed the Phase 3J readiness-call signature mismatch.
- Made the resolver enforce explicit production-manifest integration before selecting a production tier.
- Preserved the existing fallback behavior.
- Avoided a circular import between the resolver and integration gate.
- Kept the canonical identity locked.

## Verification status

The changes were committed to `main`. GitHub file operations do not execute the repository's local TypeScript/build commands, so typecheck and runtime tests still need to be run in the project environment before treating CI/runtime verification as complete.
