# Cassidy Phase 3N — 3D Asset Creation & Intake

## Purpose

Phase 3N is the transition from software preparation to the **actual creation of Cassidy's production 3D character**.

The repository already has the runtime boundary, identity contract, package validator, renderer and integration gate. This phase defines exactly where the real character is authored, how it enters GoPAL-AI, and which work is performed by art tools versus application code.

## The actual creation environment

The production character is authored outside the React Native runtime.

### Primary DCC: Blender

Blender is the authoritative production workspace for the bespoke Cassidy asset:

- base mesh and sculpt;
- facial topology and refinement;
- body topology and deformation;
- authored layered hair;
- clothing and accessory geometry;
- materials and textures;
- full-body skeleton;
- facial controls / shape keys;
- eye and eyelid controls;
- hand controls;
- hair and charm secondary motion;
- animation authoring;
- LOD preparation;
- GLB/glTF export.

Specialist tools may be used when they materially improve a focused part of the result, but Blender remains the controlled production handoff point.

## What GoPAL-AI does not do

GoPAL-AI must not attempt to model Cassidy with React components, Three.js primitives, procedural placeholder geometry, or a generic avatar.

The TypeScript runtime owns character state and presentation decisions. It does not redefine Cassidy's physical identity.

## Production sequence

```text
Approved Canonical Concept
        ↓
Production Reference Set
        ↓
Face Blockout
        ↓
Face Review Gate
        ↓
Full Body + Silhouette
        ↓
Hair
        ↓
Clothing
        ↓
Signature Charm
        ↓
Materials / Textures
        ↓
Full-Body Rig
        ↓
Facial + Eye/Gaze Rig
        ↓
8 Expressions
        ↓
11 Animations
        ↓
LOD0 / LOD1 / LOD2
        ↓
GLB/glTF Export
        ↓
Blender Validation
        ↓
Package Validation
        ↓
Human Visual Review
        ↓
GoPAL-AI Asset Intake
        ↓
Registry: integrated
        ↓
Cassidy3DScene
```

## First real milestone: the face

Do not start by making the entire character at once.

The first production checkpoint is a neutral Cassidy head/face in front and three-quarter views. Hair, clothing, charm and dramatic expression must not be allowed to hide an incorrect face.

The face must preserve the canonical identity landmarks already defined by the Character Master. If the face fails review, production stops there instead of polishing the wrong model.

## Character build

After the face is approved:

1. Extend the approved head into the complete body.
2. Establish natural, balanced proportions and a readable game silhouette.
3. Build complete hands and feet.
4. Author Cassidy's layered dark chocolate-brown hair.
5. Build the practical adventure/learning base outfit.
6. Build the leaf-star-compass charm as authored geometry.
7. Separate skin, hair, eyes, brows, outfit, shoes and accessory materials.

World outfits are variants of the same Cassidy asset. They must never create a second Cassidy identity.

## Rig and animation

The production rig must expose the stable semantic runtime contract:

- `Cassidy_Root`
- `Cassidy_Body`
- `Cassidy_Head`
- `Cassidy_Face`
- `Cassidy_Eye_L`
- `Cassidy_Eye_R`
- `Cassidy_Eyelid_L`
- `Cassidy_Eyelid_R`
- `Cassidy_Hand_L`
- `Cassidy_Hand_R`
- `Cassidy_Charm`
- `Cassidy_Hair_Root`

The final export must contain these expression morph targets:

- `expression_neutral`
- `expression_happy`
- `expression_curious`
- `expression_surprised`
- `expression_thoughtful`
- `expression_excited`
- `expression_concerned`
- `expression_playful`

The final export must contain these animation clips:

- `idle`
- `walk`
- `run`
- `turn`
- `sit`
- `talk`
- `gesture`
- `point`
- `celebrate`
- `think`
- `react`

These names are already defined by the shared runtime contract and must not be duplicated in a new mapping system.

## LOD strategy

The production package contains three mobile tiers:

- **LOD0:** highest-quality close/hero presentation;
- **LOD1:** normal gameplay distance;
- **LOD2:** distant/background presentation.

Optimization may reduce geometry, material complexity and other rendering cost, but it may not change Cassidy's recognizable face, hair silhouette or core identity.

## Intake package

The authored handoff should contain, at minimum:

- canonical model file;
- LOD0;
- LOD1;
- LOD2;
- texture/material assets;
- rig information;
- animation package;
- package manifest matching `CassidyProductionPackage`;
- validation evidence;
- visual-review evidence.

The existing package contract remains authoritative. It requires five canonical views, eight expressions, eleven animations, seven material slots, three LODs, facial controls, eye/gaze controls, hand controls and secondary motion. It also validates file identity, format and package completeness.

## Validation gates

### Gate A — Blender scene validation

Run:

```bash
blender --background path/to/Cassidy.blend --python tools/cassidy/validate_cassidy_scene.py
```

The Blender validator checks the required semantic objects, actions and expression shape keys.

### Gate B — exported package validation

Run:

```bash
python tools/cassidy/validate_cassidy_package.py path/to/package.json
```

This validates the production package before runtime integration.

### Gate C — human visual review

Review:

- five canonical views;
- neutral face and three-quarter face;
- eyes/gaze/eyelids;
- hair silhouette;
- clothing and charm;
- all eight expressions;
- all eleven animations;
- secondary motion;
- world consistency;
- mobile readability.

### Gate D — runtime

Only after all previous gates pass may the registry move the model, rig and animation records to `integrated` and expose the runtime model URI.

The existing resolver and `Cassidy3DScene` then become the single reusable runtime path.

## Repository layout

Use the following production layout for authored assets:

```text
assets/
└── cassidy/
    └── production/
        ├── source/
        │   └── Cassidy.blend
        ├── models/
        │   ├── Cassidy_LOD0.glb
        │   ├── Cassidy_LOD1.glb
        │   └── Cassidy_LOD2.glb
        ├── textures/
        ├── manifests/
        │   └── package.json
        └── reviews/
```

Large binaries should only be committed directly when repository size and distribution strategy make that appropriate. Otherwise the manifest may reference the controlled asset delivery location while GoPAL-AI keeps the registry and validation metadata authoritative.

## Important production rule

Do **not** create a fake GLB merely to satisfy the TypeScript contracts.

The validator exists specifically so that an empty, generic, incomplete or placeholder asset cannot be promoted as Cassidy.

## Definition of done

Phase 3N is complete when a real, authored Cassidy production package exists outside the TypeScript runtime, passes Blender validation, passes package validation, passes human visual review, and is ready for controlled registry integration.

The first concrete art deliverable is the **neutral Cassidy face blockout**. Once that passes review, production proceeds to the full body and the rest of the character.
