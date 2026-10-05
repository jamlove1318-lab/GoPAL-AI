# Godot — Living World Laboratory

Godot is the experimental world and cinematic lane for GoPAL. It is deliberately not a second everyday runtime for React Native.

## Use Godot to discover better motion

Prototype and tune:

- camera follow, framing, and cinematic moves
- day/night and lighting studies
- weather and environmental response
- resident movement and navigation studies
- discovery/inspection choreography
- festival, dream, mystery, and story scenes
- destination arrival and departure sequences

The purpose is to answer visual questions quickly: *What should this world feel like? How should the camera move? How should an actor react?*

## Return path to GoPAL

When a Godot experiment is accepted:

1. record the semantic world action and timing/transition intent;
2. identify reusable animation clips or environmental parameters;
3. map the result to `src/engines/world/worldAnimationContract.ts`;
4. implement triggering through existing GoPAL world engines;
5. keep Godot-only prototype logic out of persistent app state.

This prevents Godot from becoming a competing world brain.

## Cinematic rule

Godot can own the authored choreography of a cinematic prototype, while GoPAL still owns the event that starts it and the persistent consequence after it ends.
