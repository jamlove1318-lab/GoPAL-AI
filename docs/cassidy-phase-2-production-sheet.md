# Cassidy — Phase 2 Canonical Character Sheet & Production Handoff

**Status:** Phase 2 specification complete

**Canonical design:** Cassidy Master Character Art Bible + approved Phase 1 concept direction

**Code contract:** `src/characters/cassidyProductionSpec.ts`

## 1. Purpose

Phase 2 converts the approved Cassidy identity into a production-ready reference package for a 3D artist or external character-production workflow.

The approved Phase 1 concept is now the visual direction. The purpose of this phase is consistency and production clarity, not another character redesign.

## 2. Canonical identity

Cassidy must remain immediately recognizable as the same person in every asset.

### Face

- Friendly, distinctive stylized-human face.
- Soft, approachable facial planes and contours.
- Memorable brow shape, eye spacing and smile shape.
- Expressions use the whole face rather than only the mouth.
- No generic AI-avatar appearance.

### Eyes

- Deep near-black eyes with a subtle warm brown undertone.
- Layered iris and pupil structure.
- Clear corneal depth.
- Natural scene-driven catchlights.
- Expressive gaze and eyelid controls.
- Eyes are the highest visual identity priority after the overall silhouette.

### Hair

- Permanent dark chocolate-brown identity.
- Restrained espresso/chestnut highlights.
- Layered, authored lock groups.
- Strong readable silhouette.
- A few recognizable face-framing/signature strands.
- Controlled secondary motion rather than noisy individual-strand simulation.

### Body

- Natural balanced production proportions.
- Full head, neck, torso, arms, hands, legs and feet.
- Hands must support readable gestures.
- Shoes must have stable ground contact.
- No placeholder limbs in the production asset.

## 3. Base outfit construction

The canonical base outfit is a practical explorer/learner outfit:

- layered jacket or overshirt
- clean top
- deep neutral lower garment
- practical game-ready footwear
- subtle seams and stitching
- functional pockets/details
- restrained emerald signature accents
- permanent luminous leaf-star-compass charm

The design should communicate adventure, learning and companionship without becoming a costume or relying on exaggerated anatomy.

## 4. Canonical turnaround

The production sheet must contain these views of the exact same Cassidy:

1. front
2. three-quarter front
3. side
4. three-quarter back
5. back

All views must preserve:

- head proportions
- eye spacing
- nose and mouth placement
- hair silhouette
- clothing construction
- accessory placement
- body proportions
- shoe shape and ground contact

The turnaround is the primary geometry reference for 3D modeling.

## 5. Face reference

Create a dedicated face board containing:

- front face
- three-quarter face
- side profile
- close eye crop
- hair framing
- neutral expression
- facial proportion guides

The face board should be cleaner and more construction-oriented than the cinematic hero image.

## 6. Eye reference

Create an eye/material board containing:

- sclera construction
- near-black iris
- warm undertone
- pupil
- iris radial texture
- corneal layer
- upper-lid shadow
- lashes/brows
- natural catchlight examples
- gaze directions
- blink states

The final 3D eye should not depend on a single painted highlight.

## 7. Hair reference

Create a hair construction board containing:

- front silhouette
- side silhouette
- rear silhouette
- major lock groups
- face-framing strands
- highlight behavior
- idle movement
- wind movement
- walk/run movement

The hairstyle is a character-identification feature and must remain stable between assets.

## 8. Expression reference

Canonical expressions:

- neutral
- happy
- curious
- surprised
- thoughtful
- excited
- concerned
- playful

Each expression should define:

- brows
- eyelids
- gaze
- mouth
- cheeks/face tension
- head tilt

Expression references must show the same underlying face.

## 9. Interaction and pose reference

Required production poses:

- relaxed idle
- greeting
- listening
- explaining
- pointing
- looking at a landmark
- discovery
- encouragement
- remembering
- quiet thinking
- playful surprise
- small celebration
- walk
- run
- turn
- sit

The pose sheet is used later for animation blocking and should prioritize believable weight, readable hands and stable feet.

## 10. Signature accessory

