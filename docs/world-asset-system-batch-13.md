# GoPAL World Asset System — Batch 13

## Purpose

Batch 13 turns the reusable-art vision into a landmark-level asset assignment layer without introducing another renderer or another world simulation brain.

The world identity remains stable while presentation can evolve from native illustration to 2D, 2.5D, or 3D as assets are actually validated.

## Reusable landmark families

| World family | Current landmark targets | Preferred asset direction |
|---|---|---|
| Home / sanctuary | Sanctuary | houses, gardens, trees, furniture |
| Social / food | Komorebi Café | commercial buildings, furniture, props |
| Knowledge | Whispering Library | public/commercial buildings, shelves, lamps, props |
| Commerce | Lantern Market | modular buildings, stalls, lanterns, street props |
| Nature | Whisper Garden | vegetation, paths, rocks, water, garden props |

These assignments are candidates, not runtime approvals.

## Representation strategy

Every world concept may eventually expose:

- **3D** for close, interactive, hero-scale moments.
- **2.5D** for efficient depth-rich mid-distance scenes.
- **2D** for distant silhouettes, backgrounds, maps, and low-tier devices.
- Existing native world art remains the fail-safe until a replacement passes validation.

The selector remains `selectWorldVisual`. Landmark code only supplies identity and context; it does not choose a renderer.

## Asset family roadmap

The same registry/binding architecture is intended to cover reusable families across the living world:

- terrain and ground cover
- trees, plants, flowers and garden pieces
- houses and residential buildings
- cafés, shops and markets
- libraries, schools and cultural buildings
- interiors and furniture
- roads, signs and street furniture
- cars and public transport
- trains and rail environments
- stations and travel hubs
- characters and creatures
- animation libraries and retargetable motion
- small props and interaction objects
- particles, weather and other safe environmental effects
- map/background representations
- airport and aircraft concepts once individually verified sources pass the provenance and runtime gates

## Promotion rule

A catalog candidate is **not** a runtime asset merely because it has a source page or a license that appears suitable.

Promotion requires:

1. exact source/provenance record
2. license verification
3. dependency review
4. geometry/material review
5. Blender normalization where applicable
6. LOD and texture budget review
7. runtime export
8. visual representation binding
9. mobile validation
10. human visual approval

Only then can `validated-runtime` and a runtime URI make the selector eligible.

## Current batch result

`worldLandmarkVisualBindings.ts` now gives each Emerald Valley landmark an ordered set of replaceable external candidates. The binding resolves the first candidate that is both context-compatible and validated at runtime.

If none qualifies, it returns `undefined`. The existing Living World visual remains in control. This prevents an unfinished asset experiment from changing the visible world.

## Four-tool boundary

- **Blender:** normalize, optimize, author and export reusable 3D source.
- **Spine:** production 2D skeletal characters/creatures where appropriate.
- **Rive:** lightweight interactive micro-motion and expressive 2D elements.
- **Godot:** scene/animation prototyping and specialized production experiments when useful.
- **GoPAL runtime:** one authoritative world state and animation-intent system.

No tool becomes a second world-state engine.

## Quality rule

Do not mark an asset production-ready from metadata alone. A runtime candidate must survive automated technical checks and human visual review.
