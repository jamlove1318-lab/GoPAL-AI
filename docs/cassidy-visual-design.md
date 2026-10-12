# Cassidy Visual Design Bible

## Core identity
Cassidy is GoPAL-AI's living world companion: recognizable at a glance, expressive without becoming cartoon-noisy, and visually consistent across Emerald Valley and every language world.

## Visual language
- Stylized full-body companion with stable proportions.
- Friendly three-quarter readability with a strong head/face silhouette.
- Large expressive eyes, authored brows, layered hair and a clear mouth shape.
- Soft environmental glow communicates presence rather than turning Cassidy into a UI sticker.
- Motion should feel alive: breathing, blinking, weight shifts, hair sway and small idle gestures.
- The same character identity persists across locations; world outfits and lighting may change, but anatomy and face do not.

## Signature silhouette
1. Distinctive layered hairstyle.
2. Clear face/eye spacing visible at small sizes.
3. Signature companion outfit language.
4. Clean hands, feet and grounded stance.
5. Small floating environmental aura used sparingly.

## World-aware appearance
### Emerald Valley
Living emerald light, warm natural accents, familiar home outfit. Cassidy feels most at home here.

### Japanese World
Soft sakura/lantern-inspired accents, subtle rose/magenta clothing variation and warm night-market lighting. Avoid costume caricature.

### French World
Soft violet/café-light accents, restrained indigo clothing variation and elegant environmental highlights. Avoid stereotypical costume styling.

## Expression system
Canonical expressions: neutral, happy, curious, surprised, thoughtful, excited, concerned, playful.

Expressions are combinations of eyes, brows, mouth, head tilt and posture rather than unrelated face swaps.

## Animation language
- Idle: breathing + micro weight shift.
- Talk: mouth rhythm + small head/hand gestures.
- Walk/run: readable locomotion with stable body proportions.
- Think: reduced motion, focused eyes, subtle head angle.
- React: short expressive response, then return to contextual idle.
- Celebrate: brief energetic gesture, never continuous looping.

## Presence effects
The Cassidy presence layer may use:
- slow aura pulse
- two or three tiny ambient sparkles
- world-colored glow
- subtle vertical float

Effects must remain behind the character and never obscure the face or interaction controls.

## Camera and composition
- Default: full-body three-quarter presentation.
- Conversation: crop toward face and upper torso while retaining silhouette context.
- World: character should sit naturally on the ground plane and obey scene depth.
- Home: Cassidy is the visual focal point, with the room/environment supporting her rather than competing with her.

## Asset requirements for future production art
- front, three-quarter and side reference views
- neutral, happy, curious, surprised, thoughtful, excited, concerned and playful expression sheets
- base, seasonal, Emerald Valley, Japanese World, French World, festival and adventure outfits
- idle, walk, run, talk, gesture, point, think, react and celebrate animation references
- consistent skin, hair, eye, clothing and accessory materials
- clean silhouette at thumbnail scale

## Engineering contract
The visual design is presentation-only. Character behavior, personality, memory, autonomy and world decisions remain owned by Cassidy engines. Visual components consume state; they do not mutate Cassidy state directly.

## Current implementation
- `src/characters/cassidyCharacterDesign.ts` remains the identity contract.
- `src/characters/cassidyVisualDesign.ts` owns visual palette/world accents.
- `src/features/cassidy/components/CassidyVisualPresence.tsx` adds the living aura/presence layer around the canonical `CassidyCharacter` renderer.
- `CassidyHomeScreen` now uses the living presence layer.
