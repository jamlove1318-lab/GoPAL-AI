# Cassidy Phase 3N.23 — Full-Body Rig and Deformation Authoring

## Purpose

3N.23 establishes a reusable validation layer for the genuine artist-authored
Cassidy armature and mesh deformation bindings.

## Required body skeleton

The existing Cassidy runtime contract remains authoritative. The authoring
layer validates root, spine, chest, neck, head, both arms/hands, and both
legs/feet using the canonical `Cassidy_*` bone names.

## Deformation checks

For each authored Cassidy mesh the validator checks that vertex-group names
map to real armature bones and that declared groups contain weighted vertices.
This catches common binding mistakes before animation authoring.

## Quality boundary

The tool does not create an automatic humanoid skeleton or auto-weight a
character. Weight painting, joint placement, deformation quality, and visual
silhouette remain authored production work and visual review gates.

## Integration target

The validated armature feeds the existing rig, facial-control, gaze,
animation, LOD, package, and runtime validation contracts. There is no second
runtime rig definition.
