# Cassidy Hero Source Creation Brief — 3N.20

## Objective

Create the **actual Cassidy hero asset** that will enter the GoPAL-AI production factory.

This is an art/asset creation task, not a procedural primitive-modeling task.

The result should look like a premium stylized game character suitable for a flagship mobile learning world. It must remain recognizable as the same Cassidy in every world.

## Canonical identity

Use the existing approved Cassidy concept as the identity authority:

`file_00000000642c821198cbd141ddc7e8d7.png`

Do not redesign Cassidy into a different character.

### Identity anchors

- dark chocolate-brown layered hair
- deep expressive near-black eyes with a warm undertone
- warm intelligent face
- natural balanced full-body proportions
- premium stylized game-character presentation
- practical adventure/learning outfit
- emerald and gold signature accents
- luminous leaf-star-compass companion charm

## Required source deliverable

Preferred:

1. Blender `.blend` with clean editable meshes and materials
2. alternatively a production-quality `.glb`/`.gltf`

The source should contain genuine authored geometry rather than a stack of primitives.

## Character construction target

### Body

- continuous, believable full-body base mesh
- clean edge flow around shoulders, elbows, hips, knees, neck and face
- topology appropriate for deformation
- predominantly clean quads where practical
- no loose vertices
- no accidental internal/intersecting geometry

### Face

The face is a priority asset.

It must have:

- readable eyelid forms
- real eye sockets
- clear nose and mouth planes
- appealing but natural stylized proportions
- enough topology for facial deformation
- no flat mask or featureless head

### Eyes

Use actual eye geometry with:

- left/right eye separation
- iris/pupil detail
- readable sclera
- eyelid interaction
- gaze-ready orientation

### Hair

Hair must be authored as a deliberate layered hairstyle, not a primitive helmet.

It should have:

- a readable silhouette
- layered locks/sections
- controlled volume
- clean attachment to the scalp
- enough geometry for secondary motion

### Outfit

The base outfit should communicate Cassidy's adventure/learning identity while remaining practical for animation and world variants.

Prefer modular clothing pieces so the factory can later produce world-specific variants without replacing Cassidy's identity.

### Shoes

Clean, believable stylized footwear with enough geometry to survive walking/running animations.

### Companion charm

The signature charm should be a real designed accessory:

- leaf/star/compass visual language
- emerald/gold identity
- controlled emissive/glow-ready material
- stable attachment point
- readable at mobile viewing distance

## Required source organization

Use names close to these when possible:

- `Cassidy_Body_Authored`
- `Cassidy_Face_Authored`
- `Cassidy_Eye_L`
- `Cassidy_Eye_R`
- `Cassidy_Hair_Authored`
- `Cassidy_Outfit_Authored`
- `Cassidy_Shoes_Authored`
- `Cassidy_Charm_Authored`

If the source uses different names, the 3N.19 manifest system can map them explicitly.

## Required presentation views

Before handoff, inspect the character from:

- front
- 3/4 front
- side
- 3/4 back
- back

Check silhouette, proportions, face, hair, outfit, shoes and charm at both close and gameplay-like distances.

## Quality rejection list

Reject the source if it resembles:

- a blue/gray mannequin
- primitive cubes/cylinders/cones assembled into a body
- a featureless head
- a helmet-like hair block
- spikes for limbs
- floating hands or feet
- disconnected clothing fragments
- an unreadable accessory
- flat placeholder materials
- a generic character that does not preserve Cassidy's identity

## Factory handoff

Once the source is genuinely production-quality:

1. copy the original source into the Ubuntu GoPAL-AI workspace
2. do not overwrite the original
3. set `CASSIDY_SOURCE_BLEND` or `CASSIDY_SOURCE_ASSET`
4. create/review the explicit `CASSIDY_SOURCE_MANIFEST`
5. run the authoritative Cassidy production pipeline
6. inspect the generated five-view visual review package
7. only after human approval allow runtime export

## Non-negotiable principle

**Do not lower Cassidy's visual standard to make the automated pipeline pass. Raise the source quality until the pipeline can safely pass it.**
