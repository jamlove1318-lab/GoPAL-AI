# GoPAL Living World Animation Pipeline

## Principle

GoPAL is a living world that happens to contain interfaces. The world runtime owns truth; art tools own presentation.

```text
World state / events / relationships / time / weather
                    |
                    v
        World animation intent
                    |
       +------------+------------+
       |            |            |
    Blender        Spine        Rive
       |            |            |
       +------------+------------+
                    |
              React Native
                    ^
                    |
             Godot world lab
```

Godot is primarily a laboratory and cinematic authoring environment, not a second everyday app runtime. Its successful motion and behavior ideas are translated back into the GoPAL runtime.

## Tool responsibilities

### Blender — 3D character and world production

Use Blender for Cassidy's final 3D character, body/facial rigs, clothing, hair, accessories, creatures, buildings, landmarks, props, and reusable animation clips.

Blender defines the visual quality of motion. GoPAL decides when an animation intent occurs.

Priority clips for Cassidy:

- idle variation and breathing
- gaze/look-at
- turn and attention shift
- walk/stop/turn
- greet/wave
- listen/talk/think
- discover/inspect/react
- celebrate
- sit/stand

### Spine — expressive 2D residents and creatures

Use Spine for lightweight resident populations, villagers, shop/cafe characters, story characters, animals, and other 2D actors where a full 3D asset is unnecessary.

Spine animations should expose the same vocabulary as Blender so residents can participate in the same world events without creating a second behavior engine.

### Rive — interactive micro-world details

Use Rive for small stateful visual objects: magical discoveries, language symbols, signs, rewards, illustrated objects, tiny creatures/mascots, and special interaction moments.

Rive state machines may control presentation state. They must not own world progression, persistence, relationship state, or event scheduling.

### Godot — world laboratory and cinematic authoring

Use Godot to prototype and visually tune:

- camera choreography
- lighting and atmosphere
- weather/day-night experiments
- NPC movement studies
- discovery sequences
- festival/dream/mystery scenes
- destination arrival/departure cinematics

When a prototype is accepted, record the resulting behavior/motion as a reusable design and implement its runtime behavior through the existing GoPAL engines rather than embedding a parallel Godot game runtime in the app.

## Shared contract

`src/engines/world/worldAnimationContract.ts` is the source of truth for cross-tool animation intents. The runtime emits semantic actions such as `discover`, `lookAt`, `walk`, or `talk`. An art adapter maps the intent to its asset and blends it into the appropriate layers.

### Layering

Prefer blended motion over isolated clips:

1. base / idle
2. locomotion
3. posture
4. head
5. gaze
6. face
7. gesture
8. environment
9. effect

A character can therefore breathe while walking, look toward a discovery while speaking, or change posture while maintaining a natural idle cycle.

## Organic motion rules

- Do not synchronize every actor to the same loop.
- Use deterministic per-actor seeds for repeatable but varied ambient timing.
- Prefer anticipation, reaction, and settling over instant state changes.
- Avoid constant bobbing that makes actors feel mechanical.
- Let distance, attention, time of day, weather, activity, and recent events influence presentation.
- Important world events may temporarily override ambient animation, then return through a soft blend.
- Cinematic sequences can temporarily take priority without changing persistent world state.

## Quality gate

An animation integration is not complete because a clip exists. Acceptance requires:

- semantic action is represented in the shared vocabulary;
- correct asset/source is bound;
- layers blend without fighting each other;
- behavior is triggered by real world context rather than a demo-only timer;
- low-priority ambient motion remains varied;
- important events have anticipation/reaction/settling;
- fallback behavior remains available when an external asset is unavailable;
- source-level validation passes;
- human visual review is required for final art claims.
