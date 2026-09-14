# World Asset System — Batch 12

## Purpose

Move the Living World from a source catalog toward a reusable production asset library without creating a second world renderer or simulation system.

## Current contract

- One world identity may expose 2D, 2.5D, and 3D representations.
- `worldVisualRepresentation.ts` is the single representation selector.
- `worldExternalVisualBinding.ts` is the bridge from curated external-source metadata into that selector.
- External source entries are fail-closed until a runtime path exists and the asset is marked `validated-runtime`.
- Mobile tier is part of visual selection: low devices prefer low-tier variants, balanced devices allow low/medium, and high devices may use all validated tiers.
- Blender remains the normalization/export boundary for external 3D sources; it is not a second runtime brain.
- Existing native/Rive/Spine/Godot integration points remain production tools/runtime adapters rather than parallel world-state owners.

## Reusable asset families

| Family | Required forms | Priority | Notes |
|---|---|---:|---|
| Terrain / ground cover | 3D + 2.5D + 2D | P0 | Reusable across every district |
| Trees / vegetation | 3D + 2.5D + 2D | P0 | Distance-aware variants |
| Buildings / houses | 3D + 2.5D + 2D | P0 | Buildings define place identity |
| Interior furniture | 3D + 2D/2.5D | P1 | Reusable scene dressing |
| Cars / buses / trains | 3D + 2.5D + 2D | P1 | Vehicle motion remains semantic |
| Characters / NPCs | 3D + 2.5D + 2D | P0 | Temporary sources are replaceable |
| Humanoid animation | 3D source clips | P0 | Retarget into the existing animation contract |
| Props / signage / flags | 3D + 2D | P1 | Small reusable storytelling objects |
| VFX / atmosphere | 2D + native | P1 | Glows, masks, weather accents |
| Maps / discovery scenery | 2D + 2.5D | P1 | Lightweight exploration views |
| Stations / transport hubs | 3D + 2.5D + 2D | P1 | Rail and travel districts |
| Airports / aircraft | 3D + 2.5D + 2D | P2 | Exact free source must pass license/provenance/quality gates before cataloging |

## Source strategy

### Curated now

- Poly Haven for CC0 environments, materials, HDRIs, props, and realistic reference-quality source material.
- Quaternius for CC0 characters, humanoid animation, modular buildings, vehicles, trains, and stylized world kits.
- Kenney for CC0 stylized 2D/3D world pieces, city kits, roads, props, maps, and lightweight scenery.

### Discovery-only until verified

- Sketchfab: each asset requires its own license, provenance, dependencies, and redistribution review.
- OpenGameArt: each submission requires its own license and attribution/share-alike review.
- Any additional provider must pass the same gate before becoming a curated runtime source.

No unverified airport, aircraft, or other asset is added merely to make the catalog look complete.

## Promotion pipeline

1. Discover source.
2. Record exact asset identity and source page.
3. Verify license and redistribution terms.
4. Record dependencies and provenance.
5. Visual review.
6. Geometry/material review.
7. Normalize through Blender where required.
8. Generate mobile-friendly LOD/texture variants.
9. Export runtime representation.
10. Bind to the existing world visual selector.
11. Attach semantic animation actions where applicable.
12. Mobile validation.
13. Human visual approval.
14. Mark `validated-runtime`.

## Fail-closed rule

A source, candidate, or approved-source entry can enrich the catalog without appearing in the runtime. Runtime selection must remain `undefined` until a validated runtime path is present. This keeps unfinished external downloads and source files out of the live world.

## Next large batch

Promote the first small set of static Poly Haven environment/building/prop assets through the existing Blender validation/export bridge. Prove the complete source-to-runtime path with real geometry before expanding the catalog further. After that, promote one Quaternius character/animation source as a replaceable NPC pipeline test, not as Cassidy identity.
