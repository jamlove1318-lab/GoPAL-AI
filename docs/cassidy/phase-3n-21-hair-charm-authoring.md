# Cassidy Phase 3N.21 — Hair and Signature Charm Authoring

## Identity

Cassidy's canonical hair identity is layered dark chocolate-brown hair with
restrained warm highlights. Her signature accessory is the emerald/gold
leaf-star-compass companion charm.

## Tooling

`cassidy_hair_charm.py` provides reusable discovery, identity metadata,
secondary-motion metadata, and structural validation for artist-authored hair
and charm assets.

## Hair requirements

- authored hair geometry
- stable `Cassidy_Hair_Root`
- readable silhouette from canonical review views
- material separation from skin and clothing
- optional layered groups for controlled secondary motion
- mobile-safe geometry and animation budgets

## Charm requirements

- authored accessory geometry
- stable identity as `leaf-star-compass`
- emerald/gold material treatment
- restrained emissive/glow treatment
- attachment that survives animation and outfit changes

## Quality boundary

The tooling does not generate hair or a charm and cannot judge beauty or
likeness. Silhouette, material quality, attachment, and visual identity remain
explicit review gates.
