# GoPAL Living World — Mixed Asset Representation Strategy

GoPAL is intentionally **not a 2D-only or 3D-only application**.

Every world element should use the representation that gives the best combination of visual quality, interaction, performance, and emotional atmosphere.

## Representation layers

### 3D

Use 3D when the player needs genuine spatial presence:

- Cassidy and interactive characters
- close buildings and architecture
- roads and walkable spaces
- vehicles and trains
- furniture that can be inspected
- interactive props
- foreground trees and plants
- objects that need real occlusion/parallax
- scenes where the camera can move freely around the object

### 2.5D

Use 2.5D when depth matters visually but full geometry would be wasteful:

- distant buildings
- skyline silhouettes
- mountains and valley walls
- layered forests
- map landmarks
- atmospheric scenery
- background crowds
- decorative structures
- large environmental silhouettes

2.5D can combine sprites, layered planes, depth offsets, parallax, baked lighting, and selective 3D hero objects.

### 2D

Use 2D when a flat representation is visually stronger, cheaper, or more readable:

- portraits
- icons and symbols
- map tiles
- inventory objects
- small decorative objects
- particles and light masks
- distant background details
- illustrated discoveries
- notebook/collection artwork
- small UI-adjacent world annotations

2D is not a fallback or a lesser quality tier. A beautiful illustration can be better than a low-quality 3D model.

## Selection rule

Choose the representation **per asset and per scene**, not globally.

A single conceptual object may have several validated representations:

```text
Tree
├── 3D hero tree       → close interaction
├── 3D LOD tree        → mid-distance
├── 2.5D tree cluster  → distant forest
└── 2D silhouette      → far horizon / map
```

This is intentional reuse, not duplicate world logic.

## Reuse rule

One semantic asset ID may have multiple visual bindings:

```text
assetId: emerald-valley-tree-01

visualBindings:
  close: 3d
  mid: 3d-lod
  far: 2.5d
  map: 2d
```

The world simulation still owns the semantic object. Representation is only a visual binding.

## Animation rule

The existing world animation vocabulary remains authoritative. 2D, 2.5D and 3D assets can all respond to the same semantic intent:

```text
wind → tree sway
look → character head/eye motion
walk → character locomotion
highlight → 2D glow / 2.5D depth response / 3D material response
weather → particles + layered sprites + 3D environment motion
```

Blender, Spine, Rive and Godot remain production/authoring tools rather than independent runtime simulation brains.

## Quality gates

Every representation must pass:

1. provenance/license validation
2. visual quality review
3. technical validation
4. mobile performance review
5. runtime integration review
6. human approval for hero assets

## Current sources

Kenney provides both 2D and 3D categories, including 2D background/map/item assets and 3D city, nature and transport kits. citeturn0search2turn0search11turn0search12

Poly Haven provides high-quality CC0 HDRIs, photogrammetry-based textures and 3D models. citeturn0search0turn0search1turn0search3

The acquisition catalog may therefore contain all three representations. The runtime should promote only validated optimized derivatives.
