# GoPAL World Asset System — Batch 14

## Runtime promotion gate

Batch 14 adds the missing fail-closed gate between a curated source asset and a production runtime asset.

A source page or candidate registry entry is never enough to make an asset live.

## Required promotion evidence

A `validated-runtime` entry must have:

1. a concrete repository runtime path
2. a supported runtime format
3. a SHA-256 checksum
4. successful geometry review
5. successful material review
6. successful mobile validation
7. human visual approval with timestamp
8. at least one visual variant with a runtime path

The automated gate is implemented by `scripts/validate-world-runtime-promotion.mjs` and runs in the World Final Validation workflow.

## Why this matters

The world can grow continuously without turning unfinished downloads into visible broken assets. Candidate assets remain available for discovery and production work, while the runtime selector can only consume validated runtime variants.

## Asset production loop

```text
source discovery
  ↓
license + provenance
  ↓
source package
  ↓
Blender normalization / Spine / Rive / Godot production
  ↓
geometry + material review
  ↓
LOD / texture / animation budget
  ↓
runtime export
  ↓
checksum + provenance
  ↓
mobile validation
  ↓
human visual approval
  ↓
validated-runtime
  ↓
canonical world visual selector
```

## Four-tool boundary

- Blender is the 3D normalization/authoring/export workshop.
- Spine is the skeletal 2D character/creature workshop.
- Rive is the lightweight interactive 2D motion workshop.
- Godot is a scene/animation prototyping and specialized production workshop.
- GoPAL remains the single authoritative world/animation-intent runtime.

These tools produce assets. They do not become competing world-state engines.

## Current state

No new external asset is falsely marked production-ready by this batch. The first real promotion must happen only after an actual runtime artifact has passed every gate.

The native Emerald Valley artwork therefore remains a safe fallback while the asset library is upgraded progressively.
