# GoPAL-AI Mini-Game Asset Selection

## Decision

The mini-game pipeline now has a small, high-reuse acquisition set instead of downloading every available pack. The goal is to give the existing shared mini-game runtime enough visual vocabulary to build many different games without creating a giant duplicate asset library.

## P0 acquisition set

| Source | Purpose | Why selected |
|---|---|---|
| Kenney New Platformer Pack | characters, tiles, backgrounds, effects | 440-file CC0 foundation with broad 2D reuse |
| Kenney Pixel Platformer | alternate pixel worlds | 200+ sprites for a distinct visual mood at very small footprint |
| Kenney Platformer Kit | lightweight 3D | 150-file CC0 kit with animation and variation support |
| Kenney Letter Tiles | language gameplay | direct fit for spelling, phrase, sentence and story mini-games |
| Kenney Puzzle Pack 2 | puzzle primitives | large reusable set of pieces, tiles and tokens |
| Kenney Particle Pack | shared VFX | one reusable lightweight VFX vocabulary across mini-games |
| Kenney UI Pack | micro-interaction layer | shared controls only; does not turn the world into card/block UI |
| Kenney Input Prompts | input language | touch and control prompts across devices |
| Quaternius Universal Base Characters | generic 3D actors | reusable temporary NPC/mini-game actors; never replaces Cassidy |

## P1 candidates

These remain catalogued but are not part of the first bulk acquisition: industrial pixel expansion, adventure UI, Medieval Village, Downtown City, the free Standard 3D Card Kit, and the simplified fallback pack.

## Acquisition rules

1. Only official source pages are used for automatic discovery.
2. Redirects are restricted to explicitly allowlisted source hosts.
3. The downloader records SHA-256 after acquisition.
4. Paid variants are skipped.
5. If a package cannot be resolved safely, the batch fails closed rather than guessing a URL.
6. Acquired archives are source assets only. They are not runtime-approved until normalization, optimization, mobile validation and human visual approval succeed.
7. Generic character packs never replace Cassidy's authored identity.

## Current source evidence

Kenney's official pages currently list New Platformer Pack as 440 files/CC0, Platformer Kit as 150 files/CC0, Letter Tiles as 215 files/CC0, Puzzle Pack 2 as 795 files/CC0, Particle Pack as 80 files/CC0, and Input Prompts as CC0. The official Input Prompts guide also confirms PNG/SVG availability and CC0 licensing.

Quaternius' Universal Base Characters page lists six game-ready base models, humanoid retargeting support, and CC0 licensing.

The source-selection pass intentionally favors these high-reuse foundations over downloading large collections with overlapping functionality.
