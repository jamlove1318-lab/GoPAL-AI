# GoPAL-AI — Batch 5–9 Integration

## Product model (authoritative)

GoPAL-AI has one fictional home world: **Emerald Valley**.

All other top-level worlds are **language worlds**. A language world is named after the language so the learner immediately knows what they are learning, for example **Japanese World** or **French World**. Each language world may contain both real-world locations and fictional learning locations.

The reusable Living World Engine is infrastructure underneath these worlds. It does not replace the language-world architecture.

## Batch 5 — Language-world integration
- [x] Explicit home-vs-language world identity contract.
- [x] Extensible language-world registry.
- [x] Location-to-language-world binding via metadata.
- [x] Emerald Valley remains the special home world.
- [x] Real and fictional locations can share the same physical location contract.
- [x] Physical construction remains reusable across future language worlds.

## Batch 6 — Physical living-world presentation
- [x] Reusable building, terrain, prop, infrastructure, transport, character and gameplay primitives remain canonical.
- [x] Locations are constructed from the shared construction kit rather than one-off renderers.
- [x] Existing richer physical renderer/simulation foundation is preserved.
- [x] Legacy resident/vehicle renderers remain compatibility paths rather than competing state owners.

## Batch 7 — GoPAL learning integration
- [x] Physical buildings map to contextual learning activities.
- [x] School/academy, library, market/shop and café/restaurant contexts are supported.
- [x] Lesson, vocabulary, grammar, conversation, discovery and quest activity contracts exist.
- [x] Learning activities have contextual metadata and XP values.
- [x] Completion is idempotent.
- [x] Learning completion emits canonical world events for existing learning/progress/Cassidy consumers.
- [x] Existing learning engines remain the learning/content authority; the physical layer is an adapter.

## Batch 8 — Games + World Engine
- [x] Reusable arena/challenge/minigame level contract.
- [x] Reuses canonical gameplay objects for spawn/checkpoint/hazard/trigger/puzzle/game-start/game-over/moving-platform primitives.
- [x] Game state supports start/checkpoint/score/completion/failure/replay count.
- [x] Game events are part of the canonical world event bus.
- [x] Game state is serializable and restorable.
- [x] World/game transitions are represented by world events and runtime transitions, not UI-owned state mutation.

## Batch 9 — QA/integration foundation
- [x] Duplicate gameplay event emission removed: gameplay state mutation is event-neutral; the action executor is the canonical interaction event source.
- [x] Quest objective counts are now tracked and persisted.
- [x] Learning/game/quest state is included in runtime snapshots and save data.
- [x] Runtime has save/restore and disposal lifecycle.
- [x] Navigation/build/location integrity validator added.
- [x] Duplicate legacy resident/vehicle paths are retained as compatibility-only paths.
- [x] Runtime owns one simulation/gameplay/quest/learning/game stack per active location.
- [ ] External CI TypeScript result: pending workflow execution/observation.

## Future-language rule
Adding a new language must add a language-world definition and location/content bindings. It must not require a new world engine, renderer, physics system, gameplay engine or navigation system.

## Architectural rule
Do not turn `fantasy`, `sci-fi`, `city`, `forest`, `coastal`, or similar construction archetypes into top-level GoPAL worlds. They are reusable **location styles/archetypes** that may appear inside Emerald Valley or inside any language world when appropriate.
