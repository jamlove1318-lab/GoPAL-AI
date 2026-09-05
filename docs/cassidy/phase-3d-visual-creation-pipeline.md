# Cassidy Phase 3D — Visual Creation Pipeline

## Purpose

Phase 3D defines how the approved Cassidy identity becomes a bespoke production character without allowing a modeling tool, template, marketplace asset, or generated shortcut to redefine her appearance.

The goal is not simply to obtain a 3D model. The goal is to produce a **recognizable, beautiful, expressive Cassidy** that remains the same character across cameras, worlds, expressions, animations and mobile LODs.

## Core principle

> **Create the character from Cassidy. Never force Cassidy into a pre-existing character.**

A generic base mesh may be used only as an invisible production starting point if it is substantially reshaped and all final identity decisions are authored against the approved references. No third-party character may become Cassidy by recoloring clothes, changing hair and calling the result finished.

## Recommended production strategy

Use a bespoke digital-character workflow with a DCC such as Blender as the authoring environment. The repository remains renderer-neutral and does not depend on that authoring tool.

```text
Approved Canonical Concept
        ↓
Identity / Turnaround Reference Package
        ↓
Face Blockout + Sculpt
        ↓
Full Body Sculpt
        ↓
Hair Construction
        ↓
Clothing Construction
        ↓
Charm Construction
        ↓
Retopology / Clean Deformation Mesh
        ↓
UV + Materials + Texture Painting
        ↓
Body Rig
        ↓
Face / Eye / Eyelid Rig
        ↓
Hair / Charm Secondary Motion
        ↓
Expression Library
        ↓
Animation Library
        ↓
LOD0 / LOD1 / LOD2
        ↓
GLB/glTF Export
        ↓
Automated Package Validation
        ↓
Human Visual Review
        ↓
Cassidy Production Registry
        ↓
GoPAL-AI Renderer
```

## Stage 1 — Reference package

Before modeling begins, the artist must have a coherent reference set derived from the approved canonical concept:

- full-body hero
- front view
- three-quarter front
- side
- three-quarter back
- back
- face close-up
- eye close-up
- hair construction reference
- base outfit reference
- expression sheet
- pose sheet
- charm reference
- material/color sheet

If a required reference is ambiguous, the ambiguity is resolved **before** production. The modeler must not silently invent a new identity decision.

## Stage 2 — Face-first blockout

The face is reviewed before expensive body/detail work begins.

The blockout must establish:

- brow arc
- eye opening
- eye spacing
- eye-corner angle
- nose bridge
- nose tip
- cheek volume
- mouth width
- upper-lip curve
- chin shape
- jaw contour
- overall facial silhouette

### Face approval gate

The neutral face must be recognizable as Cassidy from front, three-quarter and side views **without relying on hair, clothing, expression or accessory**.

If the face fails this gate, stop and revise it before continuing.

## Stage 3 — Eyes

Eyes receive dedicated modeling and material attention.

Required structure:

- sclera
- iris
- pupil
- corneal surface/highlight response
- eyelids
- brows
- independent gaze controls

Eye identity is reviewed both in neutral state and while looking toward different targets. Eye motion must feel attached to the face rather than sliding across it.

## Stage 4 — Hair

Hair is authored as a designed silhouette, not a generic hairstyle selected after the body is complete.

Requirements:

- deep chocolate-brown base
- controlled espresso highlights
- layered authored groups
- stable front/three-quarter/back silhouette
- controlled secondary movement
- no world-specific redesign of the canonical hairstyle

The hairstyle must remain recognizable even when materials and lighting change.

## Stage 5 — Body and clothing

The body is built to the canonical balanced proportions rather than scaled to fit a source mesh.

Clothing is constructed as real layered character clothing with intentional seams, folds, thickness and deformation zones where appropriate.

The clothing must support:

- walking
- running
- turning
- sitting
- gesturing
- pointing
- celebration

The base outfit establishes Cassidy's visual language. World variants are derived from it; they do not replace her identity.

## Stage 6 — Signature charm

The leaf-star-compass charm receives its own authored geometry and materials.

It should have:

- recognizable leaf/star/compass silhouette
- restrained emerald emissive response
- warm-gold material accent
- controlled secondary motion
- state-driven glow hooks

The charm is deliberately secondary to the face.

## Stage 7 — Production mesh

