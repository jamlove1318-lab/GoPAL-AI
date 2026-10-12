# GoPAL-AI — Complete Living World Asset Pipeline

## Goal

Every reusable world visual can move from a legally verified source to a mobile-safe runtime representation without creating a second simulation or animation brain.

## End-to-end flow

```text
Discovery
  ↓
Exact asset record
  ↓
License + provenance verification
  ↓
Acquisition / source isolation
  ↓
Blender normalization
  ↓
Geometry + material cleanup
  ↓
LOD / texture optimization
  ↓
Runtime export
  ↓
2D / 2.5D / 3D representation binding
  ↓
Semantic animation binding
  ↓
Mobile validation
  ↓
Human visual approval
  ↓
validated-runtime
  ↓
Living World runtime host
```

## Runtime boundary

The world simulation remains authoritative. It chooses world state, location, interaction, distance, performance tier and animation intent. The visual pipeline only selects and presents an approved asset.

- Blender — authoring, normalization, rigging, LODs and export.
- Spine — authored 2D character animation when that representation is appropriate.
- Rive — lightweight interactive 2D/micro-animation where supported.
- Godot — optional world/animation prototyping and production tooling; it does not become a second GoPAL world-state owner.
- React Native / R3F — existing application presentation host.

## Representation policy

- **3D:** hero, close, interactive and important landmarks.
- **2.5D:** mid-distance scenic assets and depth-rich world pieces.
- **2D:** distant decoration, map/background art and low-performance fallbacks.
- **Native:** always available as the fail-safe presentation path.

## Promotion gate

An asset is never production-ready because metadata says it is good. `validated-runtime` requires a runtime artifact, exact provenance, an explicitly verified supported license, checksum, geometry review, material review, mobile validation and human visual approval.

## Reuse model

Assets are catalogued by family rather than tied to a single screen:

- terrain and ground cover
- trees, plants, flowers and gardens
- houses and residential buildings
- cafes, shops and markets
- libraries, schools and cultural buildings
- furniture and interiors
- roads, signs and street furniture
- cars and public transport
- trains and railway stations
- characters and creatures
- animation packs
- props and safe effects
- maps and background scenery
- airports and aircraft only after exact source/license/technical verification

## Current state

The architecture and validation pipeline are implemented. Candidate assets remain fail-closed until actual runtime artifacts and review evidence exist. This prevents placeholder or unreviewed external art from silently becoming production content.

The first real production asset batch should therefore be treated as an art-production task, not as another architecture rewrite.
