# Cassidy Phase 3N.2 — Blender Factory Foundation

## Purpose

Phase 3N.2 turns the Blender environment into a reusable, deterministic asset-production layer for GoPAL-AI.

The factory is deliberately separate from the application's TypeScript character contracts. GoPAL-AI remains authoritative for Cassidy identity, runtime semantics, validation requirements, and integration state. Blender is responsible for asset authoring, processing, validation, and GLB export.

## Factory layout

```text
 tools/blender/
 ├── factory/
 │   ├── __init__.py
 │   ├── __main__.py
 │   ├── bootstrap.py
 │   ├── naming.py
 │   ├── validation.py
 │   └── export.py
 ├── characters/
 │   ├── __init__.py
 │   └── cassidy.py
 └── tests/
     └── test_factory.py
```

## Cassidy boundary

The Cassidy adapter mirrors the existing runtime naming contract:

- required semantic nodes
- 8 expression morph targets
- 11 required animation names

It does not create a fake Cassidy model and does not replace the TypeScript source of truth.

## Production rule

A generated or imported asset must pass structural validation before it is considered eligible for GoPAL-AI intake. A valid GLB file alone is not sufficient to make an asset a production Cassidy asset.

## Verified environment

The development environment has successfully demonstrated:

- Blender 5.0.1 on Ubuntu ARM64
- Blender Python (`bpy`)
- NumPy 2.3.5
- headless `.blend` creation
- successful GLB export

The optional Draco compression warning does not block basic GLB export and is intentionally deferred until mobile asset optimization is required.

## Next phase

Phase 3N.3 should introduce the actual Cassidy asset intake/build specification and deterministic validation report. It must not declare Cassidy production-ready until the canonical reference set, model, materials, rig, expressions, animations, and mobile LOD requirements have all passed their respective gates.
