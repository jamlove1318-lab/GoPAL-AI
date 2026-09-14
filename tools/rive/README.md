# Rive — Interactive Micro-World Animation

Rive is GoPAL's lane for small interactive visual moments rather than the primary world renderer.

Good candidates:

- magical discoveries
- language symbols and glyphs
- signs and illustrated objects
- reward flourishes
- tiny creatures or mascots
- special story illustrations
- small controls where motion communicates state

## Boundary

Rive may own local visual state machines, interpolation, and transitions.

Rive must not own:

- world progression
- persistent discoveries
- relationships
- actor schedules
- encounter selection
- weather/time truth
- cross-screen navigation

Those remain in GoPAL's existing engines.

## Shared vocabulary

A Rive state machine should be driven by semantic intents from `src/engines/world/worldAnimationContract.ts`. For example, `discover` can enter a reveal state, while `celebrate` can trigger a short visual flourish.

## Performance rule

Use Rive where a small stateful animation gives more life than React Native primitives. Do not turn ordinary world rendering into a collection of Rive scenes.
