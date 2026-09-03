# Cassidy Phase 3N.10 — Production CI Gate

## Purpose

The Cassidy Blender factory is now fail-closed at the production boundary.
CI must never convert scaffolding, placeholders, or incomplete authored assets
into a production-ready claim.

## Gate sequence

1. Blender starts headlessly.
2. Factory initializes a clean scene.
3. Cassidy authoring environment is checked.
4. Full body rig is checked.
5. Facial/eye-gaze controls are checked.
6. LOD0/LOD1/LOD2 coverage is checked.
7. Required animation coverage is checked.
8. Export is allowed only after the production gate passes.
9. The exported GLB receives a deterministic package manifest and SHA-256.
10. TypeScript runtime intake validates package metadata before integration.
11. Runtime GLB loading performs the final structural model validation.

## Important boundary

A canonical concept image is not a 3D character. A semantic anchor scene is
not a finished model. A rig metadata record is not a working rig. CI therefore
fails when the actual authored asset is absent or incomplete.

## Runtime safety

The mobile runtime does not use Blender filesystem APIs or Node-only checksum
APIs. Runtime intake consumes portable package metadata and the bundled/remote
model URI. Binary structure is validated by the existing Cassidy runtime model
contract.

## Current state

The canonical Cassidy identity is approved, and the production factory and
runtime contracts are implemented. The real authored GLB has not yet been
integrated, so the production gate is intentionally blocked until the genuine
asset passes all checks.
