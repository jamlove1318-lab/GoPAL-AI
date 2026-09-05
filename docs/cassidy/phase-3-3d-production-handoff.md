# Cassidy — Phase 3 3D Production Handoff

## Status

**Phase 3 foundation: READY FOR EXTERNAL 3D PRODUCTION**

Phase 1 established the canonical visual identity. Phase 2 established the machine-readable production contract. Phase 3 now establishes the repository-side asset manifest and the exact handoff required to produce the real Cassidy 3D asset.

The approved concept is the identity source. The production specification is the construction contract. The asset registry is the repository/runtime handoff.

## Canonical pipeline

`Approved Concept -> Turnaround -> 3D Model -> Materials -> Rig -> Facial Controls -> Animation -> LOD -> Runtime Integration`

## 1. Model construction

Build one canonical full-body Cassidy.

Required authored geometry:

- head and face
- eyes with real gaze direction
- brows/eyelids or equivalent facial controls
- layered dark chocolate-brown hair
- neck and shoulders
- layered adventure/learning clothing
- articulated arms
- clean readable hands
- articulated legs
- complete feet
- practical footwear
- luminous leaf-star-compass accessory

The model must remain recognizable from front, three-quarter front, side, three-quarter back and back views.

## 2. Face priority

The face is the highest-priority geometry/material region.

Preserve:

- canonical eye spacing
- distinctive brow shape
- recognizable smile shape
- consistent cheek/face planes
- dark near-black expressive eyes
- warm eye undertone
- natural corneal response
- authored eyelid behavior

Do not let topology optimization destroy facial readability.

## 3. Hair priority

Hair is a permanent Cassidy identity anchor.

Use authored hair groups rather than uncontrolled strand noise. Preserve the dark chocolate-brown base and subtle warm highlights. Hair groups must support controlled secondary motion while remaining readable at the world camera distance.

## 4. Outfit

The base outfit is Cassidy's Emerald Valley/home-world identity.

It should communicate:

- learner
- explorer
- companion
- practical traveler
- handcrafted quality

World variants are material/outfit variants of the same model identity. They are not new characters.

## 5. Accessory

The signature charm is a small luminous leaf/star/compass-inspired object.

It may respond to meaningful Cassidy/world state, but its state comes from the existing Cassidy/world engines. The renderer must never invent its own progression logic.

## 6. Rig

The production rig must support:

### Body
- idle
- walk
- run
- turn
- sit
- gesture
- point
- celebrate

### Face
- neutral
- happy
- curious
- surprised
- thoughtful
- excited
- concerned
- playful

### Eyes
- learner focus
- object focus
- landmark focus
- conversational gaze
- natural micro-movement
- independent blink timing

### Hands
- relaxed
- greeting
- explaining
- pointing
- discovery
- celebration

### Secondary motion
- hair
- clothing accents
- signature accessory

## 7. Animation principles

Cassidy should feel alive without looking constantly animated.

Use layered motion:

`Locomotion + breathing + gaze + blink + facial micro-expression + hair motion + accessory response`

Important emotional events may temporarily override idle behavior.

## 8. Mobile LOD strategy

Prepare at minimum:

### LOD0
Hero/conversation quality. Highest facial, hair and material fidelity.

### LOD1
Normal world exploration. Preserve face, eyes, hair silhouette and hands.

### LOD2
Distant world presence. Preserve Cassidy silhouette and major identity anchors while reducing expensive geometry/material detail.

Do not optimize by replacing Cassidy with an unrelated sprite or generic avatar.

## 9. Asset registry

Repository manifest:

`src/characters/cassidyProductionAssetRegistry.ts`

The manifest tracks production status and eventually supplies runtime-facing URIs through the existing `CassidyCharacterAssetSet` contract.

It does **not** create a second Cassidy state system.

## 10. External production handoff

The external artist/tool receives these sources together:

1. `docs/cassidy/canonical-reference.md`
2. `docs/cassidy-master-character-bible.md`
3. `docs/cassidy-phase-1-concept-generation.md`
4. `docs/cassidy-phase-2-production-sheet.md` (when present)
5. `src/characters/cassidyProductionSpec.ts`
6. the approved canonical concept image

The artist/tool returns:

- canonical turnaround
- face/eye reference
- hair reference
- outfit construction
- expression reference
- pose reference
- material reference
- 3D model
- textures/materials
- rig
- animation clips
- LOD variants

## 11. Acceptance gate

Do not integrate a 3D Cassidy merely because the model renders.

Accept only if:

- face matches canonical reference
- dark-brown hair is unmistakable
- eyes remain expressive
- silhouette matches
- hands and feet are complete
- accessory matches
- clothing reads correctly
- expressions are readable
- gaze works
- locomotion is natural
- world variants remain Cassidy
- mobile performance is measured

## 12. Integration architecture

The final runtime path remains:

`Cassidy Brain -> Cassidy State -> Visual Resolver -> Cassidy Asset Registry -> Model -> Face/Gaze -> Expression -> Animation`

Cassidy engines continue to own memory, relationship, learning, decisions and behavior.

The visual asset expresses those states; it does not own them.

## Current blocker

The repository now has the production specification and asset registry, but the final binary 3D model, rig and animation files must be created by the external art/3D production workflow. The approved Phase 1 concept is recorded in the repository so the design cannot drift.
