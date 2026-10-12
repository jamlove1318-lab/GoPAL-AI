# Cassidy Phase 3E — Renderer Host

## Status

Phase 3E establishes the first real runtime presentation boundary for Cassidy on the current Expo SDK 57 / React Native 0.86 stack.

The repository now contains:

- `src/characters/cassidyRendererController.ts` — reusable renderer lifecycle and synchronization controller.
- `src/characters/cassidyRuntimeModelContract.ts` — stable semantic names shared by the art export and runtime.
- `src/characters/Cassidy3DScene.tsx` — React Three Fiber native presentation host for a validated production GLB.
- Metro support for `.glb` and `.gltf` assets.
- Expo GL + React Three Fiber + Three.js dependencies.

## Renderer decision

The project uses React Three Fiber on React Native with Expo GL as the mobile WebGL foundation. R3F's React Native installation path explicitly uses `expo-gl` for WebGL2 bindings and documents `.glb` / `.gltf` Metro asset configuration. Expo's SDK 57 documentation also exposes `GLView` as the low-level OpenGL ES surface for 2D/3D rendering.

`expo-three` is deliberately not the new application boundary. The project should avoid coupling Cassidy to an older renderer wrapper when the application can use the supported R3F native path directly.

## Ownership

```text
Cassidy engines
      ↓
Cassidy Character State
      ↓
Cassidy Visual Resolver
      ↓
Cassidy Visual Command
      ↓
Renderer Host / Controller
      ↓
React Three Fiber
      ↓
Three.js / Expo GL
      ↓
Cassidy Production GLB
```

The renderer never decides personality, memory, learning, relationships, dialogue, quests, world logic, or rewards.

## Runtime model naming contract

The production artist can use any internal topology and rig implementation, but the exported semantic controls must remain stable:

- Root: `Cassidy_Root`
- Body: `Cassidy_Body`
- Head: `Cassidy_Head`
- Face: `Cassidy_Face`
- Eyes: `Cassidy_Eye_L`, `Cassidy_Eye_R`
- Eyelids: `Cassidy_Eyelid_L`, `Cassidy_Eyelid_R`
- Hands: `Cassidy_Hand_L`, `Cassidy_Hand_R`
- Charm: `Cassidy_Charm`
- Hair root: `Cassidy_Hair_Root`

Expression morph targets:

- `expression_neutral`
- `expression_happy`
- `expression_curious`
- `expression_surprised`
- `expression_thoughtful`
- `expression_excited`
- `expression_concerned`
- `expression_playful`

Animation clips use the exact existing Cassidy animation names: `idle`, `walk`, `run`, `turn`, `sit`, `talk`, `gesture`, `point`, `celebrate`, `think`, `react`.

This contract is intentionally semantic. The art pipeline is not forced into a generic avatar skeleton; the final Cassidy rig is still bespoke.

## Current 3D host behavior

`Cassidy3DScene`:

1. Receives a fully resolved `CassidyVisualCommand`.
2. Renders only when a production model URI exists and the resolver has selected a non-fallback tier.
3. Loads the GLB through Three.js `GLTFLoader`.
4. Creates an animation mixer and transitions between the named Cassidy animation clips.
5. Applies the selected expression morph target.
6. Updates the animation mixer every frame.
7. Cleans up the mixer on unmount.
8. Leaves the existing fallback presentation responsible for the pre-production state.

There is intentionally no fake Cassidy geometry in this host. Until the bespoke production GLB is delivered and registered, the runtime cannot claim that Cassidy's 3D identity is complete.

## Controller behavior

`CassidyRendererController` is independent of React and Three.js. It provides a reusable lifecycle for any future renderer adapter:

- mount
- sync state → visual command → renderer
- serialized async operations
- generation guards against stale operations
- unmount/resource release
- optional renderer metrics

This keeps renderer lifecycle logic reusable instead of creating a new state-to-render pipeline for every world or screen.

## Asset loading rule

Production assets should be bundled or otherwise delivered through the validated Cassidy production package. The visual resolver remains the source of truth for whether production rendering is allowed.

A URI alone is not sufficient to declare Cassidy production-ready. The production registry, model/rig/animation versions, validation package, and human visual gates must all remain authoritative.

## Quality gate

Phase 3E is a software integration slice, not approval of the final character art.

The final Cassidy 3D package is still required to pass:

- canonical identity review
- five-view consistency
- face and eye review
- hair identity review
- body/clothing review
- charm review
- eight-expression review
- eleven-animation review
- eye/gaze review
- secondary-motion review
- world consistency review
- mobile LOD/readability review
- machine package validation
- runtime performance validation

## Next slice

The next implementation step is the **production GLB integration gate**:

1. receive the bespoke Cassidy GLB + textures + rig + animations;
2. validate it against `cassidyProductionAssetContract.ts` and `cassidyRuntimeModelContract.ts`;
3. register only validated assets in `cassidyProductionAssetRegistry.ts`;
4. exercise the real model through `Cassidy3DScene`;
5. add gaze and secondary-motion runtime controls against the final rig names;
6. measure mobile frame time, draw calls, triangles, texture/model memory and load time;
7. complete human visual review before marking the package integrated.

No generic marketplace avatar or recolored template becomes Cassidy through this process.