Cassidy's accessory is a small luminous leaf-star-compass-inspired charm.

Canonical requirements:

- recognizable silhouette
- crafted physical material
- restrained emissive center
- emerald default glow
- same fundamental geometry in every world
- state-driven intensity/color variation later
- never visually louder than Cassidy's face

Suggested semantic states for later runtime integration:

`normal -> curious -> learning -> discovery -> important -> celebration -> memory`

These are visual states only. The Cassidy engines remain responsible for determining why a state occurs.

## 11. Material sheet

Create one material board with consistent swatches for:

- skin
- dark chocolate hair
- espresso/chestnut hair highlights
- near-black eyes
- brows/lashes
- cream top
- emerald outfit accent
- deep neutral garment
- footwear
- accessory metal/material
- accessory emissive core

The production code records these identity materials in `cassidyProductionSpec.ts` so external asset versions can be checked against the same contract.

## 12. 3D modeling requirements

The eventual model should support:

- full-body three-quarter presentation
- clean facial deformation
- eye/gaze movement
- expressive brows and eyelids
- readable hands
- stable feet
- layered clothing
- controlled hair groups
- accessory attachment
- locomotion
- seated poses
- gesture poses

The model should be stylized and polished, not photorealistic.

## 13. Rig requirements

The later rig must include:

### Body

- root
- pelvis
- spine chain
- neck/head
- arms
- hands
- legs
- feet/toes

### Face

- brows
- eyelids
- eyes/gaze
- mouth
- cheek/face controls
- expression blending

### Secondary motion

- hair
- accessory
- clothing where justified

The animation system should be able to layer locomotion, breathing, gaze, facial micro-expression and secondary motion.

## 14. Mobile production targets

Prepare at least three character quality levels:

### LOD0 — Hero

Highest-quality version for close conversations and important scenes.

### LOD1 — World

Optimized version for normal exploration and three-quarter game-camera presentation.

### LOD2 — Distant

Strong silhouette and identity retention at reduced geometry/material cost.

Across all levels, preserve the visual priorities:

1. silhouette
2. face
3. eyes
4. dark-brown hair
5. hands/gesture readability
6. signature accessory

## 15. Asset naming/versioning

Use stable names rather than random generated filenames.

Recommended:

```text
cassidy_hero_v1
cassidy_turnaround_v1
cassidy_face_v1
cassidy_eyes_v1
cassidy_hair_v1
cassidy_outfit_base_v1
cassidy_expression_sheet_v1
cassidy_pose_sheet_v1
cassidy_accessory_v1
cassidy_material_sheet_v1
cassidy_model_v1
cassidy_rig_v1
cassidy_animation_v1
```

If the character identity changes materially, increment the design version rather than silently replacing the canonical reference.

## 16. Production acceptance gate

Do not move into final 3D production until all required reference assets are coherent.

- [ ] Hero reference approved
- [ ] Turnaround approved
- [ ] Face construction approved
- [ ] Eye construction approved
- [ ] Hair construction approved
- [ ] Base outfit construction approved
- [ ] Expression sheet approved
- [ ] Pose sheet approved
- [ ] Accessory approved
- [ ] Material/color sheet approved
- [ ] Identity consistency checked across all references
- [ ] Mobile LOD strategy documented
- [ ] Asset versions recorded

## 17. GoPAL-AI integration boundary

The production asset does not become the source of Cassidy's intelligence.

The architecture remains:

```text
Cassidy engines
      ↓
Cassidy character state
      ↓
visual resolver
      ↓
canonical Cassidy asset
      ↓
face / gaze / expression / outfit / animation
```

The visual layer must not decide memories, learning, relationships, rewards, quests or Cassidy decisions.

## 18. Phase 2 completion definition

Phase 2 is complete when the approved Phase 1 concept has been translated into a coherent production reference specification and the external art workflow has everything required to create the canonical model without redesigning Cassidy.

The repository now contains the machine-readable production contract at:

`src/characters/cassidyProductionSpec.ts`

The next phase is **Phase 3 — 3D Model & Production Assets**.
