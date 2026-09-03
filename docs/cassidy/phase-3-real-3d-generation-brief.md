# Cassidy — Phase 3 Real 3D Generation Brief

**Status:** ACTIVE PRODUCTION

This document starts the actual Cassidy 3D asset production step. It does not redesign Cassidy, create another concept, or replace the canonical image.

## Source of truth

Use the existing approved Phase 1 image in the repository:

`file_00000000642c821198cbd141ddc7e8d7.png`

Use these existing specifications together with the image:

- `docs/cassidy-master-character-bible.md`
- `docs/cassidy-phase-1-concept-generation.md`
- `docs/cassidy-phase-2-production-sheet.md`
- `src/characters/cassidyProductionSpec.ts`
- `docs/cassidy/phase-3-3d-production-handoff.md`

The image is the identity reference. The written specifications are the construction constraints.

## Production target

Create a **real, full-body, stylized 3D Cassidy**, not a primitive/blockout and not a generic avatar.

The first deliverable is:

`cassidy_model_v1.glb`

The model must contain authored geometry for:

- full head and face
- neck and torso
- complete arms
- complete hands
- complete legs
- complete feet
- practical footwear
- layered clothing
- dark chocolate-brown layered hair
- expressive eyes
- brows and eyelids
- luminous leaf-star-compass charm

## Identity lock

Never redesign these during 3D generation:

- face identity
- eye spacing and shape
- brow character
- smile character
- dark chocolate-brown hair identity
- core body silhouette
- canonical clothing language
- emerald/gold signature language
- leaf-star-compass charm

The model should remain recognizably the same Cassidy from front, three-quarter front, side, three-quarter back and back.

## Visual direction

Stylized premium game character.

Avoid:

- photorealistic human rendering
- generic AI-avatar appearance
- exaggerated anatomy
- blocky primitive geometry
- toy-like proportions
- unrelated hairstyles
- unrelated clothing
- painted-on eyes
- painted-on hair
- single-image fake depth
- sprite/card representations

Prioritize:

1. silhouette
2. face
3. eyes
4. hair
5. hands
6. clothing construction
7. charm

## Generation instruction

When an image-to-3D system is used, provide the canonical Cassidy image as the image condition and use this instruction:

> Create a production-quality stylized full-body 3D character from the supplied Cassidy reference. Preserve the exact character identity, facial design, eye placement, dark chocolate-brown layered hairstyle, body silhouette, practical explorer/learner outfit, emerald/gold accents, and small luminous leaf-star-compass charm. Build genuine volumetric geometry with complete anatomy, readable hands and feet, layered clothing, separate hair masses, separate eye geometry, eyelid/brow geometry or equivalent facial deformation support, and a physically attached accessory. The result must be suitable as the starting mesh for Blender rigging and game production. Keep the character polished, elegant, warm, approachable and expressive. Do not redesign the character and do not invent a different person. Do not output a flat card, billboard, sprite, mannequin, blockout, primitive-only character or generic avatar.

## Important generation boundary

A generated mesh is the **starting production asset**, not the final Cassidy.

After generation, the real production sequence is:

`Generated Mesh -> Blender Cleanup -> Face/Topology -> Hair -> Outfit -> Materials -> Rig -> Facial Rig -> Eye/Gaze -> Expressions -> Animation -> LOD0/1/2 -> GLB -> GoPAL-AI`

The existing Blender factory and validation pipeline must be used after a genuine mesh exists. No fake geometry should be added merely to satisfy the pipeline.

## First production milestone

Do not move to animation yet.

The immediate goal is a strong canonical base mesh that can survive close three-quarter inspection and can be cleanly rigged.

Required handoff from the 3D generation step:

- GLB or GLTF mesh
- texture files if generated
- original generation output if available
- source image used
- generator/version information
- triangle/vertex count
- license/usage information

Recommended working filename:

`assets/characters/cassidy/source/cassidy_model_generated_v1.glb`

The cleaned production model will later become:

`assets/characters/cassidy/runtime/cassidy_model_v1.glb`

## Mobile constraint

The user's Ubuntu environment is suitable for Blender authoring and export, but the local mobile hardware is not a suitable target for large GPU-based AI 3D inference. AI mesh generation should therefore happen in a suitable external/cloud environment or on a sufficiently capable computer; Blender on the user's Ubuntu environment remains the cleanup, rigging, animation and export environment.

## Current repository state

The repository already contains the canonical concept, Phase 2 production contract, Blender authoring factory, runtime model contract, asset registry, rig/animation/LOD systems and acceptance infrastructure.

This brief exists to connect those existing systems to the **actual binary 3D asset creation step**.
