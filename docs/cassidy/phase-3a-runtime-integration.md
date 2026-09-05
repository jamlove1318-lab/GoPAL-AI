# Cassidy Phase 3A — Runtime Integration Boundary

The Cassidy runtime now has a reusable visual-resolution layer in `src/characters/cassidyVisualResolver.ts`.

## Responsibility split

### Cassidy engines / state

Own:

- memory
- relationship state
- learning state
- decisions
- world progression
- dialogue/personality
- rewards and progression

### Visual resolver

Owns only the translation from canonical `CassidyCharacterState` + production assets into a renderer-neutral `CassidyVisualCommand`.

### Renderer

Consumes the command and decides how the current platform renders the model.

This keeps the visual system reusable across home, world exploration, lessons, conversation, story scenes and future 3D spaces.

## Production-ready behavior

When the real production package is integrated, the resolver returns:

- the production model URI
- requested LOD0/LOD1/LOD2 tier
- canonical expression
- canonical animation
- resolved world outfit
- rig/texture/animation versions
- natural eye/gaze enabled
- hair/accessory secondary motion enabled

Until that package is genuinely integrated, the resolver deliberately returns `fallback` rather than pretending a 3D model exists.

## World outfit rule

If the state uses the generic `base` outfit, the resolver derives the visual variant from the world:

- Emerald Valley -> `emerald-valley`
- Japanese World -> `japanese-world`
- French World -> `french-world`
- unknown/neutral -> `base`

Explicit outfit choices always win. This allows one Cassidy identity to travel between worlds without duplicating character implementations.

## Integration sequence

`Cassidy State -> resolveCassidyVisual() -> Renderer Adapter -> Production Model`

The future renderer adapter should be the only layer that knows whether the project is using a particular 3D renderer, scene implementation, asset loader, or platform-specific optimization.

Do not put renderer imports into Cassidy engines or the visual resolver.

## Current gate

The software boundary is ready. The visual runtime remains in fallback mode because the real canonical 3D model, rig, textures and animations have not yet been delivered and validated.
