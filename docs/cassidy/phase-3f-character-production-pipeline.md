# Cassidy Phase 3F — Character Production Pipeline

## Purpose

Phase 3E established the runtime renderer boundary. Phase 3F establishes the real character-production boundary so Cassidy is authored as a game-quality character rather than approximated with Expo or Three.js primitives.

## Tool responsibilities

| Tool layer | Responsibility |
| --- | --- |
| Image generation / concept tools | Canonical visual references and review sheets |
| Blender | Bespoke modeling, sculpting, topology, hair, clothing, materials, rig preparation, export |
| Optional specialist DCC tools | Focused clothing, hair, texture or animation work when they improve the authored result |
| Blender Python | Repeatable validation, naming checks, package preparation and export automation |
| GoPAL-AI | Asset intake, validation, registry, state, intelligence and runtime orchestration |
| Expo + React Three Fiber + Three.js | Runtime presentation only |

## Production sequence

`Approved Concept → Reference Package → Face Blockout → Full Body → Hair → Clothing → Charm → Materials → Rig → Expressions → Animation → LODs → GLB/glTF → Validation → Human Review → Registry → Runtime`

## Non-negotiable identity rules

1. Cassidy is authored from the approved canonical identity.
2. A generic avatar may not become Cassidy through recoloring, hairstyle replacement or cosmetic edits.
3. The face must remain recognizable before hair, clothing, expression and accessory polish.
4. Eyes, brows and eyelids are independently authored and controllable.
5. Dark chocolate-brown hair remains a stable identity cue across worlds.
6. Emerald Valley, Japanese World and French World alter clothing/material accents, not Cassidy's face, hair identity or core proportions.
7. The charm is a secondary identity cue and never dominates the face.
8. LOD optimization may simplify geometry but may not redefine Cassidy.

## Reference package

The production team must receive the canonical concept plus: hero full body, five canonical views, face close-up, eye close-up, hair reference, base outfit, expression sheet, pose sheet, charm reference and material sheet.

The canonical concept binary is intentionally not fabricated or replaced here. Its existing repository manifest remains the source-of-truth record until the actual approved binary is transferred through a supported asset workflow.

## Face-first gate

Before full production continues, review the neutral face from front and three-quarter views without relying on hairstyle, clothing, accessory or dramatic expression. Reject if the result reads as a generic character.

## Runtime semantic contract

The exported model must use the existing names in `src/characters/cassidyRuntimeModelContract.ts`. This keeps art production and runtime integration reusable and prevents a second mapping system.

Required animations: `idle`, `walk`, `run`, `turn`, `sit`, `talk`, `gesture`, `point`, `celebrate`, `think`, `react`.

Required expressions: `neutral`, `happy`, `curious`, `surprised`, `thoughtful`, `excited`, `concerned`, `playful`.

Required semantic nodes include `Cassidy_Root`, `Cassidy_Body`, `Cassidy_Head`, `Cassidy_Face`, both eyes, both eyelids, both hands, `Cassidy_Charm` and `Cassidy_Hair_Root`.

## Definition of done

A production package is complete only when the existing `CassidyProductionPackage` validator passes, the existing registry records the approved assets, human visual review approves all character gates, and the runtime can load the real GLB/glTF package. Until then, the runtime must keep its existing non-production fallback behavior rather than inventing a fake 3D Cassidy.
