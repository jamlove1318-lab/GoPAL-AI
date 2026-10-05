# Cassidy Phase 3B — Renderer Contract

## Purpose

Phase 3B establishes the reusable boundary between Cassidy's existing character/engine state and a concrete 3D renderer.

The renderer is deliberately not selected or embedded in the domain layer yet. GoPAL-AI currently targets Expo SDK 57 / React Native 0.86, and Expo provides `expo-gl` as a low-level OpenGL ES surface suitable for 2D/3D rendering. A high-level renderer will be introduced only after its compatibility and mobile performance are proven.

## Runtime boundary

```text
Cassidy Brain / Context / Relationship / Learning
                    |
                    v
          Cassidy Character State
                    |
                    v
          Cassidy Visual Resolver
                    |
                    v
       CassidyVisualCommand
                    |
                    v
       CassidyRendererAdapter
                    |
                    v
       Concrete 3D Renderer
                    |
                    v
      GLB + materials + rig + animation
```

### Ownership rules

- Engines own intelligence and domain state.
- `cassidyCharacterDesign.ts` owns the canonical runtime character types.
- `cassidyVisualResolver.ts` converts state into renderer-neutral visual intent.
- `cassidyRendererContract.ts` defines the reusable renderer boundary.
- A concrete renderer owns GPU resources, scene objects, frame timing and asset loading.
- The renderer must never decide Cassidy's personality, relationship, learning outcome, memory or world logic.
- The existing fallback renderer remains available until a validated production asset is integrated.

## Required production capabilities

A production Cassidy renderer must support:

- GLB/glTF model loading
- animation playback and switching
- authored facial expressions
- independent eye/gaze control
- hair and signature-accessory secondary motion
- LOD selection
- clean mount/unmount and GPU resource disposal
- measurable frame and asset-loading performance

## Asset rule

The renderer must consume the production package described by the Cassidy production asset contract. It must never silently substitute an unrelated model or invent a fake Cassidy model when the production asset is unavailable.

## Integration gate

The renderer can be promoted beyond proof-of-concept only when:

1. the canonical Cassidy identity remains recognizable from the required views;
2. model, rig and animation versions are integrated and validated;
3. all eight expressions are usable;
4. all eleven required animations are usable;
5. eye/gaze controls work independently from head rotation;
6. hair and accessory secondary motion are stable;
7. LOD transitions preserve identity;
8. resources are released correctly on unmount;
9. mobile performance is measured on representative hardware;
10. the renderer remains isolated behind `CassidyRendererAdapter`.

## Next implementation slice

The next code change should be a renderer-host/proof-of-concept surface that consumes `CassidyVisualCommand` through `CassidyRendererAdapter`. It should not yet modify World, Study, Cassidy Brain or relationship engines.

Once the renderer stack is selected and installed, the proof-of-concept should use a real production GLB. Until that asset exists, the adapter may be exercised with lifecycle and contract tests, but no fake 3D Cassidy should be marked production-ready.
