# Cassidy Blender Production Workspace

Phase 3F defines Blender as the bespoke character-production environment. Expo, React Three Fiber and Three.js remain runtime technologies only.

## Goal

Produce a real, authored Cassidy character from the approved identity reference. Do not recolor, rename or cosmetically modify a generic avatar and call it Cassidy.

## Workspace

```text
cassidy_blender/
  00_reference/
  01_blockout/
  02_sculpt/
  03_hair/
  04_clothing/
  05_accessory/
  06_materials/
  07_rig/
  08_expressions/
  09_animation/
  10_lod/
  11_export/
  12_validation/
```

## Required authored result

- canonical face and head, consistent from every required view
- expressive near-black eyes with independent gaze and eyelids
- dark chocolate-brown layered hair with controlled secondary motion
- natural balanced full-body construction with readable hands and feet
- practical adventure/learning outfit
- authored leaf-star-compass charm with restrained emerald/gold emissive response
- full-body rig, facial controls, eye/gaze controls, hand controls and secondary motion
- 8 canonical expressions and 11 canonical animations
- LOD0/LOD1/LOD2 that preserve Cassidy identity
- GLB/glTF runtime package with stable semantic names from `src/characters/cassidyRuntimeModelContract.ts`

## Quality rule

The face is approved before the production team proceeds to polish. A beautiful generic model is a failed Cassidy model. Identity consistency outranks polygon count, effects and decoration.

## Runtime handoff

The final package is imported through the existing `CassidyProductionPackage` contract and registry. Do not create a second runtime asset registry or a second Cassidy state owner.
