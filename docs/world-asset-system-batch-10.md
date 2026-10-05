# World Asset System — Batch 10

## Purpose

Continue the world-first asset architecture without creating a second renderer, simulation, or animation brain.

## What this batch locks in

- A world entity remains the stable identity.
- The same identity may have 2D, 2.5D and 3D visual representations.
- Visual selection is fail-closed: only validated variants may become runtime visuals.
- Interactive scenes require an interactive-capable visual; non-interactive scenes may reuse an interactive-capable visual as a fallback.
- Low-performance scenes avoid ordinary 3D variants unless they are explicitly marked as hero visuals.
- External providers remain replaceable and provenance-tracked.
- Poly Haven, Quaternius and Kenney remain curated sources already represented in the world registry.
- Sketchfab and OpenGameArt are discovery providers only until an exact asset, license and provenance record is verified. They are never blanket-approved by provider name.

## Representation selection

`src/engines/world/worldVisualRepresentation.ts` remains the single representation selector. It does not download assets, own world state, or schedule animation. Existing world motion systems remain authoritative.

Selection considers:

1. validation state
2. interaction requirement
3. distance
4. screen-pixel budget
5. performance tier
6. visual purpose
7. representation quality
8. animation availability
9. source quality

## Source-to-runtime rule

External source files are not automatically runtime assets. A source must pass provenance/license, geometry/material, optimization, export, runtime-path, and visual approval gates before promotion.

## Free-source policy

Free does not mean automatically reusable. Every discovery-provider asset must be checked at the individual asset level when its license is not globally uniform.

## Safety boundary

The curated world catalog remains limited to ordinary environment, character, building, vehicle, furniture, nature, map, animation and VFX content. Weapon-related content is intentionally excluded.

## Next batch

Promote selected source packages through the existing Blender normalization/validation bridge, then bind validated runtime variants to the existing Living World layers. Do not introduce a second visual runtime or a parallel animation loop.
