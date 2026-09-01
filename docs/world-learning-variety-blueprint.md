# GoPAL-AI — World Learning Variety

## Purpose

This document defines the reusable activity direction for the living-world learning system. It supplements the existing real-location world rather than replacing it.

## Core rule

A location must not imply one fixed lesson format.

Real places remain important for contextual learning. Fictional places add playful, repeatable learning spaces. Residents are one experience type, not the default experience type.

## Experience families

### Real-world contextual
- Resident conversations
- Landmark discoveries
- Shops and markets
- Cafés and restaurants
- Stations and transport
- Museums and cultural spaces
- Streets, parks and gardens
- Festivals and temporary events

### Fictional learning spaces
- Quiz houses
- Quest rooms
- Challenge chambers
- Listening arcades
- Vocabulary gardens
- Mystery rooms
- Dream theatres
- Language workshops
- Memory gardens
- Story studios
- Arcade halls
- Time-limited event arenas

## Reusable mini-game library

The first reusable game family contains:

1. Word Hunt — find target words in a scene.
2. Phrase Builder — arrange words into natural phrases.
3. Listening Chase — follow audio clues.
4. Memory Match — match words, meanings, sounds and objects.
5. Politeness Duel — choose socially appropriate language.
6. Market Rush — handle fast customer requests.
7. Dialogue Detective — infer meaning from conversations.
8. Grammar Garden — repair sentences to grow a world.
9. Culture Clue — investigate cultural evidence.
10. Mystery Room — solve a chain of language puzzles.
11. Speed Round — rapid-fire micro decisions.
12. Story Choice — language decisions alter a branching story.

These are gameplay mechanics, not twelve separate learning engines. The mini-game engine provides reusable session state, scoring, streaks, lives, rounds and recommendation logic. New levels should supply content/configuration to these mechanics instead of duplicating implementations.

## Variety rules

- Never make every fictional location a quiz card.
- A game should have an actual interaction loop when the location calls for one.
- Prefer movement, timing, matching, sorting, investigation, listening, choices and consequences over passive multiple-choice screens.
- Keep games short enough to replay.
- Allow difficulty to scale without rebuilding the game.
- Let the same mechanic appear in different worlds with different art, language, story and cultural context.
- A game may be funny, calm, chaotic, polite, mysterious, competitive-with-self, surprising or story-driven.
- Avoid mechanics that encourage unsafe real-world behavior.
- Never require a resident for an activity unless the activity specifically benefits from a character interaction.

## Physical map rules

Real and fictional places can coexist on the same map.

The map should remain spatial rather than becoming a linear lesson path. Optional activities can be discovered around a destination without forcing the learner through them in sequence.

## Progression rules

- World/destination progression controls access to destinations.
- Physical hotspot progression controls discoveries inside a location.
- Optional games can be completed independently.
- Completing an optional game should not accidentally complete the whole destination.
- Completion must be idempotent and persisted.
- Multi-turn learning must complete only when the full experience completes.

## Future content model

A level should ideally specify:

- location
- experience family
- mini-game mechanic
- target skill
- language content
- difficulty
- rounds/time/lives
- reward
- optional story consequence
- optional memory consequence
- optional world-state change

The mechanic remains reusable; only the content and presentation change.

## Current implementation status

- Real Japan location catalog: active
- Physical hotspot model: active
- Resident experience: active for supported destinations
- Optional activity categories: active
- Reusable mini-game engine: foundation added
- Playable mini-game UI: next implementation stage
- Game content packs per destination: next implementation stage
- Cross-world reuse: next implementation stage
- Final end-to-end verification: still required

## Design goal

The learner should think:

> "I came here to explore, and somehow I learned a language while playing."

not:

> "I opened another lesson screen."