After the sculpt is visually approved:

1. establish clean topology
2. preserve facial deformation zones
3. preserve eyelid and eye geometry
4. preserve hair attachment and movement zones
5. establish clean clothing deformation zones
6. validate hands and feet
7. create UVs
8. separate materials according to the production contract

Do not optimize the model so aggressively that facial identity is lost.

## Stage 8 — Materials

Materials should be authored to preserve Cassidy's identity under different environments.

Priority order:

1. face
2. eyes
3. hair
4. outfit
5. shoes
6. charm

The face should avoid an artificial plastic appearance. Hair should maintain its dark-brown identity under both warm and cool lighting. The charm should not become a permanent bright visual distraction.

## Stage 9 — Rigging

The rig must provide separate control domains:

```text
Body
 ├─ locomotion
 ├─ torso / shoulders
 ├─ arms / hands
 └─ legs / feet

Face
 ├─ brows
 ├─ eyelids
 ├─ eyes
 ├─ mouth
 └─ expression controls

Secondary
 ├─ hair
 └─ charm
```

Facial deformation may use authored shape keys/morph targets, bones, or a controlled combination. Blender documents shape keys as a standard mechanism for facial animation, and its current glTF exporter supports exporting shape keys and their animation. citeturn0search2turn0search0

## Stage 10 — Expression library

Author the eight existing canonical expressions:

- neutral
- happy
- curious
- surprised
- thoughtful
- excited
- concerned
- playful

Expressions should be blendable where useful. Neutral must remain the identity anchor.

## Stage 11 — Animation personality

Author the existing eleven runtime animations:

- idle
- walk
- run
- turn
- sit
- talk
- gesture
- point
- celebrate
- think
- react

The goal is not a collection of technically valid clips. Cassidy should have a coherent movement language: believable weight, natural transitions, attentive gaze, expressive hands and subtle secondary motion.

## Stage 12 — LODs

Create:

- LOD0 — highest-quality close interaction
- LOD1 — normal gameplay
- LOD2 — distant/world-scale presentation

The face, eyes, hair silhouette and core body identity must survive every LOD.

LOD optimization must be measured rather than guessed. Capture model size, texture memory, load time, draw calls and animation cost before approving the package.

## Stage 13 — GLB/glTF package

The final runtime interchange package should contain the model, materials, skeleton, required morph targets/shape keys, and named animation clips required by the production contract.

Blender's current glTF documentation explicitly supports object/bone transforms and shape-key values as animation channels, and provides shape-key export controls and animation export options. citeturn0search0

The runtime package must not contain an unrelated placeholder Cassidy.

## Stage 14 — Two-layer acceptance

Cassidy requires **both** machine validation and human visual review.

### Machine gate

Validate:

- character ID
- identity lock
- model presence
- rig presence
- animation presence
- 8 expressions
- 11 animations
- eye/gaze controls
- secondary motion controls
- LOD0/1/2
- material slots
- file formats
- duplicate asset IDs
- package versions
- runtime URIs

### Human gate

Review:

- face identity
- eye identity
- hair silhouette
- body proportions
- clothing construction
- charm design
- expression quality
- gaze quality
- animation personality
- world consistency
- mobile readability

**Both gates must pass.**

## Rejection rule

Reject and revise the asset if the result is merely:

- a generic avatar
- a recolored template
- a single-angle likeness
- a face that only works with a particular hairstyle
- a model with interchangeable-looking body parts
- an over-detailed model whose face no longer reads at gameplay distance
- a model whose world variants look like different people

Technical completion is not visual completion.

## External art workflow boundary

The repository does not pretend that code can author the final bespoke character automatically.

The software owns:

- identity contracts
- production specifications
- asset manifests
- validation
- runtime resolution
- renderer integration
- state-driven expression/animation intent

The art workflow owns:

- sculpting
- modeling
- topology
- UVs
- texture painting
- rig construction
- facial deformation authoring
- animation authoring
- LOD authoring

This boundary lets GoPAL-AI use a high-quality externally authored Cassidy without coupling the engine to the art software.

## Definition of done

Phase 3D is complete only when a real production Cassidy package passes the machine and human gates and can enter the existing production asset registry without bypassing identity validation.

Until then, the existing visual fallback remains a fallback — never a claim that production Cassidy has already been created.
