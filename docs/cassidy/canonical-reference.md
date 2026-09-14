# Cassidy — Canonical Visual Reference

## Status

**Phase 1 visual identity: APPROVED / LOCKED**

This document records the approved Cassidy concept generated during the Phase 1 design session. It is the canonical visual reference for future Cassidy production work.

## Approved concept

The approved image is the high-resolution Cassidy character-bible concept sheet generated in the design session on 2026-09-02.

Conversation asset identifier:

`file_00000000642c821198cbd141ddc7e8d7`

Generation identifier:

`e5c1a053-d70e-4537-b5b2-aea7a70e0792`

Local source filename at generation time:

`a_high_resolution_infographic_concept_art_charac.png`

## Canonical identity represented by the concept

- Cassidy is the central living companion of GoPAL-AI.
- Dark chocolate-brown layered hair.
- Deep expressive near-black eyes with a warm undertone.
- Distinctive warm, intelligent face.
- Natural balanced full-body proportions.
- Premium stylized game-character presentation.
- Practical adventure/learning outfit.
- Emerald and gold signature language.
- Luminous leaf-star-compass companion charm.
- Full-body three-quarter presentation.
- Same Cassidy identity across Emerald Valley, Japanese World and French World.
- World variants may change clothing/material accents but must not redesign Cassidy's face, hair identity, proportions or core silhouette.

## Visual contents of the approved sheet

The approved concept includes:

- Cassidy hero portrait
- eye close-up
- hair reference
- full-body turnaround
- Emerald Valley outfit
- Japanese World outfit
- French World outfit
- expression reference
- interaction/pose reference
- signature accessory states
- color/material direction
- animation direction
- camera/presentation direction
- 3D production direction
- high-level Cassidy creation pipeline

## Source-of-truth hierarchy

When visual references conflict, use this order:

1. Approved canonical concept recorded here
2. `docs/cassidy-master-character-bible.md`
3. `docs/cassidy-phase-1-concept-generation.md`
4. `src/characters/cassidyProductionSpec.ts`
5. Later world-specific references, which may only modify explicitly permitted variant details

## Asset storage target

When the binary concept asset is transferred into repository storage, use this canonical path:

`docs/cassidy/assets/cassidy-canonical-concept-v1.png`

Do not rename it to a world-specific or temporary character name.

## Important repository note

The current GitHub connector can create repository text/blob objects but cannot transfer the generated conversation image binary directly from the conversation attachment into GitHub storage. Therefore this record is committed now so the canonical identity and exact source asset identifiers are permanently discoverable in the repository. The binary file should be uploaded to the target path when repository binary upload is available.

Until then, **do not substitute a newly generated character image and call it canonical**. The approved concept above remains the visual source of truth.

## Phase 3 rule

3D modeling must begin from this exact approved identity. Any 3D artist or external 3D tool must receive the canonical concept plus the Master Character Art Bible and Phase 2 production specification.

Canonical pipeline:

`Approved Concept -> Production Sheet -> 3D Model -> Materials -> Rig -> Animation -> Mobile LOD -> GoPAL-AI Integration`
