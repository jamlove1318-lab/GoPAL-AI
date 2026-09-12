# Cassidy Phase 3C — Character Master

## Purpose

Phase 3C establishes the visual identity contract above every renderer and every production tool. Cassidy must be modeled **from her approved identity**, never adapted from a convenient generic character.

The approved canonical concept remains the source of visual truth. The 3D model is an implementation of that identity, not the identity itself.

## Identity hierarchy

```text
Approved Canonical Concept
        ↓
Cassidy Character Master
        ↓
Production Specification
        ↓
Turnaround / Face / Hair / Outfit / Expression References
        ↓
3D Sculpt + Materials
        ↓
Full-Body + Facial + Eye/Gaze Rig
        ↓
Animation Library
        ↓
Mobile LODs
        ↓
GLB/glTF Runtime Package
        ↓
Cassidy Renderer Adapter
```

No later stage is allowed to silently redefine an earlier identity decision.

## Face-first rule

The face is the highest-priority part of Cassidy's model. A technically excellent body with a generic or incorrect face is **not** an acceptable Cassidy asset.

The modeling handoff must preserve the same facial construction across front, three-quarter, side, three-quarter-back and back views. The face must remain recognizable before any expression is applied.

The facial review must explicitly check:

- brow arc
- eye opening
- eye spacing
- eye-corner angle
- nose bridge and tip
- cheek volume
- mouth width and upper-lip curve
- chin shape
- jaw contour
- overall facial silhouette

These are identity landmarks, not optional artistic interpretation.

## Eyes

Cassidy's eyes are a primary emotional communication system.

Required characteristics:

- deep near-black eye family (`#17110E`)
- readable sclera, iris, pupil and natural corneal highlight
- independent gaze control
- eyelid support around gaze changes
- expressive eye/brow coordination
- catchlights driven by the scene rather than painted permanently into the eye

The eyes should remain readable at the normal game-camera distance without becoming exaggerated or disconnected from the face.

## Hair

Hair is another permanent identity cue.

- base: deep chocolate brown (`#3B2419`)
- highlight family: controlled espresso (`#70462F`)
- layered authored groups rather than a generic single hair mass
- stable overall silhouette across worlds
- controlled secondary motion
- world lighting may change appearance, but the hair identity does not change

World variants must not recolor or redesign Cassidy's hair merely to make each world feel different.

## Body and silhouette

Cassidy uses natural, balanced full-body proportions. The production model must have:

- complete readable hands
- complete readable feet
- natural weight and grounding
- clean deformation zones
- a recognizable silhouette from the game camera
- movement-safe clothing intersections

The model should look designed as one coherent character rather than a collection of purchased or interchangeable parts.

## Clothing

The canonical clothing language is practical adventure/learning clothing. Materials and small accents may adapt to a world, season or festival.

The identity rule is:

> Change the outfit variant; do not change Cassidy.

World variants may change fabric, trim, palette accents and accessories while preserving face, eyes, hair identity, body proportions and core silhouette.

## Signature charm

Cassidy's leaf-star-compass companion charm is a secondary but persistent identity cue.

It should:

- have authored geometry
- have a recognizable silhouette
- use restrained emerald glow (`#66E0B5`)
- use restrained warm-gold accent (`#D6A84F`)
- support state-driven emissive behavior
- remain visually secondary to Cassidy's face

The charm should feel like part of Cassidy's world and personality, not a generic glowing particle attached to the model.

## Facial animation

The model must support the existing canonical expression vocabulary:

1. neutral
2. happy
3. curious
4. surprised
5. thoughtful
6. excited
7. concerned
8. playful

Expressions should be authored as controlled facial deformation rather than relying only on head rotation or texture swaps. Blender shape keys/morph targets are a suitable production mechanism for this class of facial deformation, and glTF supports shape-key animation for runtime delivery. citeturn0search1turn0search2

Expressions should be blendable where appropriate so Cassidy can produce subtle intermediate emotional states rather than only eight rigid poses.

## Animation personality

The existing runtime vocabulary remains:

- idle
- walk
- run
- turn
- sit
- talk
- gesture
- point
- celebrate
- think
- react

Animation quality is judged by personality, weight, timing and continuity — not merely by whether an animation clip exists.

Cassidy should communicate attention through small changes in gaze, posture, head orientation, hand gestures and facial expression. The renderer must not invent emotional decisions; it receives those decisions from the Cassidy state/visual resolver.

## Production model requirements

The final production package should contain:

- canonical full-body model
- production materials
- full-body skeleton
- facial controls or morph targets
- independent eye/gaze controls
- eyelid controls
- hand controls
- hair secondary-motion controls
- accessory secondary-motion controls
- 8 canonical expressions
- 11 canonical animations
- LOD0, LOD1 and LOD2
- validated GLB/glTF export

The glTF format is appropriate as the runtime interchange target because its current specification supports both skeletal animation and morph-target animation. citeturn0search24

## Quality gate

A Cassidy asset is rejected if any of these are true:

- the face only resembles Cassidy from one camera angle
- the eyes are generic or unreadable
- the hair silhouette has changed materially
- body proportions were altered to fit a source asset
- clothing intersections are visibly broken during motion
- hands or feet are placeholder geometry
- expressions are missing or visually indistinguishable
- gaze and eyelids are not independently controllable
- the charm overwhelms the face
- a world variant changes Cassidy's core identity
- the asset was substituted with an unrelated generic model
- the asset cannot be traced back to the approved canonical reference

## Renderer independence

This master contract does not depend on Blender, Three.js, React Three Fiber, Expo GL, Unity, Unreal, Godot, or any other renderer.

The production boundary remains:

```text
Cassidy Engines
    ↓
Cassidy Character State
    ↓
Cassidy Visual Resolver
    ↓
Cassidy Renderer Adapter
    ↓
3D Renderer
    ↓
Production Cassidy Asset
```

That separation means we can improve the character art later without rewriting Cassidy's intelligence, memory, relationship, learning, world or decision systems.

## Current implementation state

Phase 3C now exists as a machine-readable contract in:

`src/characters/cassidyCharacterMaster.ts`

The existing `cassidyProductionSpec.ts`, production asset registry, visual resolver and renderer adapter remain the implementation layers below this identity master.

**No fake 3D asset is introduced by this phase.** The software remains honest about the fact that the actual production model must be authored and validated externally before it can become the runtime Cassidy asset.
