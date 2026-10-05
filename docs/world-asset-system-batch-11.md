# World Asset System — Batch 11

## External visual binding bridge

`src/engines/world/worldExternalVisualBinding.ts` now connects the curated external asset registry to the existing `worldVisualRepresentation` selector.

The bridge deliberately keeps responsibilities separated:

- **World runtime:** owns identity, simulation, location, interaction and state.
- **Visual selector:** chooses a representation from an already validated set.
- **External registry:** records provider, provenance policy, role, representations and promotion state.
- **Art adapters:** eventually render the selected runtime asset.
- **Animation contract:** remains the shared semantic vocabulary for Blender, Spine, Rive, Godot and native motion.

## Fail-closed behavior

A registry entry marked `candidate` or `approved-source` is not treated as a runtime asset. The bridge only marks a representation validated when the registry says `validated-runtime` and a runtime path exists.

Until then, existing SVG/native visuals remain valid fallbacks. This allows the world to be developed with the catalog already wired without pretending that source downloads are production runtime assets.

## Provider mapping

Current curated external providers map through the Blender-side normalization/export boundary. This does **not** mean every source must remain a Blender runtime; it means Blender is the common normalization boundary for the current external 3D/2.5D/2D catalog. Spine, Rive and Godot remain available as specialized production/runtime adapters through the shared representation and animation contracts.

## Representation strategy

One world identity can expose:

- 3D for close, spatial or highly interactive scenes
- 2.5D for parallax and medium-distance depth
- 2D for maps, backgrounds and inexpensive distant decoration

The selector chooses the best validated representation for distance, interaction and device performance. No duplicate simulation is created when the representation changes.

## Next batch

Use the existing Blender validation/export bridge to promote the first real external source package into a validated runtime artifact. Then add the smallest possible render adapter that consumes the selected representation while preserving the current Living World motion loops.
