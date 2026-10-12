# Cassidy 2D Runtime Asset Pack Specification

Status: **production intake boundary — no final artwork registered yet**

## Purpose

This document defines the deterministic handoff between Cassidy's authored 2D artwork and the GoPAL-AI runtime. The app must consume an approved runtime pack; it must never synthesize a final Cassidy from procedural SVG, generic avatars, or an unreviewed image.

## Source of truth

- Character identity: `cassidy-character-reference.md`
- Production contract: `src/features/world/data/cassidy2dProductionContract.ts`
- Runtime renderer bridge: `src/features/world/data/cassidy2dProductionRuntime.ts`
- Renderer boundary: `src/components/Cassidy2DProductionRenderer.tsx`

## Required master

The artist delivers one high-resolution master source at **minimum 2000 × 3000 px**. Higher resolution is preferred when the source and authoring workflow support it.

The master must preserve Cassidy's locked identity: face and eyes, dark chocolate hair and signature side braid, emerald vest/hood outfit, brown leather accessories, tall brown boots, and Leaf-Star Compass Charm.

## Semantic layers

The runtime pack must expose these semantic layers:

`head`, `ears`, `neck`, `eyes`, `eyelids`, `eyebrows`, `nose`, `mouth`, `hair-back`, `hair-side`, `hair-front`, `braid`, `torso`, `blouse`, `vest`, `hood`, `left-arm`, `right-arm`, `left-hand`, `right-hand`, `belt`, `pouches`, `satchel`, `left-leg`, `right-leg`, `left-boot`, `right-boot`, `charm-chain`, `charm`, `charm-glow`.

Hidden paint/extensions behind joints, hair, clothing, hands, and the satchel should be retained wherever needed for deformation and clean animation.

## Expressions

`neutral`, `happy`, `curious`, `excited`, `surprised`, `thoughtful`, `playful`, `concerned`, `gentle`.

Eyes must support independent gaze and natural blinking. Mouth/face controls must support convincing speech rather than a single scale-flap.

## Animation set

`idle-breath`, `walk`, `run`, `talk`, `think`, `celebrate`, `greeting`, `explaining`, `listening`, `encouraging`.

Secondary motion should include hair, braid, clothing, straps/satchel, body weight shifts, and charm movement. The charm must have visually distinct glow states:

`normal`, `curious`, `learning`, `discovery`, `important`, `celebration`, `memory`.

## Runtime package

The approved pack must provide:

- stable pack ID: `cassidy-canonical-2d`
- contract version
- canonical identity version
- source provenance
- runtime asset version
- master resolution metadata
- semantic layer IDs
- expression IDs
- animation IDs
- charm-state IDs
- deterministic renderer registration
- human approval state

The repository contract is intentionally format-agnostic. Spine, Live2D, Rive, or another suitable authored 2D runtime may be used upstream, provided its exported runtime data can satisfy this contract without changing Cassidy's identity.

## Quality gates

A pack is not production-ready until all of the following are true:

1. Canonical identity review passes.
2. All semantic layers exist and deform cleanly.
3. Facial controls produce natural eyes, expressions, and speech.
4. Body animation passes deformation and motion review.
5. Secondary motion is coherent.
6. All charm states are visually distinct and tasteful.
7. Runtime export is deterministic and versioned.
8. Provenance/licensing is recorded.
9. Human visual approval is explicitly recorded.

## Forbidden production shortcuts

- Procedural SVG Cassidy as final art.
- Generic avatar generators.
- Flattened portrait presented as an animation system.
- Unreviewed AI-generated character sheets.
- Image-to-video output used as the rig.
- Mixing incompatible Cassidy designs.
- Registering placeholder assets to make the runtime report `ready`.

Until an approved pack exists, the production renderer must remain fail-closed. Development may use the legacy approximation solely to exercise world logic.
