# Cassidy Phase 3N.29 — Structural Validation Hardening

## Purpose

Strengthen the authored-asset production gate so metadata cannot substitute for real geometry, rig bindings, or animation authorship.

## Changes

- Mesh validation is safe in headless Blender and no longer depends on viewport visibility APIs.
- Deformation validation now requires Cassidy meshes to have an Armature modifier bound to the expected Cassidy armature.
- Vertex groups must correspond to real armature bones and have positive authored weights.
- Required body-bone groups are checked explicitly.
- Facial gaze validation uses actual armature evidence only; scene declarations are documentation, not proof.
- Facial-rig validation remains authored-only and does not synthesize controls.
- Animation metadata validation requires the Cassidy animation authoring version.
- The unified production gate includes body deformation and facial-rig authoring gates.

## Fail-closed policy

A clean factory scene, metadata-only scene, unbound mesh, incomplete rig, incomplete animation set, or incomplete review remains blocked from production export.

## Important

This phase does not create a finished Cassidy model. The canonical concept remains the identity reference, while the production GLB must still come from genuine authored character geometry, materials, rigging, facial work, animation, LODs, and visual review.
