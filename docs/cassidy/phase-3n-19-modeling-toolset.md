# Cassidy Phase 3N.19 — Non-Destructive Modeling Toolset

## Purpose

3N.19 provides reusable Blender helpers for the real authored Cassidy mesh.
The tools prepare a production-friendly modifier stack and inspect geometry;
they do not generate a substitute character.

## Supported operations

- tag an authored mesh with a semantic geometry role
- configure an X-axis Mirror modifier with clipping and merge
- configure controlled Catmull-Clark subdivision
- enable smooth shading
- inspect topology counts and loose vertices
- inspect UV-layer and material-slot readiness
- validate authored-mesh modeling readiness

## Recommended authoring order

1. Import or create the genuine artist-authored mesh.
2. Place it in `CASSIDY_AUTHORED`.
3. Tag body, head, face, hair, outfit, or other semantic roles.
4. Use Mirror while topology is still symmetrical.
5. Establish clean deformation-friendly topology.
6. Add controlled subdivision only where the asset benefits from it.
7. Prepare UVs and canonical material slots.
8. Run structural validation.
9. Continue to rigging and facial authoring.

## Safety boundary

These helpers never create a humanoid mesh, sculpt a face automatically, or
claim that the character matches the canonical concept. Automated validation
is structural. Likeness and artistic quality remain human/visual review gates.
