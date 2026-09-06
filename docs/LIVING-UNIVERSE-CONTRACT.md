# Living Universe Contract

## Purpose

GoPAL-AI is a living universe. The application surface is a physical world, not a dashboard or collection of presentation blocks.

## Canonical hierarchy

`Universe → World → Location → Terrain / Infrastructure → Buildings / Objects → Residents / Vehicles → Environment → Interaction → Learning / Quests / Stories → Discovery / Progression → Persistence → Cassidy`

## World classes

- **Home worlds:** persistent personal worlds such as Emerald Valley.
- **Language worlds:** living worlds containing real and fictional learning locations, such as Japanese World and French World.
- **Fictional worlds:** future worlds that can be registered without changing the renderer architecture.

## Renderer contract

1. The renderer consumes canonical world/location data.
2. The renderer never invents a parallel world catalog.
3. Terrain, buildings, infrastructure, residents, vehicles, environment, and ambient life are world entities.
4. Learning, quests, stories, discoveries, and consequences are expressed through physical world interactions whenever possible.
5. Cassidy is a world resident and adapts to the current world/location.
6. World travel happens through spatial entrances, transport, and world navigation—not a presentation menu.
7. UI is limited to controls, accessibility, system feedback, and interaction surfaces that cannot reasonably exist in the physical world.
8. No dashboard-style presentation layer may become a dependency of the world runtime.

## Preservation rule

Existing engines remain reusable. Removing an old presentation path must never remove the domain engine underneath it. Legacy presentation can be archived or deprecated after dependency verification.

## Quality gate

A world change is complete only when:

- canonical data is the source of truth;
- the active world surface renders from that data;
- simulation ticks and produces observable life;
- interactions route through the world runtime/event system;
- location/world identity is not hardcoded in presentation;
- real-vs-fictional location semantics remain intact;
- persistence can serialize the world runtime state;
- Cassidy receives the current world context;
- TypeScript validation passes in CI.

## Anti-regression rule

Do not reintroduce dashboard navigation, status panels, progress blocks, destination menus, or similar presentation structures into the world surface as a substitute for missing world mechanics. Build the missing world mechanic instead.
