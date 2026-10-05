# GoPAL-AI Mini-Game Asset Pipeline

## Purpose

GoPAL-AI already contains a reusable living-world mini-game engine and a 60-game catalog. Mini-games are not a separate product or a second runtime. They are experiences inside the same world runtime and should reuse the same visual, animation, audio, persistence, language, and world-event infrastructure.

The asset pipeline therefore treats world assets and mini-game assets as **one acquisition batch** with different usage scopes.

## Existing mini-game foundation

The current world engine defines 60 reusable mini-games across seven families:

- discovery
- puzzle
- arcade
- social
- listening
- adventure
- creative

The engine already provides deterministic selection/recommendation and reusable session state (`ready`, `playing`, `won`, `lost`) rather than requiring one bespoke engine per game.

## Asset families

The mini-game intake manifest covers reusable sources for:

- characters and ambient actors
- tiles and terrain
- backgrounds and parallax scenery
- puzzle pieces and tokens
- letter/word tiles
- props
- shared interaction prompts
- small visual UI primitives
- particles and lightweight effects
- audio sources where the source package explicitly provides them

No weapon content is part of the mini-game asset plan.

## Sources

The first curated batch prioritizes CC0 sources from Kenney and individually verified CC0 OpenGameArt submissions. Source pages remain the provenance boundary. We do not treat a third-party mirror as a blanket license grant.

Current curated families include Kenney New Platformer Pack, Platformer Art Deluxe, UI Pack, UI Pack - Adventure, Letter Tiles, Puzzle Pack 2, Particle Pack, Smoke Particles, Input Prompts, Animal Pack, plus individually verified OpenGameArt CC0 sources.

## One-batch acquisition model

The existing `npm run acquire:world-assets` pipeline now reads both:

- `assets/world/external-asset-manifest.json`
- `assets/world/mini-game-asset-manifest.json`

The same run acquires the currently API-backed Poly Haven world sources and inventories every approved mini-game source in the same acquisition report. Mini-game packages are deliberately not scraped from mutable download endpoints; a source is promoted to automatic acquisition only after an exact downloadable URL and checksum can be recorded.

This means we can run one acquisition/validation cycle instead of maintaining a second mini-game downloader.

## Reuse rules

1. Prefer one asset that can serve several mini-games.
2. Prefer existing world assets when they satisfy a mini-game need.
3. Do not create a new renderer or animation scheduler for a mini-game.
4. Keep source packages outside runtime until normalized and optimized.
5. Validate licenses and provenance before acquisition.
6. Validate geometry/materials and mobile cost before runtime promotion.
7. Human visual approval remains required for production promotion.
8. Keep 2D, 2.5D and 3D representation decisions scene-specific.

## Mini-game visual strategy

- **2D:** fast arcade rounds, word/letter games, puzzle pieces, prompts, particles, lightweight UI.
- **2.5D:** map puzzles, layered mystery scenes, parallax story spaces and distant decorative depth.
- **3D:** mini-games that happen directly in the living world and require spatial interaction, occlusion or reusable world geometry.

A mini-game does not automatically get a full 3D scene. The representation is selected by the existing world visual policy.

## Promotion boundary

Mini-game assets begin as `approved-source`, not `validated-runtime`.

The promotion chain remains:

`source -> license -> provenance -> acquisition -> normalization -> optimization -> runtime export -> visual binding -> animation binding -> mobile validation -> human visual approval -> runtime promotion`

The unified report explicitly keeps mini-game runtime promotion at zero until evidence exists.

## Current state

The architecture is now prepared for the next bulk acquisition pass. The remaining acquisition work is source-package URL/checksum capture for the curated mini-game packs. That work must preserve exact provenance rather than silently downloading mutable or ambiguous endpoints.
