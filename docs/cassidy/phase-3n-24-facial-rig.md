# Cassidy Phase 3N.24 — Facial Rig Integration

## Purpose

3N.24 adds a single authoring-side validation layer for Cassidy's face,
eyes, eyelids, eight expression shape keys, and six gaze controls.

## Required authored components

- `Cassidy_Face`
- `Cassidy_Eye_L`
- `Cassidy_Eye_R`
- `Cassidy_Eyelid_L`
- `Cassidy_Eyelid_R`
- eight `expression_*` shape keys
- `gaze_x`, `gaze_y`, `blink_l`, `blink_r`, `squint_l`, `squint_r`

## Driver policy

Existing shape-key drivers are inspected but not rewritten automatically.
This avoids destructive driver edits and keeps artistic facial-rig design in
the authored asset.

## Runtime relationship

The authoring validator consumes the same semantic names already used by the
Cassidy runtime model, rig, and expression contracts. It does not introduce a
second set of runtime identifiers.

## Quality boundary

A structurally complete facial rig is not automatically considered beautiful
or faithful to Cassidy. Eye placement, eyelid behavior, expression nuance,
face deformation, and gaze quality remain visual-review concerns.
