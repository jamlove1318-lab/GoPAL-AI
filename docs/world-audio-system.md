# GoPAL Living World Audio

GoPAL audio is part of the living-world runtime, not a screen-level sound-effects layer.

## Principles

- One canonical `WorldAudioEngine`; no second audio brain.
- Locations own acoustic identity through `WorldAudioLocationProfile`.
- World events request semantic cues; the renderer decides how the actual audio asset is played.
- Audio should feel present without becoming noisy or tiring.
- No permanent full-volume loops and no constant crowd/vehicle spam.
- Distance, location, weather, time, movement, activity and special moments influence the mix.
- Audio assets remain separate from code and must have verified provenance/licensing before runtime promotion.

## Runtime flow

```text
Living World Runtime
        |
        +--> location / time / weather / movement
        +--> residents / vehicles / interactions / world events
                         |
                         v
                WorldAudioEngine
                         |
             semantic cue + mix decision
                         |
                         v
                Audio Runtime Host
                         |
                 expo-audio playback
```

`WorldAudioEngine` is intentionally platform-neutral. `expo-audio` is the playback layer for the Expo/RN application. This keeps world logic independent from the native player implementation.

## SoftMix rules

The default mix intentionally leaves headroom:

- master: 0.72
- music: 0.34
- ambience: 0.28
- location: 0.24
- activity: 0.18
- transport: 0.20
- interaction: 0.24
- event: 0.30
- voice: 0.46

These are runtime gain ceilings, not mastering specifications. Final assets still need listening tests on real mobile speakers and headphones.

### Density control

The engine applies cooldowns and a maximum active one-shot budget. Repeated footsteps, cars, trains, doors and crowd cues therefore do not stack into an exhausting wall of sound.

### Spatial behavior

World-positioned cues use distance attenuation. A distant train can be sensed as part of the place, while a nearby door or interaction becomes clearer. The implementation deliberately uses a cheap mobile-friendly attenuation curve first; more advanced occlusion can be added later without changing the semantic contract.

### Music continuity

Location changes should crossfade musical states rather than restart tracks from zero. Special world moments can temporarily reduce ambience and introduce a short motif, then return to the previous acoustic state.

## Location identities

Profiles currently cover Emerald Valley, Train Station, Café, Library, Forest, Airport, Study Room, Night Streets and Festival.

A train station, for example, can contain soft platform air, distant rail movement, occasional footsteps, muffled crowd presence, gentle door sounds and sparse arrival/departure cues. None of those layers should be continuously loud.

## Asset pipeline

Audio follows the same evidence-first philosophy as world visual assets:

```text
source -> license/provenance -> acquisition -> normalization
       -> optimization -> mobile validation -> human listening approval
       -> runtime promotion
```

Do not commit unlicensed recordings or assume a filename proves provenance. Keep source assets and runtime-ready assets distinct.

## Future extension points

- weather-specific layers
- indoor/outdoor portal crossfades
- acoustic zone transitions
- lightweight reverb presets
- persistent location sound memories
- world-event motifs
- per-world musical identities
- audio accessibility controls

No UI is required for the core system. Settings can expose only essential user controls later, while the world itself remains the primary presentation.
