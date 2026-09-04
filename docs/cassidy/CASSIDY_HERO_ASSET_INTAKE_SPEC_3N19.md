# Cassidy Hero Asset Intake — 3N.19

## Purpose

3N.19 is the production handoff boundary between an external/art-authored Cassidy hero asset and the existing GoPAL-AI Blender factory.

The factory must **assemble, validate, optimize, rig, animate, stage, review, and export** a genuine character. It must not manufacture a convincing-looking humanoid from primitive geometry.

The previous low-poly primitive result is explicitly rejected as a hero asset.

## Quality bar

Cassidy is a flagship character. The acceptance target is a premium stylized game character, not a technical demo or placeholder.

Required visual qualities:

- recognizable human face and appealing facial proportions
- expressive near-black eyes with readable eyelids and gaze
- dark chocolate-brown layered hair with a deliberate silhouette
- believable hands, feet, joints, and body transitions
- coherent full-body silhouette from all five canonical views
- practical adventure/learning outfit with clean construction
- emerald/gold signature accents
- luminous leaf-star-compass companion charm
- physically coherent PBR materials
- clean deformation topology suitable for animation
- consistent identity across front, 3/4 front, side, 3/4 back, and back

## Geometry policy

### Allowed

- artist-authored continuous character geometry
- externally generated/artist-created meshes that have been manually quality-controlled
- separate authored components such as eyes, hair, clothing, shoes, and charm
- non-destructive technical optimization
- modular assembly into the canonical Cassidy hierarchy

### Forbidden

- primitive humanoid construction as the hero source
- collections of cubes/cylinders/cones used as a character body
- floating placeholder limbs
- block/helmet hair used as final hair
- generated geometry presented as approved Cassidy art
- automatic visual approval

## Intake requirements

A source is eligible for the expensive production pipeline only when it passes the hero intake gate.

### Body/base mesh

Recommended target for the authored body/base:

- at least 1,500 vertices
- at least 1,000 polygons
- preferably predominantly quad-based topology
- no loose vertices
- no accidental excessive disconnected components
- no obvious non-manifold construction
- usable normals
- usable UVs when the source provides textured materials
- transforms compatible with a production rig

The numeric thresholds are minimum safety gates, **not** a claim that 1,500 vertices is enough for final hero quality. Higher-quality topology is preferred.

### Required semantic components

The assembled source should expose or be mappable to:

1. `cassidy-body-base`
2. `cassidy-face-base`
3. `cassidy-eyes`
4. `cassidy-hair`
5. `cassidy-base-outfit`
6. `cassidy-shoes`
7. `cassidy-companion-charm`

The source may use different object names; the intake/assembly layer maps them to these stable component IDs.

## Identity contract

Canonical identity is preserved from the existing GoPAL-AI Cassidy specification:

- dark chocolate-brown layered hair
- deep expressive near-black eyes with warm undertone
- warm intelligent face
- natural balanced full-body proportions
- premium stylized game-character presentation
- practical adventure/learning outfit
- emerald/gold signature accents
- luminous leaf-star-compass companion charm

World variants may alter clothing materials, accessories, environmental wear, and contextual styling, but must not silently replace Cassidy's face, hair identity, proportions, or core silhouette.

## Canonical review views

Every source must ultimately be reviewed from:

- front
- 3/4 front
- side
- 3/4 back
- back

These views are evidence only. They never auto-approve the character.

## Production pipeline

```text
EXTERNAL/AUTHORED HERO SOURCE
        ↓
STRICT HERO INTAKE
        ↓
SEMANTIC COMPONENT REGISTRATION
        ↓
AUTHORED ASSEMBLY
        ↓
SOURCE-PRESERVING TECHNICAL UPGRADE
        ↓
BODY RIG + WEIGHTS
        ↓
FACE + FACIAL RIG + GAZE
        ↓
HAIR + OUTFIT + SHOES + CHARM
        ↓
EXPRESSIONS + ANIMATIONS
        ↓
LOD0 / LOD1 / LOD2
        ↓
FIVE-VIEW VISUAL REVIEW PACKAGE
        ↓
HUMAN VISUAL APPROVAL
        ↓
RUNTIME GLB EXPORT
        ↓
ACCEPTANCE
```

## What the factory owns

The existing factory remains responsible for:

- deterministic orchestration
- source intake and contract enforcement
- semantic assembly
- technical scene preparation
- source-preserving optimization
- body/facial rigging
- gaze and expressions
- outfit/material bindings
- animation library
- LOD generation
- mobile budgets
- staging
- visual evidence generation
- runtime export
- reports/checkpoints/synchronization

## What the factory must not fake

The factory must not invent a final face, final human topology, final hair design, or final character proportions merely to satisfy automated gates.

A missing authored hero asset is a legitimate production blocker.

## External asset handoff

The preferred source handoff is a Blender `.blend` or a production-quality `.glb`/`.gltf` containing genuine authored geometry. The source should be copied into the Ubuntu workspace without modifying the original.

Set one of:

```bash
export CASSIDY_SOURCE_BLEND="/absolute/path/to/cassidy-hero.blend"
```

or

```bash
export CASSIDY_SOURCE_ASSET="/absolute/path/to/cassidy-hero.glb"
```

Then run the existing authoritative orchestrator. Do not bypass the intake gate.

## Acceptance principle

**Technical correctness is necessary but not sufficient.**

A character can have a valid rig, valid animations, valid LODs, and a valid GLB and still be rejected if the visual identity is poor. Human visual review therefore remains mandatory.
