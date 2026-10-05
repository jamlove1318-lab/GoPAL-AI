# GoPAL-AI Remote Unreal Production Bridge

Unreal Engine is intentionally **not copied into this repository**. The repo contains the automation bridge and project-side conventions; the actual engine installation stays on a remote build machine/runner.

This avoids committing a huge engine distribution and avoids making the Expo mobile app depend on Unreal at runtime.

## Runner contract

Configure a remote self-hosted runner with:

```text
UNREAL_ENGINE_ROOT=/path/to/UnrealEngine
```

The bridge expects:

```text
$UNREAL_ENGINE_ROOT/Engine/Build/BatchFiles/RunUAT.sh
```

Then the repository can invoke Unreal AutomationTool for future cooking, packaging, validation, rendering, and automation tasks.

## Planned GoPAL uses

- cinematic/world reference scenes
- environment and lighting experiments
- high-end character/animation prototyping
- automated scene validation
- asset conversion/export experiments

The Expo/React Native application remains the actual mobile runtime.
