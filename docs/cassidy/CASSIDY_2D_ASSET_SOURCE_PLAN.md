# Cassidy — 2D Asset Source Plan

## Decision

Cassidy is a **2D-first production character**. The repository's canonical reference artwork is the identity source; it is not automatically the final animation source.

## Production source

The preferred source is a professionally refined, high-resolution layered 2D master created specifically from the canonical Cassidy references. Existing reference images are the visual target, not a shortcut to an unriggable flattened sprite.

Acceptable source classes:

1. Custom authored Cassidy artwork — preferred.
2. Licensed/owned human 2D artwork adapted by an artist — acceptable only when Cassidy's identity can be preserved.
3. AI-assisted concept/artwork followed by substantial human refinement — useful as an art-production aid, but never accepted automatically as final art.

## Required production package

```text
cassidy-2d-production/
├── master/
│   └── cassidy_master_source.psd|kra|ora
├── layers/
│   ├── face/
│   ├── eyes/
│   ├── hair/
│   ├── braid/
│   ├── outfit/
│   ├── body/
│   └── charm/
├── rig/
├── expressions/
├── animation/
├── charm/
├── renders/
└── manifest.json
```

The authoring format can vary. Runtime exports must be deterministic and versioned.

## Acquisition order

1. Lock Cassidy identity.
2. Select artwork source capable of supporting that identity.
3. Confirm ownership/licensing rights.
4. Produce/refine the high-resolution master.
5. Separate semantic layers.
6. Reconstruct hidden regions behind overlaps.
7. Rig deformation and facial controls.
8. Animate.
9. Human-review rendered poses and expressions.
10. Export and register the runtime pack.

## Do not use as final art

- legacy procedural/SVG Cassidy
- arbitrary generated human characters
- the separate Blender branch's 3D base mesh
- a single flattened portrait
- image-to-video output without an underlying controllable character rig
- mixed artwork from incompatible Cassidy designs

## M0 — Layered Master Acquisition

The first production milestone is a clean, approved layered master. Animation starts only after this gate passes.

Acceptance requirements:

- canonical identity preserved
- high-resolution source
- clean face and eyes
- complete hair and signature braid
- complete Emerald Valley outfit
- clean hands, feet and joints
- hidden overlap paint behind movable parts
- charm separated from clothing/body
- expression system planned into the artwork
- provenance recorded
- human visual approval recorded

## Recommended animation technology

The production system should use a proven 2D deformation/skeletal animation workflow rather than hand-building animation logic in React Native. Spine, Live2D Cubism, and Rive all provide established approaches for layered 2D character animation; the final choice must be validated against GoPAL-AI's Expo/React Native runtime and the desired raster-illustration quality before committing the runtime format.

The renderer in GoPAL-AI remains the integration boundary, so the authoring tool can change without forcing world-state code to change.
