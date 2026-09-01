# GoPAL-AI World Integration & Learning Variety Progress

> Working branch: `world-integration-work`
>
> `main` is intentionally kept build-stable while this batch is developed.
>
## Product rule

GoPAL-AI is a living learning world. Real locations remain the foundation, while fictional locations are allowed to provide learning variety. A resident encounter is one experience type, not the default for every lesson.

The blueprint is a source of ideas only. Existing project systems and the current world design take priority.

## Completed in this working batch

### World / hotspot contracts
- [x] Hotspot scenario IDs resolve to real learning scenarios.
- [x] Tokyo/Shibuya place alias is reconciled.
- [x] Hotspot completion state is scoped to its physical place.
- [x] Reveal engine exposes canonical completion progress.
- [x] Unknown hotspot completion is rejected instead of silently corrupting progress.
- [x] Optional activities are not inserted into the physical linear discovery chain.
- [x] Locked discoveries remain visible but disabled, preserving mystery.
- [x] Generic exploration no longer automatically forces a resident encounter.

### Resident / learning loop
- [x] Existing visual resident lifecycle is connected to the scene.
- [x] Learner response events reach the world scene animation runtime.
- [x] Resident success/confusion reactions can be driven by learning responses.
- [x] Multi-turn resident scenarios no longer complete the world discovery on an intermediate turn.
- [x] Incorrect answers no longer run the full world-completion consequence flow.
- [x] Resident completion returns the learner to the same world location.
- [x] Missing Osaka/Fukuoka resident data is handled gracefully instead of rendering an empty resident encounter.

### Learning variety foundation
- [x] Hotspot model supports `quiz`, `quest`, `challenge`, and `special` activity locations.
- [x] Activity experience resolver supports those modes.
- [x] Optional fictional learning locations have been added to the Japan maps.
- [x] Optional activity locations can be visible without becoming forced route steps.
- [x] Activity modal reuses existing learning scenario content and capability tracking.
- [x] Activity completion can complete the physical activity hotspot without completing the parent destination.

## Current Japan coverage

| Destination | Real route | Resident | Linked learning | Variety places | Status |
|---|---:|---:|---:|---:|---|
| Kyoto / Gion | Yes | Yes | Yes | Quiz / Quest / Challenge / Special | Integration pass |
| Tokyo / Shibuya | Yes | Yes | Yes | Quiz / Quest / Challenge / Special | Integration pass |
| Kanazawa | Yes | Existing data | Yes | Quiz / Quest / Challenge / Special | Verify resident |
| Osaka / Dotonbori | Yes | Missing resident data | Existing fallback content only | Quiz / Quest / Challenge / Special | Needs native Osaka content |
| Fukuoka / Hakata | Yes | Missing resident data | Existing fallback content only | Quiz / Quest / Challenge / Special | Needs native Fukuoka content |

## Important limitation

The first variety layer intentionally reuses existing Japanese learning scenarios rather than inventing a large new content database. This proves the world-activity architecture without duplicating content systems.

Future work should add activity-specific content only when it improves the experience and after checking for reusable existing engines/content.

## Next verification pass

- [ ] Verify hotspot completion after resident multi-turn completion.
- [ ] Verify optional activity completion and reveal state after returning to the map.
- [ ] Verify persistence/reload for world, destination, hotspot, and activity progress.
- [ ] Verify rewards, memory, relationship, Cassidy, and world consequences are triggered exactly once on final completion.
- [ ] Verify every Japan destination has a valid environment, arrival, continuity, departure, hotspot, and learning contract.
- [ ] Verify non-Japan worlds use the same contracts without assuming Japan-specific IDs.
- [ ] Check for duplicate runtime paths that can mutate or disagree with world state.
- [ ] Run TypeScript/build validation before merging to `main`.

## Planned variety expansion after verification

### Fictional location families
1. **Quiz Houses** — short contextual quizzes and review.
2. **Quest Rooms** — multi-step missions with language objectives.
3. **Challenge Chambers** — focused listening, reading, grammar, or vocabulary tests.
4. **Special Levels** — harder, unusual, or time/event-based learning.
5. **Dream Locations** — optional experimental learning moments.
6. **Memory Gardens** — review through previously learned words and discoveries.
7. **Language Arcades** — playful mini-games once existing game/quiz engines are verified.
8. **Festival Arenas** — temporary cultural learning events.

### Design rule for every new place

A new location must answer:

- Why does this place exist in the world?
- What kind of learning happens here?
- Why is it more fun or useful than a normal lesson?
- Which existing engine/content can power it?
- What changes in the world after completion?
- Is it optional, discoverable, quest-gated, event-gated, or permanent?

No fictional place should become a disguised duplicate of the resident lesson flow.
