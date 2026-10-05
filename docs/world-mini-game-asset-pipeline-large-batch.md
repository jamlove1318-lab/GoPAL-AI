# World + Mini-Game Asset Pipeline — Large-Batch Plan

This document is the operating contract for the visual production pipeline. It is intentionally world-first: assets are ingredients for a living world, not a pile of UI cards or isolated game screens.

## One pipeline, many outputs

```text
Official source
  → license/provenance record
  → acquisition
  → normalization
  → optimization
  → quality review
  → 2D / 2.5D / 3D representation
  → semantic animation binding
  → mobile validation
  → human visual approval
  → runtime promotion
```

The same pipeline serves the world and the reusable mini-game catalog. We do not create a separate asset system for each game.

## Large-batch order

### Batch A — source foundation
- Curate high-reuse CC0 or clearly commercial-safe sources.
- Keep official source pages and exact provenance in manifests.
- Keep all assets source-only until runtime validation passes.
- Reject duplicate libraries when an existing pack already covers the same role.

### Batch B — world building blocks
- Nature: forests, trees, grass, caves, water-adjacent props, sky and atmosphere.
- Architecture: modular buildings, roads, brick/construction pieces, interiors and location dressing.
- Transport: cars and other non-sensitive transport props, with one canonical library per category.
- Culture/language: flags, language signage ingredients and reusable environmental decoration.

### Batch C — mini-game shared library
- Platforming primitives.
- Letter and word tiles.
- Puzzle pieces and effects.
- Input prompts and micro-UI only where a game actually needs them.
- Reusable 3D environments and actors.
- Shared props that can appear in multiple game genres.

### Batch D — representation layer
- 2D for sprites, flat effects, distant scenery and language elements.
- 2.5D for layered scenes where depth improves the world without the cost of full 3D.
- 3D for hero locations, interactive objects, close environments and spatial discovery.
- The canonical world visual selector chooses among validated variants; renderers do not make independent asset decisions.

### Batch E — animation layer
- Keep one semantic animation vocabulary.
- Map semantic intent to asset-specific clips.
- Blender is for authored/normalized 3D production.
- Spine is for skeletal 2D production.
- Rive is for lightweight interactive micro-motion.
- Godot is a production/lab environment for richer scene and motion authoring where useful.
- None of these becomes a second world simulation brain.

### Batch F — mobile quality gates
Every candidate must eventually pass:
- geometry sanity
- material/texture sanity
- animation binding
- runtime format validation
- mobile size/performance checks
- human visual approval

Only then can it become `validated-runtime`.

## Reuse rule

A new pack is justified only when it fills a real visual gap or materially improves quality. Prefer a smaller set of excellent, reusable libraries over dozens of overlapping packs.

## Cassidy rule

Generic character packs may support NPCs or mini-games, but they never silently replace Cassidy. Cassidy remains an authored identity with its own production and approval gates.

## Current target state

The goal is a living visual ecosystem:

```text
                GoPAL World Runtime
                        │
              Animation / Visual Intent
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
      2D / Spine      2.5D / Rive     3D / Blender
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                 Godot / lab scenes
                        │
                        ▼
                 Mobile runtime host
```

The important boundary is the intent layer: the world decides *what should happen*; each visual representation decides *how that intent is rendered*.

## What we are not doing

- No duplicate animation engines.
- No separate asset selector per mini-game.
- No blind bulk downloading.
- No committing large binaries merely because they are free.
- No treating a dashboard/card UI as the world itself.
- No calling an asset production-ready before technical and human approval.
