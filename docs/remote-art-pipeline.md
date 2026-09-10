# GoPAL-AI Remote Art Pipeline

GoPAL-AI remains an Expo/React Native mobile application. Blender and Unreal are **production-side tools**, not mobile runtime dependencies.

## Toolchain

### Blender

Blender is downloaded temporarily by GitHub Actions and executed headlessly. Repository-owned Python scripts live under `tools/blender/`.

Use Blender for:

- Emerald Valley environment assets
- props and landmarks
- animation previews
- scene validation
- deterministic export jobs

### Unreal Engine

The repository contains the Unreal automation bridge under `tools/unreal/`, but not the Unreal Engine distribution itself.

Unreal is kept for optional high-end production work:

- cinematic reference scenes
- lighting/environment experiments
- advanced animation prototyping
- automated cooking/packaging/validation

Actual Unreal execution requires a properly licensed remote/self-hosted runner with `UNREAL_ENGINE_ROOT` configured.

## Important boundary

Do **not** import Unreal or Blender into the Expo runtime. Generated/exported assets should enter the normal GoPAL asset pipeline and existing world/animation architecture.

This keeps the app lightweight and prevents a second runtime/world engine from being introduced.
