# World Learning Variety — Implementation Track

The world uses reusable mechanics plus world-specific content. A mechanic must not contain Japan-specific assumptions.

## Primitive layer

Current reusable primitives include:

- spatial distance and proximity
- rectangle/object hit testing
- nearest-object targeting
- ordered sequence validation
- selection toggling
- score calculation
- bounded activity progression
- movement toward a target
- reusable content-pack creation/localization

## Mechanic layer

The mechanic layer wraps primitives into stateful interactions:

- object selection
- placement/construction targets
- sequence following
- spatial movement

These are deliberately independent of a specific world, destination or character.

## Content layer

`worldActivityContent.ts` defines content packs with:

- world ID
- physical place ID
- language
- title/prompt
- item content
- optional answer/sequence
- extensible metadata

This lets the same mechanic receive different content for Japan, France, Mexico, Korea or fictional locations.

## Next playable mechanics

1. drag/drop sorting
2. object inspection and clue collection
3. multi-step clue chains
4. audio-following navigation
5. construction/crafting placement
6. branching story state
7. rhythm/timing interaction
8. inventory combination

Each should be implemented as a reusable mechanic before multiple world content packs are added.

## Guardrails

- Do not create a Japan-only mini-game implementation when a generic mechanic is possible.
- Do not turn every activity into a multiple-choice question.
- Do not couple mini-game completion to destination completion.
- Do not grant world consequences from the presentation layer.
- Do not duplicate the existing mini-game session/selection engine.
