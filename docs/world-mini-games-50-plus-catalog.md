# GoPAL-AI — 50+ Reusable World Mini-Games

## Purpose
A reusable gameplay library for language learning inside real and fictional world locations. Mini-games are mechanics, not one-off screens. Content, language, setting, art, story, difficulty, timing and rewards are data-driven.

## Design Rules
- Never turn the world into a linear Duolingo-style path.
- Real locations remain important and can host contextual learning.
- Fictional locations provide variety: games, quests, special levels, experiments and events.
- A resident is one learning mode, not the default learning mode.
- Avoid repeating the same mechanic too soon; selection should consider recent history, skill needs, location, difficulty and novelty.
- Reuse mechanics across every language world.
- Games must teach something measurable while still feeling like games.
- No game should require dangerous real-world behavior.

## Core 60-game library

### Discovery / Search
1. Word Hunt — find target-language words hidden in the scene.
2. Object Snap — identify the correct word for moving objects.
3. Sign Spotter — read signs and select the useful meaning.
4. Hidden Phrase — uncover fragments of a phrase around a location.
5. Culture Clue Hunt — connect cultural objects to language clues.
6. Memory Trail — remember locations and the words found there.
7. Lost Label — restore missing labels on world objects.
8. Sound Scout — locate the source of a spoken/audio clue.

### Building / Puzzles
9. Phrase Builder — assemble a natural sentence.
10. Grammar Garden — repair language to grow plants.
11. Sentence Machine — place words into correct grammatical slots.
12. Particle Puzzle — choose and position particles.
13. Verb Workshop — transform verbs for the situation.
14. Word Forge — combine roots/parts into valid words.
15. Kanji Tile Forge — construct/read kanji compounds.
16. Translation Tangle — untangle a mixed translation.
17. Context Lock — unlock a door using contextual language.
18. Logic Lanterns — light lanterns in the correct language order.

### Arcade / Reflex
19. Speed Round — rapid vocabulary decisions.
20. Falling Words — catch correct words and avoid distractors.
21. Word Dash — choose the correct lane while moving.
22. Listening Chase — follow an audio instruction before time expires.
23. Quick Reply — select the best conversational response quickly.
24. Flash Recall — rapidly recall meaning from a visual cue.
25. Match Rush — pair words under a countdown.
26. Sound Catcher — catch the spoken word that matches the target.
27. Grammar Dodge — avoid incorrect sentence obstacles.
28. Vocabulary Meteor — destroy the meteor carrying the requested meaning.

### Social / Communication
29. Politeness Duel — choose socially appropriate language.
30. Dialogue Detective — infer what someone means.
31. Market Rush — handle changing customer requests.
32. Café Order — listen, remember and place an order.
33. Train Counter — buy/ask for the right ticket.
34. Neighbor Favor — understand a request and respond naturally.
35. Lost Tourist — give or understand directions.
36. Message Relay — remember and pass a spoken message.
37. Emotion Reader — match tone/emotion with appropriate language.
38. Conversation Repair — repair awkward or incorrect dialogue.

### Listening / Audio
39. Echo Station — identify repeated sounds/phrases.
40. Audio Map — follow spoken directions through a map.
41. Voice Match — match a speaker's phrase to a situation.
42. Missing Word Radio — fill gaps in short audio.
43. Street Noise — separate useful language from ambient distractions.
44. Rhythm Repeat — select the phrase matching speech rhythm.
45. Announcement Alert — understand a public announcement.
46. Whisper Trail — follow quiet clues through a fictional area.

### Story / Adventure
47. Mystery Room — solve a chain of language puzzles.
48. Story Choice — language choices change a branching story.
49. Detective Case — solve a small mystery from clues.
50. Treasure Map — decode clues to find a destination.
51. Festival Prep — complete varied language tasks to prepare an event.
52. Time Traveler — use language clues to navigate different eras.
53. Dream Theatre — act through surreal language scenes.
54. Secret Agent — decode harmless messages and identify the next objective.
55. Escape the Archive — solve language locks to leave a fictional archive.
56. Lantern Mystery — investigate a night-time fictional mystery.

### Creative / Construction
57. Sign Designer — construct a useful sign from language pieces.
58. Story Composer — arrange scenes and phrases into a coherent story.
59. Recipe Creator — sequence ingredients/instructions using target language.
60. World Builder — use correct language commands to construct a small scene.

## Variety Selection
The game selector should maintain a recent-mechanics history and avoid repeating a mechanic until enough other suitable mechanics have been used. It should also avoid repeated visual presentation patterns. For example, three different games should not all become stacked cards with four buttons.

Selection inputs:
- target language
- skill weakness
- current world/place
- hotspot kind
- difficulty
- learner history
- recently played mechanics
- story/event context
- available audio/art assets
- novelty score
- session length

## Location Families
Real places can host contextual games. Fictional places can specialize in unusual mechanics.

Examples:
- Kyoto street: Sign Spotter, Café Order, Culture Clue Hunt.
- Osaka market: Market Rush, Falling Words, Conversation Repair.
- Tokyo station: Announcement Alert, Train Counter, Audio Map.
- Kanazawa craft district: Object Snap, Sign Designer, Story Composer.
- Fukuoka night market: Quick Reply, Sound Catcher, Recipe Creator.
- Fictional Language Arcade: Word Dash, Vocabulary Meteor, Match Rush.
- Fictional Mystery House: Mystery Room, Detective Case, Context Lock.
- Fictional Dream Theatre: Dream Theatre, Story Composer, Emotion Reader.
- Fictional Grammar Garden: Grammar Garden, Verb Workshop, Particle Puzzle.
- Fictional Archive: Escape the Archive, Hidden Phrase, Translation Tangle.

## Implementation Strategy
1. Keep `worldMiniGameEngine` as the mechanic/session authority.
2. Represent each game as a reusable mechanic definition.
3. Build generic interaction primitives only where they genuinely generalize.
4. Keep game content separate from mechanics.
5. Let locations reference a game pool rather than hard-code UI.
6. Record completion and recent mechanics through the existing progression/persistence infrastructure.
7. Add audio, animation and environmental reactions through existing world systems.
8. Validate every game against measurable language outcomes.

## Current Status
- Core world activity types: quiz, quest, challenge, special — foundation exists.
- Reusable mini-game engine: foundation exists.
- 60-game design catalog: documented.
- Actual playable implementations: next phase.
- Variety selector: next phase.
- World-reactive game outcomes: next phase.
- Cross-language reuse: next phase.
