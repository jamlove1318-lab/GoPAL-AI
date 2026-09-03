# Cassidy Phase 3N.17 — Authored Mesh Quality Gate

The Blender factory now performs a non-destructive structural inspection of authored Cassidy meshes before rigging/export can be considered production-ready.

## Checks

- at least one authored Cassidy mesh exists
- mesh has vertices and polygons
- mesh is visible in the active scene
- mesh scale is non-zero
- topology has no boundary edges
- topology has no edges shared by more than two polygons
- subdivision usage is reported for review
- per-object topology and geometry diagnostics are retained in the report

## Intent

This is an objective topology/scene-integrity gate, not an artistic-quality judge. It does not automatically remodel, retopologize, smooth, decimate, or otherwise modify authored geometry.

A production artist remains responsible for silhouette, anatomy, facial appeal, topology flow, deformation quality, hair construction, clothing construction, and visual fidelity to the canonical Cassidy reference.

## Pipeline position

Reference → authored geometry → mesh quality → materials → rig/gaze → expressions → animation → LOD → visual review → GLB export.

The gate is fail-closed so an empty or structurally invalid scene cannot be mistaken for a finished Cassidy asset.
