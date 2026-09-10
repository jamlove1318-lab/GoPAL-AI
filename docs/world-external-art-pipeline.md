# GoPAL Living World — External Art Pipeline

## Principle

Free external art is first-class production material when it is better than hand-made placeholders. The pipeline is:

`source → license gate → visual review → geometry/material review → mobile optimization → runtime export → semantic animation binding → human approval`

The world runtime remains the only source of behavior. External art never becomes a second simulation system.

## Quality-first reusable asset library

We do **not** equate "free" with "good enough". A source is promoted only when it improves the world and passes:

1. license/provenance validation
2. visual quality review
3. geometry/material inspection
4. mobile triangle/material/texture budgets
5. Blender import/export validation
6. runtime loading validation
7. human visual approval

The source library is reusable. Runtime exports are optimized derivatives, so one source can dress many locations without duplicating the asset or changing world behavior.

### Environment and nature

- HDRIs / skies / lighting references
- terrain and ground-cover materials
- grass, flowers, crops and foliage
- broadleaf and conifer trees
- rocks, logs, stumps and natural debris
- roads, paths, bridges, signs and street furniture
- weather/environment dressing

Poly Haven is the preferred realistic source when a suitable asset exists. Its assets are CC0 and its current API is free for commercial use; live API use follows the provider's current attribution/User-Agent requirements. citeturn0search8turn0search19

### Buildings and places

- houses and suburban buildings
- apartments and urban facades
- commercial buildings
- industrial/factory/warehouse structures
- modular building parts
- roofs, windows, doors and stairs
- utility structures and architectural details
- train/transport-station pieces
- interiors and reusable architectural modules
- furniture and household props

Quaternius currently lists a 300+ piece Downtown City MegaKit, while Kenney provides CC0 City Kits and Modular Buildings. These are strong reusable source libraries, not automatic runtime imports. citeturn0search10turn0search15turn0search16turn1search1

### Vehicles and transportation

- cars and road vehicles
- public transport
- trains, trams and rail pieces
- station infrastructure
- boats/watercraft where useful
- specialized airport/aircraft sources only after license, mobile-cost and visual-quality review

Quaternius currently provides a Cars Pack, and Kenney provides a 100-piece Train Kit with train/tram/trolley/rail pieces. citeturn0search3turn0search7

### Characters, animals and animation

- reusable humanoid bases
- NPC variants
- ambient animals/wildlife
- retargetable locomotion
- idle, talk, gesture, inspect, sit, interact and contextual animation clips
- temporary Cassidy candidates, always behind the existing Cassidy resolver

Quaternius' current Universal Base Characters provide six game-ready humanoid bases with animation-friendly topology, humanoid retargeting and glTF/FBX exports. Its Universal Animation Library 2 provides 130+ retargetable humanoid animations. citeturn0search2turn0search11

Quaternius' current license permits incorporating its assets into commercial products but prohibits redistributing the assets themselves as standalone packs. Therefore source packs remain acquisition inputs; only approved optimized assets are promoted into the shipped GoPAL runtime. citeturn0search0

### Furniture and interiors

Furniture is treated as a reusable vocabulary rather than one-off decoration: sofas, tables, shelves, beds, lamps, kitchen pieces, desks, study objects, shop fixtures and station furnishings can be reused across multiple locations after optimization.

### Additional source families

Kenney's catalog also provides CC0 nature, city, building, transport, furniture and other reusable packs. The current Nature Kit contains 330 assets, Modular Buildings contains 100, and the Car Kit contains 45. citeturn1search2turn1search1turn1search0

## Acquisition rule

"Download everything useful" means **catalog every useful category and acquire reusable source packs where the license and deterministic download path allow it**, not blindly put every source file into the mobile bundle.

For every acquired source we record:

- provider and source page
- license
- acquisition timestamp
- provider checksum where available
- source format
- dependency/package structure
- intended semantic role
- expected LOD tiers
- texture/material budget
- geometry budget
- validation state

The acquisition script must fail closed when a provider package contains unresolved dependencies or a download cannot be verified. It must never silently substitute a different file.

## Acquisition

Run:

```bash
npm run acquire:world-assets
```

The acquisition layer retrieves provider-approved files through official download/API mechanisms, verifies checksums where supplied, and writes them under `artifacts/external-world/` locally. Poly Haven's API explicitly exposes metadata, hashes, sizes and dependency-aware file information for this purpose. citeturn0search8

Quaternius and Kenney catalog entries are provenance-tracked until a deterministic direct download is available to the acquisition environment. We do not pretend a web catalog page itself is a binary package endpoint.

## Runtime boundary

`src/engines/world/worldExternalAssetRegistry.ts` is metadata only. It does not load provider pages at runtime.

Approved runtime exports are placed behind stable local asset IDs. Large source packages stay outside the TypeScript bundle and should not be committed to Git merely because they are free.

## One runtime brain

Blender is the authoring/optimization pipeline. Spine and Rive are specialized asset formats where they genuinely improve a 2D/micro-animation layer. Godot is an optional art/prototyping laboratory. None of them becomes a second world simulation brain.

## Cassidy replacement rule

Cassidy remains replaceable behind the existing `resolveCassidyVisual()` contract. A temporary external human base may be used for exploration and animation testing, but it must never rewrite Cassidy's authored identity, personality, domain model, or runtime animation vocabulary.

When the authored Cassidy model is approved later, only the asset binding/export needs to change; world behavior and callers remain intact.
