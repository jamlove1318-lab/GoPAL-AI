# GoPAL World Asset Source Policy

GoPAL's living world is **source-agnostic**. We choose the best asset for the scene, then pass it through one validation and optimization pipeline.

## Preferred source order

### 1. Poly Haven
Best default for realistic environment materials, HDRIs, natural assets and selected props.

- CC0 assets.
- Excellent source quality.
- Keep source packages outside the mobile bundle.
- Generate mobile runtime derivatives only after validation.

### 2. Kenney
Best default for clean stylized world pieces, 2D elements, roads, modular city pieces, vehicles and lightweight decorative assets.

- Game assets are CC0.
- Particularly useful for 2D and lightweight 2.5D representations.
- Reuse the same semantic world entity across representations rather than creating separate world entities.

### 3. Quaternius
Best default for stylized 3D characters, humanoid animation sources, buildings, vehicles, nature and modular environments.

- Current QAL permits use in personal, educational and commercial products.
- Assets themselves may not be redistributed as standalone packs.
- Temporary Cassidy candidates remain replaceable and must never redefine Cassidy's identity.

### 4. Sketchfab
Useful as a **per-asset discovery source**, not a blanket-license source.

Every selected model must have an explicit recorded license, creator/source URL, dependency status and redistribution/commercial-use decision. No assumption is made from the platform name alone.

### 5. OpenGameArt
Useful for 2D sprites, tiles, effects, sounds and selected 3D assets.

Every selected submission must have its own license record and attribution requirements. Some licenses impose obligations that make them unsuitable for a closed/commercial product, so the acquisition gate remains fail-closed.

## Additional sources

The pipeline may add other reputable free/open asset libraries when they provide a materially better asset. A source is admitted only when its licensing, provenance, download terms and technical suitability can be verified.

## Universal acquisition pipeline

```text
catalog discovery
    -> exact asset record
    -> license/provenance gate
    -> dependency/license gate
    -> visual review
    -> geometry/material review
    -> Blender normalization
    -> LOD / texture optimization
    -> runtime export
    -> representation binding (2D / 2.5D / 3D)
    -> semantic animation binding
    -> mobile validation
    -> human visual approval
    -> validated-runtime
```

## Representation strategy

A single world identity may have multiple reusable visual forms:

- **3D** — close, spatial, interactive and hero moments.
- **2.5D** — parallax, medium-distance structures, distant landmarks and atmosphere.
- **2D** — maps, icons, portraits, sprites, far background and very cheap decoration.

The runtime chooses the representation. Assets never own world simulation, navigation, memory or behavior.

## Quality rule

A beautiful source asset is not automatically a runtime asset. Source quality, geometry, materials, scale, LODs, texture memory, animation compatibility, licensing and mobile performance all have to pass before promotion.

## Current safety rule

The curated acquisition catalog intentionally excludes weapon-related content. The world asset system focuses on characters, buildings, vehicles, transportation, furniture, nature, environments, props, maps and visual effects appropriate for GoPAL's learning world.
