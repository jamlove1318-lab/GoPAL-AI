# Cassidy Phase 3N — Blender Production Factory

## Status

**Phase 3N.1 — Foundation implemented.**

The repository now defines a reusable Blender-side production factory. It is an
asset-authoring and validation layer, not a replacement for GoPAL-AI's
TypeScript production contracts.

## Verified local environment

On the ARM64 Ubuntu environment used for development:

- Ubuntu 26.04 LTS
- Blender 5.0.1
- Blender Python (`bpy`) works in background mode
- NumPy 2.3.5 is available to Blender
- `.blend` creation succeeds
- glTF 2.0 GLB export succeeds

The local GLB smoke test exported a real `.glb`. The optional Draco compression
library was unavailable, but this did not prevent GLB export and is intentionally
not a Phase 3N blocker.

## Architecture

```text
GoPAL-AI TypeScript contracts
        |
        v
Blender production factory
        |
        +-- generic scene/bootstrap
        +-- deterministic naming
        +-- generic validation
        +-- GLB export
        |
        v
Cassidy production adapter
        |
        +-- semantic nodes
        +-- 8 expression names
        +-- 11 animation names
        |
        v
validated GLB
```

The TypeScript production specification remains authoritative for identity,
coverage, runtime compatibility, and integration gates.

## Reusable modules

- `tools/blender/factory/bootstrap.py` — deterministic scene initialization
- `tools/blender/factory/naming.py` — production-safe naming helpers
- `tools/blender/factory/validation.py` — generic scene/mesh validation
- `tools/blender/factory/export.py` — deterministic GLB export
- `tools/blender/characters/cassidy.py` — Cassidy-specific structural adapter

## Cassidy contract boundary

The Blender adapter mirrors the established semantic node names:

`Cassidy_Root`, `Cassidy_Body`, `Cassidy_Head`, `Cassidy_Face`,
`Cassidy_Eye_L`, `Cassidy_Eye_R`, `Cassidy_Eyelid_L`, `Cassidy_Eyelid_R`,
`Cassidy_Hand_L`, `Cassidy_Hand_R`, `Cassidy_Charm`, `Cassidy_Hair_Root`.

It also validates the canonical 8 expression morph names and 11 animation names.

## Next stage

Phase 3N.2 is **actual Cassidy asset construction and intake**. The factory will
be extended only as needed for real authored assets: import, normalization,
material checks, rig/facial/gaze checks, animation checks, mobile LODs, package
assembly, and final export.

No procedural placeholder humanoid is treated as the finished Cassidy character.
