# Cassidy Phase 3N.31 — Export and Intake Verification

## Goal

Make the authored-asset path deterministic and fail-closed:

`Blender authored asset → structural validation → production gate → GLB export → manifest → runtime intake`

## Rules

- No generated placeholder humanoid is accepted as production Cassidy.
- Export is permitted only when the unified production gate reports `ready: true`.
- The package manifest records the validated model checksum and validation domains.
- Mobile LOD budgets and identity preservation are recorded before runtime intake.
- Facial rig, body rig, animation authoring, mesh quality, outfit/material readiness, and visual review remain independent gates.
- Runtime intake must treat a failed manifest as invalid rather than attempting to repair it silently.

## Phase 3N.31 verification scope

The package builder now carries the same major validation domains used by the production gate. This prevents an export manifest from describing a package as ready when a newer validation layer has failed.

The pipeline remains ready for a genuine artist-authored Cassidy `.blend`/`.glb`. Until that asset exists and passes visual review, the correct result is a blocked production package.

## Non-goals

This phase does not create character geometry, fabricate textures, invent animations, or automatically decimate/repair authored assets.
