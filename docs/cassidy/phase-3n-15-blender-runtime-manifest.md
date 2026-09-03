# Cassidy Phase 3N.15 — Blender → Runtime Manifest Boundary

## Goal

The Blender factory and GoPAL-AI runtime now share a single explicit handoff boundary instead of maintaining two unrelated package schemas.

## Blender owns

`tools/blender/characters/cassidy_package.py` emits deterministic JSON containing:

- package version
- Cassidy character identity
- model filename, format, byte size, SHA-256
- model / rig / animation / texture versions
- required expressions
- required animations
- required LODs
- structural validation results
- visual review result

Blender does not decide where the runtime application stores or serves the binary.

## Runtime owns

`src/characters/cassidyBlenderPackageManifest.ts` defines the portable JSON boundary and validates it without Node-specific filesystem or crypto APIs.

`createCassidyRuntimePackageFromBlenderManifest()` then converts a validated Blender manifest plus application-supplied model and manifest URIs into the existing `CassidyRuntimeProductionPackage` contract.

This keeps the engine/runtime contract stable while allowing Blender to remain an external authoring pipeline.

## Fail-closed behavior

A manifest is rejected when:

- the character is not Cassidy
- the model checksum is malformed
- model bytes are invalid
- expression or animation coverage differs from the canonical contract
- Blender reports structural validation failure
- required rig/gaze validation fails
- LOD validation fails
- visual review is incomplete
- required production versions are absent

No runtime integration patch should be produced from a rejected manifest.

## Important distinction

A valid manifest is **not** proof that the visual asset is beautiful. It proves that the authored package crossed the defined technical and review gates. The actual GLB still has to be loaded and checked against the runtime semantic node, expression, gaze, and animation contract.

## Current asset status

The canonical Cassidy concept remains the identity authority. A finished authored Cassidy GLB has not been claimed or fabricated by this phase.
