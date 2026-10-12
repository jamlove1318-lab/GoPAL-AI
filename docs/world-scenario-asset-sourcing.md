# GoPAL World — Large Scenario Asset Sourcing

GoPAL is allowed to use a large multi-source art library, but the runtime must still have **one world simulation brain** and **one canonical asset-validation path**.

## Sources now covered

- **3DAssets.dev** — CC0, direct CDN/API, web-optimised GLB; strong candidate for large reusable scenario packs.
- **Poly Haven** — CC0; strong for environment, nature, HDRIs, materials and realistic props.
- **Kenney** — CC0 for the curated catalog; strong lightweight stylized world, city, transport, nature and 2D assets.
- **Quaternius** — exact pack license/provenance is retained; strong modular buildings, cities, characters, transport and nature.
- **KayKit** — verified packs can be CC0 and are especially useful for coherent low-poly environments, interiors, city pieces and characters.
- **BlendKit (formerly BlenderKit)** — commercial use is possible, but exact per-asset license matters; authenticated acquisition is kept separate from automatic public acquisition.
- **Fab** — useful for complete scenario packs, but every product keeps its exact license/EULA and acquisition status.
- **Sketchfab** — useful for filling specific visual gaps; every asset requires exact license/provenance and official authenticated download handling.
- **Mixamo** — treated as a character/animation source rather than a runtime engine; exported animation is mapped into GoPAL's shared semantic animation contract.

## Acquisition tiers

### Tier 0 — direct official acquisition

Automate where the provider exposes an official API/CDN or predictable official download path and the rights are clear.

### Tier 1 — official free-pack discovery

Discover packs from the official provider page, capture the exact pack/license/provenance, then acquire and validate.

### Tier 2 — authenticated sources

Never bypass login, licensing, EULA, or access controls. The pipeline accepts authorized downloads from the user and then performs the same normalization/validation flow.

## What “full scenario assets” means

We are not downloading random individual models forever. We are building **complete reusable scene families**:

1. Terrain and nature
2. Roads and public spaces
3. Houses and residential districts
4. Shops, cafes and commercial districts
5. Libraries, study spaces and interiors
6. Railway lines, stations and transport spaces
7. Travel/airport spaces when an exact licensed runtime source is available
8. Vehicles and environmental transport dressing
9. Furniture and small props
10. Characters and NPC animation
11. Weather, lighting, materials and atmospheric dressing
12. 2D/2.5D distant scenery

## No duplicate-library rule

A new provider does not automatically become another permanent asset library. When two sources solve the same family, the pipeline selects the better source based on:

- visual coherence
- geometry cost
- material cost
- animation quality
- license clarity
- mobile suitability
- reuse across multiple world locations
- ease of normalization and maintenance

The unused source can remain a **discovery candidate** without being promoted into the runtime catalog.

## Runtime path

`source → exact license → provenance → acquisition/checksum → Blender normalization → geometry/material validation → mobile optimization → runtime export → visual binding → semantic animation binding → mobile validation → human visual approval → validated-runtime`

The existing world runtime, visual selector and animation contract remain authoritative. This sourcing expansion does **not** create another renderer or simulation engine.
