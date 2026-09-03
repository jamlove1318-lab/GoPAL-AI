# Cassidy Phase 3N.32 — Authored Asset Intake Boundary

## Purpose

Establish a clean boundary for the first genuine artist-authored Cassidy source asset.

Supported source formats:

- `.blend` — preferred source-of-truth authoring file
- `.glb` — portable model source
- `.gltf` — portable model source

## Intake policy

The intake layer only answers whether a source file exists, is non-empty, and uses a supported format. It does **not** claim that the asset is a finished Cassidy.

A source must still pass the existing production pipeline:

`source asset → Blender scene validation → mesh/deformation → face/gaze → hair/charm → outfit/materials → animation → LOD → visual review → production gate → export → runtime manifest`

## Identity protection

The canonical concept reference remains:

`file_00000000642c821198cbd141ddc7e8d7.png`

The intake layer must never alter that reference or silently substitute another character design.

## Non-goals

No automatic character generation, retopology, rigging, texture synthesis, animation synthesis, or visual beautification is performed here. Those operations would hide authoring defects and weaken the production gate.
