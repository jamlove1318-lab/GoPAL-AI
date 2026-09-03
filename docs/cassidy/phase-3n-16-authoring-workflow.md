# Cassidy Phase 3N.16 — Reference-Guided Authoring Workflow

## Goal

Provide a repeatable Blender workspace for creating the real Cassidy asset from the approved concept. The workflow prepares references, symmetry guidance, collections, units, and review metadata without generating a fake humanoid.

## Workspace layers

### `CASSIDY_GUIDES`

Reference-only objects:

- canonical concept image
- symmetry centerline guide
- future measurement/reference guides

Nothing in this collection is considered production geometry.

### `CASSIDY_AUTHORED`

Only real artist-authored geometry belongs here. This is the source of truth for the production mesh.

## Authoring order

1. Import/verify the approved canonical concept.
2. Establish clean scene units and character scale.
3. Block the silhouette from the reference using proper authored topology.
4. Establish the canonical face before clothing detail.
5. Author eyes and eyelids as readable deformation/geometry systems.
6. Build the layered dark-brown hair silhouette.
7. Author hands, feet, and clothing with deformation in mind.
8. Add the signature leaf-star-compass charm as a secondary asset.
9. Create production materials and texture sets.
10. Build the full body rig.
11. Add facial controls and independent eye/gaze controls.
12. Author all required animation clips.
13. Create LOD0/LOD1/LOD2 while preserving identity-critical features.
14. Complete all visual review gates.
15. Export the GLB and package manifest.

## Non-negotiable quality rule

No primitive mannequin, generated block character, or placeholder geometry may be promoted to production merely because it satisfies object-name contracts. Structural contracts prove integration readiness; visual review proves character quality.

## Canonical identity lock

The face, eye design, hair identity, body proportions, and core silhouette remain stable across Emerald Valley, Japanese World, French World, and future world variants. World-specific outfits and material accents may vary without creating a different Cassidy.

## Reusability

The workspace helpers are deliberately generic enough to become the template for future GoPAL-AI characters. Character-specific contracts remain in the Cassidy modules; factory behavior remains reusable.
