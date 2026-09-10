# GoPAL Living World — External Art Pipeline

## Principle

Free external art is first-class production material when it is better than hand-made placeholders. The pipeline is:

`source → license gate → visual review → geometry/material review → mobile optimization → runtime export → semantic animation binding → human approval`

The world runtime remains the only source of behavior. External art never becomes a second simulation system.

## Quality rule

We do **not** equate "free" with "good enough". A source is only promoted when it improves the world and passes:

1. license/provenance validation
2. visual quality review
3. geometry/material inspection
4. mobile triangle/material/texture budgets
5. Blender import/export validation
6. runtime loading validation
7. human visual approval

High-resolution source files are staging material. Mobile receives optimized LODs, compressed textures, simplified materials, and only the geometry that earns its place in the world.

## Current curated sources

### Environment

- Poly Haven Meadow — daylight/HDRI reference for Emerald Valley.
- Poly Haven Grass Medium 01 — meadow ground cover.
- Poly Haven Tree Small 02 — broadleaf tree candidate.
- Poly Haven Pine Tree 01 — forest-edge variation.
- Poly Haven Tree Stump 01 — natural forest-floor storytelling prop.
- Kenney Nature Kit — additional CC0 nature/foliage source.

Poly Haven's current API is free for use and its assets are CC0; when using the live API, follow its current attribution/User-Agent requirements. citeturn0search6turn0search3

### Buildings / places

The acquisition catalog now covers residential, commercial, industrial, modular buildings, roads and city pieces through curated Quaternius and Kenney sources. Quaternius currently lists a 300+ piece Downtown City MegaKit, modular building packs and other environment packs as CC0. Kenney's City Kits, Building Kit and Modular Buildings are also CC0. citeturn1search19turn2search13turn3search0turn3search17

These are **source candidates**, not automatic runtime imports. Airport/station districts will be assembled from the best validated building/transport pieces first; specialized aircraft/airport art remains a separate acquisition target rather than inserting a weak placeholder just to fill a category.

### Transport

The catalog includes:

- cars
- public transport
- trains and rail pieces
- road systems
- future station/terminal pieces

Quaternius currently provides a Cars Pack, Modular Train Pack and Public Transport Pack, while Kenney provides a 100-piece Train Kit with tracks. citeturn2search0turn2search1turn2search2turn3search12

### Furniture / interiors

Poly Haven furniture candidates now include sofas, shelving, tables and bedroom furniture. These are useful for the Study Room, homes, shops, stations and future interior locations. Poly Haven examples such as Sofa 02 and Shelf 01 are CC0 and expose mobile-relevant geometry information that can be evaluated before export. citeturn1search10turn1search8

### Characters / animation

- Quaternius Universal Base Characters — temporary humanoid candidate for Cassidy only.
- Quaternius Universal Animation Library 2 — retarget source for humanoid movement and contextual actions.
- Additional NPC packs may be evaluated later, but Cassidy's authored identity remains the canonical character.

The Universal Base Characters pack currently provides six game-ready humanoid bases averaging about 13k triangles, with a humanoid rig and glTF/FBX exports. Universal Animation Library 2 provides 130+ humanoid animations. citeturn0search0turn0search13

These remain candidates until downloaded, inspected, retargeted, and visually approved.

## Acquisition

Run:

```bash
npm run acquire:world-assets
```

The acquisition script now understands Poly Haven's dependency-aware glTF file trees instead of assuming every model is a self-contained `.glb`. It verifies file sizes/checksums and records every acquired dependency in `artifacts/external-world/acquisition-report.json`.

The script intentionally does **not** pretend that Quaternius/Kenney web pages are direct binary APIs. Their catalog entries are provenance-tracked candidates; actual package downloads are kept separate until a deterministic download source is verified.

## Runtime boundary

`src/engines/world/worldExternalAssetRegistry.ts` is metadata only. It does not load provider pages at runtime.

Approved runtime exports should eventually be placed behind the existing world/art asset boundary and referenced by stable IDs. Large source packages should stay outside the TypeScript bundle and should not be committed to Git merely because they are free.

## One runtime brain

Blender is the authoring/optimization pipeline. Spine and Rive are specialized asset formats where they genuinely improve a 2D/micro-animation layer. Godot is an optional art/prototyping laboratory. None of them becomes a second world simulation brain.

## Cassidy replacement rule

Cassidy remains replaceable behind the existing `resolveCassidyVisual()` contract. A temporary external human base may be used for exploration and animation testing, but it must never rewrite Cassidy's authored identity, personality, domain model, or runtime animation vocabulary.

When the authored Cassidy model is approved later, only the asset binding/export needs to change; world behavior and callers remain intact.
