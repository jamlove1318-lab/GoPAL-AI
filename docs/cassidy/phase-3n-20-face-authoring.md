# Cassidy Phase 3N.20 — Face, Eye and Gaze Authoring Contract

## Purpose

3N.20 establishes the reusable contract for Cassidy's face, eyes, eyelids,
expressions, and gaze. It prepares and validates authored controls without
creating synthetic facial geometry.

## Required authored nodes

- `Cassidy_Face`
- `Cassidy_Eye_L`
- `Cassidy_Eye_R`
- `Cassidy_Eyelid_L`
- `Cassidy_Eyelid_R`

## Expression contract

The face mesh must author these shape keys:

- `expression_neutral`
- `expression_happy`
- `expression_curious`
- `expression_surprised`
- `expression_thoughtful`
- `expression_excited`
- `expression_concerned`
- `expression_playful`

## Gaze contract

The rig must author or declare:

- `gaze_x`
- `gaze_y`
- `blink_l`
- `blink_r`
- `squint_l`
- `squint_r`

The contract is compatible with the existing runtime and rig validation
systems, avoiding a second definition of Cassidy's facial behavior.

## Authoring rule

The helper does not generate eyes, eyelids, facial topology, or expression
shapes. These remain artist-authored assets. Automated checks establish
structural completeness; visual review establishes likeness and quality.
