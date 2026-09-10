# GoPAL Living World — External Art Pipeline

## Principle

Free external art is first-class production material when it is better than hand-made placeholders. The pipeline is:

`source → license gate → visual review → geometry/material review → mobile optimization → runtime export → semantic animation binding → human approval`

The world runtime remains the only source of behavior. External art never becomes a second simulation system.

## Current curated sources

### Environment

- **Poly Haven Meadow** — daylight/HDRI reference for Emerald Valley.
- **Poly Haven Grass Medium 01** — realistic meadow ground cover.
- **Poly Haven Tree Small 02** — broadleaf tree candidate.
- **Poly Haven Pine Tree 01** — forest-edge variation.
- **Poly Haven Tree Stump 01** — natural forest-floor storytelling prop.

Poly Haven assets are CC0. Mobile builds must use optimized exports rather than shipping their highest-resolution source files.

### Temporary character / animation candidates

- **Quaternius Universal Base Characters** — temporary humanoid candidate for Cassidy only.
- **Quaternius Universal Animation Library 2** — retarget source for humanoid movement and contextual actions.

These remain candidates until downloaded, inspected, retargeted, and visually approved. Cassidy's identity is not being replaced by the candidate.

## Acquisition

Run:

```bash
npm run acquire:world-assets
```

The acquisition script retrieves selected Poly Haven files through the official API, verifies the provider checksum, and writes them under `artifacts/external-world/` locally.

The script intentionally does **not** silently acquire the Quaternius character pack. Its official download flow is separate and must be inspected before a runtime export is accepted.

## Runtime boundary

`src/engines/world/worldExternalAssetRegistry.ts` is metadata only. It does not load provider pages at runtime.

Approved runtime exports should eventually be placed behind the existing world/art asset boundary and referenced by stable IDs. Large source packages should stay outside the TypeScript bundle and should not be committed to Git merely because they are free.

## Cassidy replacement rule

Cassidy remains replaceable behind the existing `resolveCassidyVisual()` contract. A temporary external human base may be used for exploration and animation testing, but it must never rewrite Cassidy's authored identity, personality, domain model, or runtime animation vocabulary.

When the authored Cassidy model is approved later, only the asset binding/export needs to change; world behavior and callers remain intact.
