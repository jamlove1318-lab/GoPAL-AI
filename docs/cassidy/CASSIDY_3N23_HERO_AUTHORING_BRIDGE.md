# Cassidy 3N.23 — Hero Authoring Bridge

## Purpose

The production factory must be able to receive an externally authored flagship Cassidy asset without degrading it.

The bridge is responsible for deterministic intake, semantic mapping, preservation, technical preparation, and downstream integration.

It is **not** responsible for inventing a replacement character when the source is missing or weak.

## Source priority

1. artist-authored Blender `.blend`
2. artist-authored `.glb` / `.gltf`
3. externally generated mesh that has been manually corrected and artist-approved

The final source must be visually reviewed before it becomes canonical.

## Required semantic components

- `cassidy-body-base`
- `cassidy-face-base`
- `cassidy-eyes`
- `cassidy-hair`
- `cassidy-base-outfit`
- `cassidy-shoes`
- `cassidy-companion-charm`

Stable component IDs are authoritative. Object names are only an interchange mapping.

## Preservation rules

The bridge must preserve:

- source mesh topology
- authored proportions
- authored materials unless an explicit technical conversion is required
- UVs
- shape keys / facial data
- skeleton when already production quality
- animation data when already production quality
- object transforms
- semantic component boundaries

Any destructive conversion must be explicit, logged, and reversible.

## Technical preparation

After intake passes, the factory may:

- normalize transforms where safe
- configure smooth/custom normals
- configure material compatibility
- establish semantic sockets
- connect an approved rig
- add facial/gaze systems
- create expression and animation data
- generate mobile LODs from the accepted source
- export deterministic runtime assets

The factory must never use these steps to conceal poor source geometry.

## Visual quality loop

Every significant source revision follows:

`source → intake → technical preparation → five-view render → human review → revision → repeat`

The loop ends only when the human reviewer considers Cassidy flagship quality.

## Reusability

Once accepted, the canonical hero source becomes the root for all world variants. Variants should derive from the same identity source rather than cloning or independently rebuilding Cassidy.

This is the mechanism that keeps Cassidy consistent across GoPAL-AI while allowing world-specific clothing, materials, accessories, and environmental presentation.

## Non-negotiable rule

**A passing technical validator is not a beautiful character.**

The bridge therefore has two independent outcomes:

- technical readiness
- visual approval

Both are required for production release.
