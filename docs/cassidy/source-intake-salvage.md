# Cassidy Real Source Intake & Salvage

## Purpose

The Cassidy production factory can ingest a genuine existing Cassidy `.blend`, `.glb`, or `.gltf` source without treating that source as production-ready.

The preferred source is a native `.blend` because it can preserve Blender-native shape keys, actions, armatures, constraints, materials, and authoring metadata.

## Safety model

The intake pass:

1. Resets the deterministic factory scene.
2. Appends the supplied source into `CASSIDY_SOURCE_MODEL`.
3. Marks imported objects as external-source intake.
4. Preserves the source in `build/cassidy/source/` when the build is run with `CASSIDY_SOURCE_BLEND`.
5. Leaves all strict production gates enabled.
6. Never auto-approves visual review.
7. Never replaces missing quality with primitive placeholder geometry.

## Local Ubuntu execution

From the repository checkout:

```bash
cd /root/cassidy-github-factory

CASSIDY_SOURCE_BLEND=/root/gopal-ai/build/cassidy/checkpoints/10-final.blend \
PYTHONPATH=. \
python3 -m factory.cli build --clean
```

The source snapshot is written under:

```text
build/cassidy/source/cassidy-source.blend
```

The production report records the intake result under `factory.source_intake`.

## Expected outcome for the current legacy source

The legacy source contains useful authored structure, including the Cassidy semantic components, facial expression shape keys, and animation clips. It is nevertheless expected to remain blocked by the new quality gates because its geometry is far below the production floor and its gaze/LOD/deformation requirements are incomplete.

That is the desired behavior. Intake success means **the source was preserved and made available for repair**, not that Cassidy passed production acceptance.

## Upgrade path

```text
legacy .blend
  -> source intake
  -> topology / geometry refinement
  -> robust multi-bone deformation
  -> facial rig preservation/refinement
  -> eye gaze + eyelid controls
  -> real LOD0 / LOD1 / LOD2 geometry
  -> animation validation and cleanup
  -> visual review
  -> strict production gate
  -> runtime GLB/package
```

The original legacy file outside the repository is never modified by the intake process.
