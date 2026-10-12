# Cassidy Phase 3A — Canonical 3D Production Asset Contract

**Status:** READY FOR EXTERNAL 3D PRODUCTION

## Purpose

Phase 3A establishes the exact handoff boundary between external art/3D production and GoPAL-AI runtime code.

The existing Cassidy character systems remain the owners of Cassidy state and behavior. The production package supplies only visual assets and their validated metadata.

## Source-of-truth chain

`Phase 1 Approved Concept -> Master Character Bible -> Phase 2 Production Specification -> Phase 3A Production Package -> Runtime Asset Registry`

The Phase 1 identity remains locked. A production artist or generator must not redefine Cassidy's face, hair identity, body proportions, core silhouette, or signature accessory to compensate for missing references.

## Required production package

The canonical package must contain:

- one production-quality canonical Cassidy model
- LOD0 hero/conversation model
- LOD1 exploration model
- LOD2 distant model
- production materials/textures
- full-body rig
- facial controls or blendshapes
- independent eye/gaze and eyelid controls
- hand controls
- secondary-motion controls for hair and the signature charm
- canonical animation package

The required visual reference set remains the existing Phase 2 contract: front, three-quarter-front, side, three-quarter-back, back; eight canonical expressions; and the eleven canonical animations.

## Model quality gate

The model is not accepted merely because it is technically importable. It must visibly remain Cassidy at the intended game camera distance.

### Identity

- face matches the approved canonical concept
- dark chocolate-brown layered hair remains unmistakable
- expressive near-black eyes retain consistent spacing and shape
- body proportions remain stable across all canonical views
- hands and feet are complete and production-ready
- signature leaf-star-compass charm remains recognizable and secondary to the face
- world outfits remain variants of the same Cassidy, never replacement characters

### Deformation

- clean shoulder, elbow, wrist, hip, knee and ankle deformation
- facial deformation remains readable at mobile render distance
- eyelids follow eye movement naturally
- hands support neutral, greeting, explaining, pointing and discovery poses
- clothing does not visibly intersect during canonical locomotion
- hair and accessory secondary motion remains controlled

### Animation

The canonical animation package must cover:

`idle, walk, run, turn, sit, talk, gesture, point, celebrate, think, react`

The runtime may blend these with breathing, gaze, blink and micro-expression layers. The asset itself must not invent Cassidy behavior or progression logic.

## Mobile LOD gate

Three production targets are required:

### LOD0 — Hero / conversation

Highest fidelity. Preserve facial readability, eyes, hair groups, hands, materials and secondary motion.

### LOD1 — World exploration

Reduce geometry and material cost while preserving the face, eye readability, hair silhouette, hands and core clothing silhouette.

### LOD2 — Distant presence

Optimize aggressively while preserving the recognizable Cassidy silhouette and major identity anchors. Do not replace Cassidy with an unrelated sprite or generic avatar.

## Import metadata

Every delivered file must have:

- stable asset ID
- role
- URI/path
- format
- version
- optional SHA-256 checksum
- optional byte size

The repository contract is implemented in `src/characters/cassidyProductionAssetContract.ts`.

## Runtime boundary

The intended runtime flow is:

`Cassidy Brain -> Cassidy State -> Visual Resolver -> Cassidy Asset Registry -> Model -> Face/Gaze -> Expression -> Animation`

The 3D package never owns:

- memory
- relationship state
- learning state
- decisions
- world progression
- rewards
- dialogue logic
- Cassidy personality logic

Those remain in the existing Engine-First architecture.

## Rejection conditions

Reject the package when any of these occur:

- canonical identity is changed
- model, rig or animation package is missing
- any required LOD is missing
- face/eyes no longer match the approved identity
- hair becomes a different color, silhouette or character identity
- facial/gaze controls are absent
- hands/feet are placeholders
- animations are missing or visibly unusable
- world variants create a different character
- files cannot be traced to a production-spec version
- duplicate or ambiguous asset IDs exist

## Current state

The software-side contract is now ready. The remaining Phase 3A deliverable is the real external art package: turnaround/reference sheets followed by the production 3D model, materials, rig, facial/gaze controls, animations and mobile LODs.

No fake 3D geometry is being promoted to canonical status, and no random substitute Cassidy should be generated to fill the gap.
