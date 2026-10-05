# Cassidy — Master Character Art Bible

Cassidy is the heart and recognizable visual soul of GoPAL-AI. She is not a decorative mascot and not a generic NPC. Every presentation of Cassidy must feel like the same person: recognizable at a glance, emotionally expressive, warm, intelligent, adventurous, and deeply connected to the living world.

## 1. Core identity

- Name: Cassidy
- Role: world-companion
- Narrative position: the learner's constant companion and the emotional bridge between learning, exploration, memory, quests, and the living world.
- Visual target: premium stylized 2.5D / 3D game character with a handcrafted, cinematic feel.
- Character principle: recognizable before detailed. Silhouette, hair, eyes, outfit language, and signature accessory must identify Cassidy even at small scale.
- Continuity rule: every asset, pose, outfit, expression, portrait, icon, and world appearance derives from one canonical character sheet.

## 2. Face

Cassidy's face should be friendly and distinctive rather than generic.

- Face shape: soft, approachable stylized-human design with clean planes and gentle contours.
- Features: balanced nose, subtle cheek definition, expressive brows, small natural smile shape, and carefully authored facial proportions.
- Avoid a generic AI-avatar look. Give her a memorable facial rhythm: brow shape, eye spacing, smile shape, and hair framing should work together as a signature.
- Expressions must communicate through the whole face, not only the mouth.
- Micro-expressions: curiosity, recognition, amusement, concentration, surprise, encouragement, quiet thought, and delight.

## 3. Eyes — Cassidy's signature feature

The eyes should be one of the strongest visual anchors in the entire app.

Preferred direction:
- Deep near-black eyes with a warm brown undertone rather than flat pure black.
- Large, highly expressive stylized eyes with believable layered construction.
- Dark iris with subtle radial texture and a controlled warm highlight.
- Clear corneal/gloss layer so light moves naturally as Cassidy moves.
- Two or more authored catchlights depending on lighting/world context; never a pasted white dot.
- Soft upper-lid shadow and authored lashes/brow shapes for depth.
- Eye focus should respond to conversation, nearby objects, the learner, and world events.
- Blink timing should be varied and context-sensitive instead of perfectly periodic.
- Expression system must support gaze direction, eyelid openness, brow position, pupil/iris emphasis, and tiny eye movements.

The intended impression is: **bright, alive, observant, and emotionally present**.

## 4. Hair

Cassidy has dark brown hair as a permanent identity anchor.

- Base color: rich dark chocolate brown.
- Secondary tones: subtle warm espresso and chestnut highlights visible under strong light.
- Finish: soft natural sheen, never metallic plastic.
- Structure: layered hairstyle with a strong silhouette, designed locks around the face, controlled side/back volume, and a few signature strands.
- Hair must read clearly in silhouette before individual strands are visible.
- Hair movement: subtle secondary motion during walking, turning, running, talking, wind, and celebrations.
- World lighting may change the perceived highlight, but the underlying hair identity remains dark brown.
- Avoid excessive strand noise; use authored hair groups so the design remains readable at game-camera distance.

## 5. Clothing identity

Cassidy's base outfit should feel like an adventurer, learner, and companion rather than a school-uniform mascot.

Base outfit direction:
- Elegant practical jacket or overshirt layered over a clean top.
- Deep neutral lower garment with comfortable game-ready footwear.
- Emerald accent used as a signature GoPAL-AI color, not as the entire outfit.
- Small handcrafted details: seams, fabric layers, cuffs, subtle stitching, and functional pockets.
- One signature accessory that remains recognizable across outfits.
- Clothing should support movement, sitting, gestures, travel, and world interactions.

The outfit should look beautiful because of design quality and material detail, not because of exaggerated body proportions.

## 6. Signature accessory

Create one permanent Cassidy accessory that acts like a visual logo.

Recommended direction:
- A small luminous leaf/star/compass-inspired companion charm.
- It should have a restrained emerald glow in Emerald Valley.
- In language worlds it can receive local color/material accents while retaining its canonical shape.
- It should react subtly to meaningful discoveries, quests, learning completion, memories, and world events.
- The accessory must never become visually louder than Cassidy's face.

## 7. Full-body model

Cassidy must be a true full-body character.

Required authored parts:
- head and face
- layered hair
- neck and shoulders
- torso and clothing layers
- articulated arms
- authored hands and fingers suitable for readable gestures
- articulated legs
- feet and shoes with stable ground contact
- accessory

The model must be designed for a three-quarter game camera while remaining correct from front, three-quarter, side, and rear reference angles.

## 8. Animation language

Cassidy should always feel alive, but never constantly busy.

Canonical animations:
- idle
- walk
- run
- turn
- sit
- talk
- gesture
- point
- celebrate
- think
- react

Additional high-value authored moments:
- greeting the learner
- listening
- explaining
- discovering something together
- looking toward a landmark
- encouraging the learner
- remembering a previous experience
- quiet reflection
- playful surprise
- small victory celebration

