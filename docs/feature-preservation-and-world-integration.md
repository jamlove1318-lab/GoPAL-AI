# GoPAL Feature Preservation + World Integration Contract

Status: active
Branch baseline: `world-first-shell-next4`

## Rule

GoPAL is being converted into a living, world-first learning application, but the world refactor is **not permission to throw away previously built product ideas**.

Every existing feature should be classified before removal:

1. **Keep + integrate** — improves the living-world experience.
2. **Keep but reshape** — valuable feature, wrong presentation or old navigation.
3. **Keep dormant** — valuable foundation, not ready for the current slice.
4. **Remove only with evidence** — redundant, harmful to UX, technically unsafe, or clearly weaker than the world-first replacement.

No feature is removed merely because it is not visible in the current Home/Explore flow.

## Features already known to preserve

### Passport / travel identity

The previously designed **Passport** concept is explicitly protected. It should become a living travel/learning record rather than a conventional dashboard card:

- countries/regions discovered
- language/culture encounters
- stamps or memories earned through actual world experiences
- places visited in GoPAL's world
- milestones, quests and discoveries
- optional collectible visual artifacts

Passport data should connect to the same world/travel state rather than creating a second progression system.

### Cassidy companion

Cassidy remains the persistent companion identity. Her relationship and memories grow from shared experiences; the world should provide the events that create those memories.

### Learning path / map / lessons

The hidden learning-path architecture remains valuable. The target is:

`Home/World -> Choose World -> Learning Map -> Lesson -> Reward -> Next Node`

Lessons should be destinations/experiences in the world, not a detached flat list when a world representation is useful.

### Tutor / AI conversation

Tutor remains a major learning surface. It should become context-aware of the current place, lesson, quest, discovery and Cassidy state instead of being isolated from the world.

### Progress systems

XP, streaks, hearts and related progress systems should converge into the existing authoritative progression/runtime state. Do not create parallel counters just to support a new screen.

### Travel / world discovery

Travel is a gateway into the world. It should eventually connect Passport, cultures, places, quests, language encounters and discovery memories.

### Study Room / Study Scene / StudyScreen

These remain valid as intimate learning spaces inside the world. They should use the environment, atmosphere, objects and Cassidy systems rather than becoming generic UI panels.

### Living-world systems

Preserve and extend:

- time/day-night
- weather/environment
- seasons/festivals
- ambient audio/lighting
- NPC routines
- building/location interactions
- world events
- discovery notebook / memories
- quests and hidden encounters
- language/culture visualization

### Existing visual/animation systems

Extend the current motion systems instead of creating another animation brain:

- `LivingWorldVisualLayer`
- `LivingWorldViewport`
- `LivingPlayerLayer`
- `LivingSimulationActorLayer`
- `LivingLandmarkLayer`
- `LivingValleyScreen`
- the shared semantic world animation contract

Blender, Spine, Rive and Godot are production/lab tools feeding the world runtime; they are not four competing runtime brains.

## Product ideas that should be checked before removal

The broader GoPAL vision includes concepts such as Living Memories, Cultural Echoes, Hidden Mentor encounters, Discovery Notebook, Language Aura, Living Festivals, AI Dreaming, Parallel Lives, Book That Writes Itself, Emotional Vocabulary, Language Museums, Living Globe, Letters From Future Self, Memory Paintings, Wonder Events, Ancient Language Mysteries and evolving Personal Theme Music.

These are not all required in the first playable slice. They should remain in the product/design inventory and be promoted when they strengthen learning, exploration or emotional continuity.

## World-first presentation rule

Avoid turning these features into rows of cards or dashboard blocks. Prefer:

- places
- objects
- NPC interactions
- maps
- journals/passports
- physical rooms
- environmental events
- contextual overlays only when necessary

The app should feel like a living place that contains its features, not a collection of UI panels.

## Removal gate

Before deleting an existing feature, record:

- what it currently does
- where it is implemented
- what world feature replaces it, if any
- whether user value is preserved
- whether state/data migration is required
- why keeping it would make GoPAL worse

Only then remove it.

## Current implementation priority

1. Acquire and normalize the best reusable art assets.
2. Keep the world runtime authoritative.
3. Bring the existing product features back into the world navigation and context model.
4. Connect Passport/travel/discovery/progression rather than duplicating them.
5. Only then prune features that demonstrably weaken the product.
