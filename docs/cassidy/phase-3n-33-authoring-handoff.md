# Cassidy Phase 3N.33 — Authoring Handoff Workflow

## Goal

Turn the Blender factory into a disciplined starting point for creating the first real Cassidy 3D asset without synthesizing a placeholder character.

The workspace is now paired with an ordered authoring checklist:

1. Reference — lock the canonical concept and identity.
2. Blockout — author the full-body silhouette and proportions.
3. Face — author face, eyes, eyelids, and readable facial forms.
4. Hair — author the layered hair silhouette and secondary-motion structure.
5. Outfit — author clothing construction and world-safe material separation.
6. Charm — author the signature leaf-star-compass charm.
7. Materials — author all required production material slots.
8. Rig — author the full-body deformation rig and verified bindings.
9. Facial rig — author expressions, eyelids, and gaze controls.
10. Animation — author the required movement and interaction clips.
11. LOD — author LOD0/LOD1/LOD2 while preserving identity-critical features.
12. Review — complete every visual review gate.

## Identity locks

The following must remain stable across the authoring process:

- face identity
- eyes
- layered dark-brown hair identity
- body proportions and core silhouette
- signature charm

World variants may change clothing and material accents, but they must not silently redesign the character.

## Tooling boundary

The authoring checklist and workspace are orchestration aids. They do not generate humanoid geometry, auto-retopologize, auto-rig, synthesize expressions, or mark visual gates as passed.

## Intake boundary

The older `cassidy_asset_intake_report.py` entrypoint now delegates to the current 3N.32 intake implementation so source validation has one canonical implementation rather than two drifting contracts.

## Production boundary

A valid source file is not a production-ready asset. Production approval still requires the unified Cassidy production gate and completed visual review before GLB export.

## Current state

The repository contains the canonical concept and the complete authoring/validation infrastructure. A finished artist-authored Cassidy GLB is still required before runtime production integration can be approved.