Animation rules:
- Use layered animation: locomotion + breathing + eye movement + hair motion + facial micro-expression.
- Prefer subtle secondary motion over exaggerated looping.
- Important emotional moments may temporarily override idle behavior.
- Cassidy should look toward meaningful world objects and the learner rather than staring into empty space.

## 9. Expression system

Expressions are authored as combinations, not isolated static faces.

Core expressions:
- neutral
- happy
- curious
- surprised
- thoughtful
- excited
- concerned
- playful

Each expression should define at minimum:
- brows
- eyelids
- gaze
- mouth
- cheek/face tension
- head tilt
- optional accessory response

The renderer should support smooth transitions between expressions so Cassidy does not visibly snap between states.

## 10. World variants

Cassidy remains the same character everywhere.

### Emerald Valley
- signature home-world outfit
- warm natural materials
- emerald accessory glow
- soft green/gold environmental accents

### Japanese World
- canonical Cassidy identity unchanged
- refined travel/adventure outfit variant inspired by the world without turning Cassidy into a costume
- restrained indigo, vermilion, cream, or jade accents
- accessory receives a subtle local material treatment

### French World
- canonical Cassidy identity unchanged
- elegant travel/learning outfit variant
- restrained navy, burgundy, cream, or warm gold accents
- accessory receives a subtle local material treatment

### Festival / Adventure / Seasonal
- variants modify clothing and accessories, never the canonical face, hair identity, or core silhouette.

## 11. Camera and presentation

Primary presentation:
- full-body three-quarter camera
- Clash-of-Clans-inspired readable physical world scale
- soft depth and grounded contact shadow
- clean silhouette against the environment

Secondary presentation:
- closer conversational framing for AI tutor moments
- expressive head-and-shoulders framing for emotionally important dialogue
- portrait crop for profile/history surfaces

Cassidy must remain visually consistent across all three.

## 12. Lighting

Use lighting to make Cassidy feel alive rather than glossy.

- soft key light
- subtle rim/separation light
- gentle ambient fill
- eye catchlights driven by scene lighting
- hair highlights driven by light direction
- grounded contact shadow
- optional world-specific atmospheric tint

Do not permanently bake a single lighting setup into the character texture.

## 13. Material direction

Materials should be stylized but physically coherent.

- skin: soft, clean stylized material with controlled roughness
- hair: layered dark brown material with directional sheen
- eyes: sclera + iris + pupil + corneal layer
- clothing: fabric-aware roughness and subtle weave/detail
- shoes: slightly varied material response
- accessory: restrained emissive component

## 14. External art-tool production pipeline

The production asset should be created outside the React Native renderer, then integrated into GoPAL-AI.

Recommended pipeline:

1. Character concept / exploration
   - Generate several concept directions using an external concept-art or image-generation tool.
   - Select one canonical face, hair silhouette, outfit language, and accessory.
   - Do not keep changing the character identity after rigging begins.

2. Character sheet
   - Produce front, three-quarter, side, rear, facial-expression, hair, outfit, and color references.
   - Include exact palette/material notes.

3. 3D production
   - Build or commission the canonical full-body model in a character/3D tool such as Blender or another suitable character package.
   - Retopologize for mobile-friendly performance.
   - Build clean UVs and texture sets.

4. Rigging
   - Full-body skeleton.
   - Facial controls or blendshapes for expressions.
   - Eye/gaze controls.
   - Hand gesture controls.
   - Hair/accessory secondary motion.

5. Animation
   - Author the canonical locomotion and emotional animation library.
   - Validate transitions between all common states.

6. Optimization
   - Create mobile LODs.
   - Compress textures appropriately.
   - Validate draw calls, memory, loading time, and animation cost.

7. GoPAL-AI integration
   - Store the canonical asset identity in `CassidyCharacterAssetSet`.
   - Keep behavior/state/AI ownership in Cassidy engines.
   - Presentation reads state from the engines and selects the appropriate visual asset/animation.
   - Never create a second Cassidy state system inside the renderer.

## 15. Engineering contract

The visual system must remain separate from Cassidy's intelligence.

`Cassidy engines -> character state -> presentation resolver -> canonical asset -> animation`

The renderer must never decide:
- what Cassidy remembers
- what Cassidy believes
- what Cassidy learns
- what Cassidy chooses
- relationship progression
- rewards
- quests

The renderer only expresses those states visually.

## 16. Quality bar

Cassidy is the visual benchmark for the entire GoPAL-AI world.

Before an asset is accepted, check:
- recognizable silhouette at small scale
- dark brown hair remains unmistakable
- eyes remain expressive in game-camera view
- face remains consistent across angles
- hands and feet are clean and usable
- clothing folds and materials read clearly
- animation does not look robotic
- gaze feels intentional
- world variants still look like Cassidy
- no duplicated character identity exists elsewhere in the codebase
- mobile performance remains acceptable

**North star:** When the learner sees Cassidy from across a location, in a conversation, in a quest, or in a tiny UI portrait, they should immediately know: *that's Cassidy.*
