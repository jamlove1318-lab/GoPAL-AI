# EMERALD VALLEY — WORLD MASTER SPECIFICATION

**Status:** Canonical visual, spatial, interaction, atmosphere, and presentation specification  
**World:** Emerald Valley — GoPAL Home World  
**Project identity:** THE WORLD REMEMBERS  
**Representation:** 2D + 2.5D + 3D + Hybrid by design  
**Primary purpose:** Give the implementation agent a concrete world target instead of asking it to invent its own composition.

---

## 0. READ THIS FIRST — NON-NEGOTIABLE CREATIVE DIRECTIVE

Emerald Valley is not a 3D demo, not a technical showcase, not a dashboard, and not a collection of disconnected locations.

It is a **living Home World**: a place the learner returns to because it feels familiar, peaceful, inhabited, discoverable, and capable of remembering what happened there.

The implementation must therefore optimize for this feeling in this order:

1. **Sense of place**
2. **Readable geography**
3. **Emotional atmosphere**
4. **Believable village life**
5. **Exploration and discovery**
6. **Cassidy's presence**
7. **Beautiful visual composition**
8. **Interaction clarity**
9. **Performance**
10. **Technical sophistication**

Technical features must serve the world. The world must never feel like it exists to demonstrate the renderer.

### The current diagnostic UI is NOT the final player-facing design

A development HUD containing text such as:

`3D Physical Viewport • 29/29 GLBs Mounted • 10–14 FPS`

is useful during development, but it must not dominate the normal player experience.

Developer diagnostics should be behind a developer/debug mode. The player should see the world, not the implementation.

### Do not turn the world into all-3D

Emerald Valley intentionally uses:

- **2D** for atmospheric art, distant visual storytelling, UI, sky treatments, special illustrations, and moments where flat art is superior.
- **2.5D** for distant mountains, layered atmospheric scenery, background forests, clouds, and other elements where depth is useful but full geometry is wasteful.
- **3D** for places the player can meaningfully inspect, interact with, walk around, light, or experience from changing camera angles.
- **Hybrid** whenever combining representations creates the strongest image.

The goal is the most beautiful and convincing world, not the highest polygon count.

---

# 1. WORLD EMOTIONAL IDENTITY

## 1.1 The feeling

The first emotional impression should be:

> "I have arrived somewhere peaceful, and this place remembers me."

The second impression should be:

> "There is more here than I can see immediately."

The third should be:

> "I want to come back tomorrow."

Emerald Valley should feel like a small mountain settlement that existed before the player arrived and will continue existing when the player leaves.

It should never feel like a theme-park level assembled around buttons.

## 1.2 Visual adjectives

Use these as the visual north star:

- quiet
- warm
- mossy
- mountain-bound
- Japanese-influenced without becoming a stereotype
- handcrafted
- slightly mysterious
- lived-in
- rain-friendly
- lantern-lit
- nostalgic
- contemplative
- safe
- gently magical
- grounded
- intimate
- spacious

Avoid:

- sterile
- neon sci-fi
- generic fantasy village
- excessive saturation
- theme-park decoration
- UI-heavy game lobby
- empty procedural terrain
- photorealism
- excessive bloom
- visual noise

---

# 2. CANONICAL WORLD ORIENTATION

Use a stable world coordinate system already present in the runtime. **Do not arbitrarily relocate existing verified landmark anchors.** Existing runtime coordinates and canonical asset transforms remain the source of truth for actual geometry placement.

The specification below defines the intended spatial relationships and visual hierarchy. Where an existing coordinate already exists, preserve it and fit secondary objects around it.

## 2.1 Cardinal structure

Think of the valley as an elongated mountain settlement:

- **West:** mountain approach and railway entry
- **Central:** valley floor, stream, footpaths, café, market, library
- **East:** railway tunnel and deeper mountain continuation
- **North:** mountain wall, sanctuary, bamboo, elevated terrain
- **South:** lower valley approach, softer terrain, open arrival views

The settlement should read as one continuous valley rather than seven isolated scenes.

## 2.2 Primary geographic hierarchy

From farthest to nearest visual hierarchy:

1. Celestial sky
2. distant mountain silhouettes
3. Sugi/pine treeline
4. valley terrain
5. stream and major paths
6. landmark buildings
7. NPCs and railway
8. foreground props
9. interactive objects
10. UI overlays

The UI must never visually compete with levels 1–9.

---

# 3. VALLEY SILHOUETTE

The mountain silhouette is one of the most important parts of Emerald Valley.

## 3.1 Mount Emerald

Mount Emerald forms the major distant visual anchor.

It should occupy the upper background rather than physically crowding the village.

Visual treatment:

- dark-to-mid emerald mountain mass
- soft atmospheric desaturation toward the horizon
- irregular natural ridge line
- no sharp artificial triangles
- subtle layered depth
- darker lower tree line
- occasional exposed rock or mist layer

Representation:

**2.5D preferred.**

Do not replace the existing cylindrical/layered ridge treatment with expensive fully modeled mountains unless a measurable visual improvement is demonstrated.

## 3.2 Sugi treeline

A dense but irregular band of tall conifers/sugi trees should sit between the mountain background and the village.

The treeline has three jobs:

1. establish scale
2. frame the playable valley
3. hide hard world boundaries

Do not arrange trees in a perfect grid.

Use varied:

- height
- rotation
- spacing
- silhouette

Repeated assets should be instanced where practical.

---

# 4. SKY AND ATMOSPHERE

## 4.1 Sky

The sky occupies the entire upper visual field and must feel like atmosphere, not a flat game background.

Base treatment:

- deep blue upper sky
- lighter desaturated cyan/blue toward horizon
- warm amber influence near sunrise/sunset
- deep indigo at night

The horizon should be lighter than the zenith except during intentionally dark weather states.

## 4.2 Clouds

Clouds are atmospheric accents, not the subject.

Use lightweight 2.5D or low-complexity 3D cloud masses.

Clouds should occupy approximately the upper 20–45% of the visible sky depending on camera elevation.

Movement:

- extremely slow
- smooth
- consistent directional drift
- no obvious looping every few seconds
- no jitter

Clouds should have:

- soft silhouettes
- slightly varying heights
- subtle size variation
- no hard black undersides
- no excessive bloom

At night they become muted blue-gray masses, not white daytime clouds.

During rain, cloud coverage increases and contrast decreases.

During clear weather, leave significant open sky.

## 4.3 Mist

Mist belongs mainly to:

- mountain bases
- stream corridor
- distant valley edges
- early morning
- rainy weather

Mist should create depth, not obscure the world.

Never use fog to hide poor geometry.

---

# 5. VALLEY TERRAIN

The valley floor should feel gently shaped by water and foot traffic.

It is not a perfectly flat green plane.

Use subtle terrain undulation:

- paths slightly lower than surrounding grass
- stream bank slightly depressed
- buildings placed on believable level patches
- gentle slopes toward mountain edges
- occasional small stones, roots, moss, or terrain variation

The terrain palette should stay restrained:

- deep moss green
- muted forest green
- dark earth
- desaturated olive
- warm brown path soil

Avoid bright videogame grass green.

---

# 6. SUZU STREAM

The Suzu Stream is a major emotional and geographic spine of the valley.

It must be immediately recognizable as moving water.

## 6.1 Placement

Preserve the existing canonical stream route.

The stream should visually connect multiple locations instead of existing as a decorative isolated ribbon.

The player should be able to use the stream as a mental navigation landmark.

## 6.2 Shape

The stream should:

- curve naturally
- widen and narrow subtly
- have irregular banks
- avoid mathematically perfect edges
- pass beneath/near footpath crossings where appropriate
- visually lead the eye through the valley

## 6.3 Water appearance

Base color:

- dark green-blue
- slightly transparent
- cool relative to surrounding terrain

Surface:

- subtle directional ripple
- moving highlights
- small wave distortion
- no large waves
- no ocean-like animation

The water should reflect the current lighting state.

Morning: cooler green-blue with warm sky highlights.

Afternoon: brighter natural reflections.

Evening: deeper teal with warm amber reflections from lanterns/buildings.

Night: dark blue-green with restrained moon highlights.

Rain: visible surface response and slightly darker wet banks.

Snow: subdued dark water with occasional reflected cool light.

## 6.4 Stream edge

Use:

- moss
- small stones
- occasional reeds/grass
- irregular darker wet soil

Do not line the entire stream with identical rocks.

## 6.5 Performance

The stream animation should be shader-driven where possible.

Do not recreate geometry every frame.

Keep allocations out of the render loop.

---

# 7. MAIN PATH NETWORK

Paths are the player's psychological map.

## 7.1 Main valley path

The main path should be wider and more readable than secondary paths.

Approximate visual hierarchy:

- primary path: 2.0–2.5 world units visual width
- secondary path: 1.2–1.7 units
- tiny exploratory path: 0.7–1.1 units

Use the existing world scale if different; these are design proportions, not a command to rescale the entire world.

Primary paths should visually connect:

**arrival → café → central valley → market/library/station → sanctuary/garden**

## 7.2 Path material

Warm muted brown earth.

Avoid perfect straight edges.

Add slight variation in:

- width
- edge softness
- compacted center
- surrounding grass

## 7.3 Wayfinding

Lanterns, fences, stream crossings, building entrances, and tree framing should naturally guide the player.

Do not rely entirely on UI tabs to explain geography.

---

# 8. KOMOREBI CAFÉ — PRIMARY SOCIAL ANCHOR

The café is one of the most important emotional locations in Emerald Valley.

It should feel like somewhere people actually stop, talk, drink tea, study, and wait for weather to pass.

## 8.1 Position

Preserve the existing canonical café anchor.

It should sit near the valley's central social route and remain easy to reach from the main path.

The front porch should face the primary approach path rather than facing away from the valley.

## 8.2 Building silhouette

The café should have:

- dark pitched roof
- warm timber structure
- slightly elevated porch
- visible structural posts
- warm interior windows
- modest footprint
- handcrafted asymmetry

It should not look like a giant restaurant.

It is a cozy neighborhood café.

## 8.3 Roof

Roof:

- dark charcoal/brown
- visibly pitched
- slightly overhanging
- matte rather than glossy

The roof should read strongly against the sky.

## 8.4 Walls and timber

Use warm desaturated wood tones.

Structural timber should be visibly darker than wall panels.

Do not use excessive texture contrast.

## 8.5 Windows

Windows are important warm anchors.

Interior glow should be:

- warm amber
- soft
- not a flat neon rectangle

The glow should imply an occupied interior.

## 8.6 Porch

The porch is where the player should feel invited to stop.

Include:

- benches
- small tables
- subtle lanterns
- Cassidy's companion position
- occasional tea/service details

Furniture should not block the primary walking route.

## 8.7 Cassidy position

Cassidy should have a visually privileged but natural position near the café veranda.

Cassidy must not look like a UI marker pasted into the world.

Preferred composition:

- near porch edge
- visible from main path
- enough open space around Cassidy for interaction
- warm nearby lighting
- background containing café architecture
- not directly in front of the brightest window

When idle, Cassidy should feel like she belongs there.

When an event occurs, the world should subtly draw attention toward Cassidy through:

- animation
- lighting emphasis
- movement
- environmental sound
- gentle dialogue cue

Do not rely on a permanent giant notification banner.

---

# 9. CAFÉ SOCIAL CLEARING / CAMPFIRE AREA

The campfire/social area should feel like a secondary gathering place connected to the café, not a random object placed in front of it.

## 9.1 Position

Place the clearing on the lower/open side of the café zone, connected by the main dirt path.

The fire should be visible from the café approach but not block the café itself.

## 9.2 Fire

The fire is a warm focal point.

Composition:

- circular stone perimeter
- irregular natural stone placement
- central fire mesh
- warm orange/yellow core
- restrained glow
- small amount of smoke/heat indication if performance allows

The fire must not become a giant glowing sphere.

## 9.3 Seating

Arrange log benches in a loose social semicircle around the fire.

Do not place every bench at the same exact angle.

Leave a clear walking opening toward the café path.

## 9.4 Shelter

The lean-to/secondary wooden shelter belongs at the edge of the social area.

It should feel like a practical weather shelter rather than another main building.

---

# 10. LANTERNS

Lanterns define the emotional rhythm of the valley after sunset.

They should guide rather than overwhelm.

## 10.1 Main path lantern spacing

Use visually consistent spacing along the primary path, approximately every 4–7 world units depending on existing world scale and terrain.

Spacing may intentionally widen in open areas.

## 10.2 Lantern appearance

Preferred:

- simple wooden post
- small rectangular or softly rounded lantern housing
- warm amber interior
- subtle halo

Avoid giant point-light radii.

## 10.3 Lighting rule

The world should have a clear primary light source.

Local lanterns provide atmosphere, not full-scene illumination.

Do not make every lamp cast expensive dynamic shadows.

Three.js shadow maps can be extremely expensive when many shadow-casting lights are active; use a restrained lighting hierarchy and fake/static lighting where appropriate. citeturn0search0

---

# 11. LANTERN MARKET

The market should be visually warmer, busier, and more colorful than the library or sanctuary, while remaining restrained.

## 11.1 Position

Place it along a central circulation route where the player naturally passes between major locations.

It should feel like a village market, not a shopping mall.

## 11.2 Composition

Use:

- 2–4 main stalls or small structures
- wooden counters
- baskets
- crates
- cloth/awning elements
- small signs
- lanterns
- produce/tea/craft props

Avoid filling every square meter.

## 11.3 Aoi

Aoi should be associated strongly with the market.

Place Aoi near a stall/counter where the character can be seen from the main path.

Aoi's position should change subtly through world-state logic over time rather than remaining permanently frozen.

---

# 12. WHISPERING LIBRARY

The library is the quiet intellectual counterpart to the market.

## 12.1 Emotional identity

The library should feel:

- sheltered
- old
- calm
- slightly mysterious
- full of accumulated knowledge

## 12.2 Exterior

Use:

- timber structure
- darker wood than café where possible
- restrained signage
- warm window glow
- small entry porch
- subtle plant/moss integration

## 12.3 Interior impression

Even if the player cannot freely enter a full interior, the exterior should imply one.

Windows can show:

- warm light
- shelf silhouettes
- subtle interior geometry

## 12.4 Yuki

Yuki belongs near the library entrance, reading area, or archive-related prop cluster.

Yuki should feel like an archivist, not a generic NPC standing outside a building.

---

# 13. VALLEY STATION & RAIL CROSSING

The station is the valley's connection to the outside world.

It should create the feeling that Emerald Valley is part of a larger landscape.

## 13.1 Existing railway route

Preserve the canonical railway route and existing verified anchors.

Current known route:

- western mountain pass: approximately `[-18.0, 0.12, 13.5]`
- Valley Station: approximately `[7.7, 0.10, 7.0]`
- eastern tunnel: approximately `[30.0, 0.10, 4.0]`

These existing coordinates are authoritative unless a verified runtime constraint requires change.

## 13.2 Track

Track should visually follow terrain rather than appearing pasted on top.

Keep it readable from the station and nearby approach paths.

## 13.3 Station

Station identity elements:

- platform
- shelter/building
- benches
- station signage
- crossing
- lamps
- track bed

Do not overcrowd the station.

## 13.4 Kenji

Kenji is the station master.

Place him where a station master would naturally be:

- platform
- station building
- crossing
- timetable/sign area

His movement should occasionally shift between these nearby points.

## 13.5 Train

The train should feel like a real valley service, not a decorative moving mesh.

Existing cycle should remain:

- approach
- whistle
- station dwell
- bell
- departure
- disappear into mountain route

The train's sound should often be heard slightly before it becomes visible.

---

# 14. RAILWAY MOUNTAIN TUNNEL

The eastern tunnel is a major mystery/continuity landmark.

It should visually communicate:

> There is a larger world beyond Emerald Valley.

The tunnel should be:

- dark
- substantial
- carved into mountain/rock
- framed by vegetation
- readable from the railway

Do not make it a glowing fantasy portal.

The interior can remain visually dark.

---

# 15. MOUNTAIN SANCTUARY

The sanctuary is the quietest major location.

## 15.1 Position

Place it on elevated/northern terrain where the player can look back toward the valley.

The journey to it should feel slightly slower and more contemplative.

## 15.2 Architecture

Use restrained mountain-temple influence:

- timber
- stone
- dark roof
- lanterns
- natural vegetation

Avoid excessive ornate fantasy architecture.

## 15.3 Lighting

At evening:

- subtle amber lanterns
- cool ambient sky
- strong silhouette against mountain backdrop

At night:

- very restrained illumination
- moonlit environment
- a few warm focal lights

## 15.4 Sora

Sora may naturally connect the sanctuary, market, and valley paths as a traveler.

Sora should feel like someone passing through rather than permanently assigned to one building.

---

# 16. WHISPER BAMBOO GARDEN

The bamboo garden should create a strong material and acoustic contrast with the open valley.

## Appearance

Use:

- vertical bamboo rhythm
- layered depth
- soft green variation
- narrow paths
- filtered light

Avoid a perfectly uniform bamboo grid.

## Camera

The garden benefits from closer, lower camera framing than the mountain panorama.

It should feel enclosed but not claustrophobic.

## Sound

If available:

- subtle bamboo rustle
- wind
- distant water

Avoid loud looping nature sounds.

---

# 17. HIRO — TEA GARDENER

Hiro belongs naturally near garden/tea-growing areas.

His activity should communicate gardening rather than generic NPC idling.

Possible ambient behaviors:

- checking plants
- walking a short garden path
- pausing
- looking toward the valley

If the GLB has skeletal Walk animation, use it.

If it does not, preserve a restrained procedural fallback.

---

# 18. NPC DESIGN RULES

NPCs must be part of the environment.

They are not UI widgets with legs.

## General placement

Every NPC must have:

- a believable home/activity zone
- a reason for standing there
- a small amount of movement
- a readable silhouette
- enough surrounding space for interaction

Avoid placing multiple NPCs on top of each other.

## Walking

Walking NPCs must not slide.

If a skeletal `Walk` clip exists:

- use `AnimationMixer`
- loop appropriately
- synchronize movement speed
- stop/reset when stationary

If no usable clip exists:

- retain procedural fallback

Never delete the fallback simply because one model supports skeletal animation.

---

# 19. CASSIDY — HEART OF THE WORLD

Cassidy is not a quest marker.

Cassidy is the emotional continuity of Emerald Valley.

## 19.1 Physical presence

Cassidy should have a stable recognizable home position, primarily associated with the café veranda, while being capable of appearing elsewhere for world events.

## 19.2 Idle presence

When the player is not interacting:

- subtle breathing/idle animation
- occasional gaze shift
- occasional environmental reaction
- no constant waving
- no exaggerated motion

## 19.3 Relationship expression

Do not show a numerical relationship score.

The relationship should be expressed through:

- remembered conversations
- references to past discoveries
- familiar greetings
- changing dialogue tone
- returning to places together
- shared world moments

## 19.4 Events

Instead of a permanent bottom notification dominating the screen, events should be contextual.

Preferred sequence:

1. subtle environmental cue
2. Cassidy animation/gaze
3. optional small notification
4. player chooses whether to approach
5. camera gently assists only when requested
6. dialogue/story moment
7. world state changes if appropriate

The world should never constantly shout for attention.

---

# 20. CAMERA LANGUAGE

Camera is a storytelling tool, not merely a navigation mechanism.

## 20.1 Default camera

Default exploration view:

- elevated third-person/isometric perspective
- approximately 35–50° downward angle
- enough horizon to see mountains
- enough foreground to read path and character position

Do not default to a nearly vertical top-down view.

The player should see:

**character + immediate environment + landmark + mountain context**

simultaneously where possible.

## 20.2 Café camera

The café camera should frame:

- café porch
- Cassidy or social space
- path leading away
- some mountain/tree context

Avoid framing the café so tightly that it becomes a standalone building preview.

## 20.3 Market camera

Show:

- stall rhythm
- path
- nearby NPC
- warm lanterns

## 20.4 Library camera

Slightly calmer and more centered.

Show:

- building silhouette
- Yuki
- path/vegetation

## 20.5 Station camera

Show:

- station
- platform
- track direction
- mountain/tunnel relationship

## 20.6 Sanctuary camera

Wider and slower.

Show:

- sanctuary
- mountain
- valley below

## 20.7 Panoramic mode

Panoramic mode should be cinematic, not a diagnostic camera test.

Slowly reveal:

1. foreground
2. landmark
3. valley
4. mountain
5. sky

Movement must be smooth and deliberate.

## 20.8 Tour

Tour should visit the valley as a story:

1. Valley panorama
2. Café
3. Cassidy
4. Market
5. Library
6. Station/train
7. Garden
8. Sanctuary
9. return toward central valley

The tour should not feel like a list of buttons being tested.

User interaction must immediately interrupt the tour.

---

# 21. UI — FINAL PLAYER-FACING DESIGN

The current glassmorphism language is useful, but the UI must become subordinate to the world.

## 21.1 Top-left identity

Keep a small identity cluster.

Text:

`THE WORLD REMEMBERS`

Below:

`EMERALD VALLEY • EVENING`

But keep it visually quiet.

Approximate placement:

- 12–16 px from left edge
- 12–18 px from top safe area

The title should not occupy more than approximately 15–18% of screen width on a typical phone.

## 21.2 Developer telemetry

Move the following behind a developer/debug toggle:

- GLB count
- FPS
- renderer type
- asset mount count
- memory diagnostics
- draw calls

Normal players should not see these.

## 21.3 Location navigation

Location controls should remain available but visually lightweight.

Preferred structure:

- compact floating control
- translucent background
- active location highlighted
- inactive locations quiet

Do not let the navigation bar consume the center of the screen for long periods.

## 21.4 Camera controls

`Panoramic` and `Tour` remain available.

They should feel like world actions, not debug controls.

## 21.5 Event banner

The bottom event drawer should be contextual and dismissible.

It must not permanently occupy the bottom edge during ordinary exploration.

Use it when something genuinely important happens.

For Cassidy:

`✨ SOMETHING IS HAPPENING`

`Cassidy wants to show you something`

`View →`

But animate it in gently and allow it to disappear.

---

# 22. GLASSMORPHISM RULES

Use glassmorphism only where it improves usability.

Material:

- deep navy/slate
- approximately 65–85% opacity
- subtle blur where supported
- 1px low-opacity border
- soft shadow only where needed

Do not place glass cards over every object.

The world itself should provide the visual interest.

---

# 23. COLOR LANGUAGE

### World greens

Use restrained:

- moss green
- deep forest green
- emerald accents
- muted sage

### Wood

- warm brown
- dark walnut
- charcoal wood

### Path

- muted earth brown

### Water

- deep teal
- blue-green

### Evening light

- amber
- muted gold

### Night

- indigo
- blue-gray

### UI accent

Primary:

`#10B981`

Secondary:

`#F59E0B`

UI background family:

`#0A0F1D`
`#0D1527`

Text:

`#FFFFFF`

Secondary:

`#94A3B8`

Do not overuse accent colors in the world itself.

---

# 24. LIGHTING ARCHITECTURE

The lighting hierarchy should be:

1. sky/environment
2. one primary sun/moon directional light
3. ambient/fill
4. selective local lights
5. emissive materials

Do not allow dozens of expensive dynamic shadow sources.

The Three.js shadow model can multiply scene rendering cost when many lights cast shadows; a point-light shadow can require six shadow views. Therefore local lanterns and campfire lights should generally provide visual glow/emission without all becoming shadow-casting lights. citeturn0search0

## Evening

Primary mood:

- warm windows
- amber lanterns
- cool blue ambient sky
- long but restrained shadows

The contrast between cool environment and warm human spaces is central to Emerald Valley.

## Night

Reduce local intensity.

Do not turn the entire world orange.

The valley should remain readable through:

- moon/sky fill
- silhouettes
- selective warm lights

---

# 25. PERFORMANCE ARCHITECTURE

The goal is a visually rich world that remains responsive on mobile.

The previously discussed ~85k scene figure is a **performance envelope**, not a hard per-asset polygon limit.

Evaluate:

- draw calls
- triangles
- materials
- texture memory
- transparency
- shader complexity
- dynamic lights
- shadow passes
- animation mixers
- visible object count
- CPU allocations
- GPU fill rate

## 25.1 Instancing

Repeated objects such as:

- trees
- lantern posts
- rocks
- market props
- repeated furniture

should be candidates for instancing where geometry/materials are compatible.

Three.js `InstancedMesh` exists specifically to render many objects with shared geometry/material while reducing draw-call overhead. citeturn0search1

Do not instance objects that require independent complex animation or materially different shaders unless the implementation supports it correctly.

## 25.2 Merging

Static groups of compatible geometry may be merged where appropriate.

Do not merge objects that need:

- independent raycasting
- independent animation
- independent visibility
- independent interaction

Three.js documents geometry merging as a way to reduce the overhead associated with drawing many separate objects. citeturn0search2

## 25.3 Shadows

Use one principal shadow-casting directional light where possible.

Local lights should normally not cast shadows.

Use:

- baked/static hints
- emissive surfaces
- fake contact shadows
- restrained ambient occlusion

where visually appropriate.

## 25.4 Resolution scaling

If mobile rendering is fill-rate limited, use dynamic or platform-aware render resolution rather than destroying the scene's visual composition.

Three.js supports rendering at a smaller drawing-buffer resolution while keeping the canvas visually full-size. citeturn0search3

## 25.5 Transparency

Use transparent materials carefully.

Transparent vegetation and effects can be more expensive and can require multiple passes in some configurations. Three.js exposes `forceSinglePass` for suitable double-sided transparent materials where the second pass provides no visual benefit. citeturn0search4

## 25.6 Disposal

When dynamic assets are removed, dispose unused geometries, materials, textures, and render resources correctly. Three.js does not automatically release all GPU resources merely because an object is no longer referenced. citeturn0search5

---

# 26. WEATHER

Weather should change the emotional state without changing the world's identity.

## Clear

- open sky
- strong mountain silhouette
- clean distant visibility
- gentle wind

## Rain

- darker terrain
- wet surfaces
- subdued sky
- soft mist
- stream becomes more visually important
- lantern reflections become attractive
- sound becomes intimate

Rain should make the café and library feel more inviting.

## Snow

- muted terrain
- slower visual rhythm
- cool palette
- softened edges
- warm windows become stronger anchors

Do not bury the entire scene under thick particle effects.

---

# 27. TIME OF DAY

## Morning

Feeling:

**fresh beginning**

Colors:

- cool blue
- pale green
- soft warm sunlight

NPC behavior should feel slower.

## Afternoon

Feeling:

**ordinary village life**

Highest general visibility.

Natural green/wood palette.

## Evening

Feeling:

**returning home**

This is the signature Emerald Valley mood.

Use:

- amber windows
- lanterns
- blue sky
- long shadows
- warm/cool contrast

## Midnight

Feeling:

**quiet mystery**

Use:

- deep indigo
- moonlight
- minimal warm lights
- quieter NPC activity
- strong silhouettes

Midnight should invite curiosity rather than feel empty.

---

# 28. SOUND DESIGN

Sound must reinforce geography.

## Café

- soft room tone
- cups/tea ambience if available
- quiet conversation
- subtle music

## Market

- distant activity
- light movement
- occasional merchant sound

## Library

- very quiet interior tone
- pages/wood ambience

## Station

- rail ambience
- bell
- train whistle
- subtle mechanical movement

## Stream

- gentle water

## Garden

- wind through vegetation

## Sanctuary

- quiet wind
- subtle natural ambience

Audio transitions should follow camera/world focus smoothly.

---

# 29. WORLD EVENTS

Events should emerge from the world.

Examples:

- Cassidy notices something near the stream.
- A train arrives while the player is near the station.
- Rain begins while the player is walking toward the café.
- A market stall changes arrangement.
- A library discovery becomes available.
- A hidden path becomes noticeable after a previous event.
- Cassidy references something that happened on an earlier visit.

The event system should make the valley feel persistent.

Do not create constant notifications.

Silence is also part of the world.

---

# 30. DISCOVERY DESIGN

Every major area should contain at least one reason to look closer.

Not every discovery should be a collectible.

Discovery can be:

- a visual detail
- a hidden object
- a short dialogue
- a sound
- a changed environmental detail
- a memory
- a cultural note
- a tiny environmental story

The player should sometimes notice things without being told that they are important.

---

# 31. WHAT THE PLAYER SHOULD SEE FROM EACH MAJOR LOCATION

## Café

Visible:

- main path
- social clearing/campfire
- trees
- distant mountain
- preferably a glimpse of stream or central valley

## Market

Visible:

- market stalls
- path
- surrounding village
- some mountain/trees

## Library

Visible:

- quiet path
- trees
- nearby valley architecture

## Station

Visible:

- track direction
- station
- mountain route
- tunnel direction

## Sanctuary

Visible:

- sanctuary structure
- mountain
- valley below

## Garden

Visible:

- bamboo/tea vegetation
- narrow path
- filtered valley glimpse

This ensures every location contributes to a coherent mental map.

---

# 32. SPATIAL TRANSITIONS

The player should feel transitions between zones.

### Café → Market

Transition:

warm social → slightly busier village

### Market → Library

Transition:

activity → quiet

### Café → Station

Transition:

social warmth → open travel infrastructure

### Valley → Sanctuary

Transition:

ordinary life → contemplation

### Valley → Garden

Transition:

open valley → enclosed vegetation

### Station → Tunnel

Transition:

known settlement → unknown outside world

These transitions are as important as the destinations.

---

# 33. VEGETATION PLACEMENT RULES

Vegetation should frame spaces rather than block them.

Use larger trees:

- world perimeter
- mountain edge
- behind structures
- along path bends

Use smaller plants:

- stream edges
- building edges
- garden boundaries

Leave clear negative space around:

- NPC interaction points
- building entrances
- station platform
- campfire
- Cassidy

Never hide important interactions behind foliage.

---

# 34. PROPS

Props should communicate function.

### Café

- tables
- benches
- baskets
- tea objects
- subtle storage

### Market

- crates
- baskets
- produce
- shelves
- signs

### Library

- shelves
- books
- archive boxes

### Station

- benches
- lamps
- signs
- platform details

### Garden

- gardening tools
- baskets
- plants

### Sanctuary

- stone
- lanterns
- simple offerings/decorative objects

Do not add props merely to fill empty space.

---

# 35. ASSET SOURCING

If new external assets are genuinely required, use the established approved asset workflow.

Preferred sources:

- Poly Haven
- Quaternius
- Kenney

For every acquired asset record:

- exact source URL
- exact license
- asset name
- date acquired
- modifications performed
- final runtime filename

Never assume that "free" means reusable.

Do not download assets merely because the scene looks slightly empty.

First determine whether composition, lighting, camera, or existing assets can solve the problem.

---

# 36. CURRENT 29-GLB PERFORMANCE PROBLEM

The current diagnostic state reports approximately:

**29/29 GLBs mounted — 10–14 FPS on an Android Chrome session.**

Treat this as a performance investigation target, not as proof that 29 GLBs alone are the cause.

Profile actual:

- renderer draw calls
- triangles
- materials
- textures
- shader time if available
- shadow passes
- transparent objects
- CPU frame time
- GPU frame time where available
- object count
- animation cost

Do not simply delete assets.

Do not reduce all geometry to primitive boxes.

Do not remove visual identity to hit an arbitrary number.

The goal is to identify the expensive systems and optimize them selectively.

---

# 37. PLAYER-FIRST PERFORMANCE TARGET

The desired target is a responsive mobile experience.

Use measured device results rather than promising a universal FPS number.

Preferred hierarchy:

- stable 30 FPS is substantially better than unstable 10–14 FPS
- 45–60 FPS is desirable on capable devices
- visual quality may scale down gracefully on weaker hardware

Quality scaling candidates:

1. render resolution
2. shadow resolution
3. shadow distance
4. distant effect complexity
5. cloud complexity
6. particle count
7. secondary animation
8. distant object detail

Do not immediately reduce:

- landmark identity
- Cassidy presence
- world geography
- major lighting mood
- interaction

---

# 38. RESPONSIVE REPRESENTATION / LOD PHILOSOPHY

Distance should influence representation.

Foreground:

- real 3D
- interaction
- detailed lighting

Midground:

- simplified 3D
- shared materials
- selective animation

Background:

- 2.5D
- layered meshes
- silhouettes
- atmospheric depth

Far background:

- 2D/gradient/sky treatment

This is intentional and should be preserved.

---

# 39. PLAYER ATTENTION HIERARCHY

At any moment the scene should have approximately:

### Primary focus
One major object/person/event.

### Secondary focus
One or two supporting elements.

### Tertiary environment
Everything else.

Do not make:

- UI
- lanterns
- fire
- NPCs
- mountains
- clouds
- buildings

all equally bright.

The player must know where to look without being forced.

---

# 40. VISUAL COMPOSITION RULE

When the camera is stationary, the scene should still look intentional.

Check:

- foreground framing
- midground subject
- background mountain
- sky balance
- path leading lines
- warm/cool contrast
- empty space

If every camera position looks like a technical viewport test, the composition is wrong.

---

# 41. THE WORLD SHOULD NOT LOOK LIKE THIS

Do NOT produce:

- black void background
- floating buildings
- isolated GLB showcase objects
- giant UI cards
- permanent debug telemetry
- huge FPS labels
- excessive tree walls
- repeated identical trees in obvious rows
- neon green grass
- overbright campfire
- giant bloom
- every light casting shadows
- NPCs sliding across ground
- clouds moving visibly fast
- static water pretending to be a stream
- empty spaces filled with random props
- locations that look like separate levels
- camera angles that hide the valley

---

# 42. THE WORLD SHOULD LOOK LIKE THIS

A player should open the app and see:

A quiet mountain valley under a changing sky.

A recognizable path leading toward a warm café.

Trees framing the settlement.

A stream quietly moving through the valley.

A railway connecting the village to the mountains beyond.

Warm lights appearing as evening arrives.

NPCs doing believable small things.

Cassidy existing naturally inside the world.

The market feeling slightly busier.

The library feeling quieter.

The sanctuary feeling removed and contemplative.

The garden feeling enclosed and green.

The station feeling connected to somewhere beyond the valley.

And everywhere, small signs that the world continues even when the player is not looking.

---

# 43. IMPLEMENTATION PRIORITY

If implementation conflicts arise, prioritize in this exact order:

1. Existing verified world geography
2. Café / Cassidy / central valley readability
3. Major landmark silhouettes
4. Camera composition
5. Lighting mood
6. Path readability
7. NPC believability
8. Stream animation
9. Railway readability
10. Atmosphere/clouds
11. Secondary props
12. UI decoration

Never sacrifice a major world system to improve a decorative UI effect.

---

# 44. ACCEPTANCE TEST — FIRST 30 SECONDS

A new user should be able to answer these questions without reading documentation:

1. Where am I?
2. What is Emerald Valley?
3. Where is the main social place?
4. Where can I go?
5. Who is Cassidy?
6. Does this place feel alive?
7. Is there something worth discovering?

If the answer to those questions requires reading the HUD, the world presentation needs improvement.

---

# 45. ACCEPTANCE TEST — FIVE MINUTES

After five minutes, the user should have:

- recognized at least three landmarks
- understood the central path/valley structure
- noticed at least one NPC behaving naturally
- seen or heard the railway
- encountered Cassidy or a meaningful Cassidy-related cue
- noticed environmental atmosphere
- experienced at least one small discovery or world reaction
- formed a mental map of Emerald Valley

---

# 46. ACCEPTANCE TEST — RETURN VISIT

On returning after time away, the world should feel familiar but not frozen.

Possible changes:

- different time of day
- different weather
- train timing
- NPC positions
- Cassidy reference to prior experience
- changed environmental detail
- new discovery

The world remembers.

---

# 47. DEBUG MODE SEPARATION

Create/retain a developer-only diagnostics mode if needed.

Debug mode may show:

- FPS
- draw calls
- triangles
- GLB count
- renderer
- active camera
- world zone
- weather state
- memory information

Normal mode should hide those diagnostics.

Do not confuse developer instrumentation with product UI.

---

# 48. FINAL IMPLEMENTATION RULE

When a choice exists between:

A. technically impressive implementation that is visually distracting or expensive

and

B. simpler implementation that creates the same or better emotional result

choose B.

When a choice exists between:

A. adding another asset

and

B. improving composition of an existing asset

choose B unless the new asset fills a real world-design gap.

When a choice exists between:

A. more 3D

and

B. better 2D/2.5D/3D composition

choose B.

When a choice exists between:

A. permanent UI notification

and

B. environmental storytelling

choose B.

---

# 49. FINAL VISUAL CHECKLIST

Before declaring Emerald Valley complete, inspect the world in:

- morning
- afternoon
- evening
- midnight
- clear weather
- rain
- snow

Inspect from:

- valley overview
- café
- campfire
- market
- library
- station
- tunnel
- garden
- sanctuary

Check:

- mountain silhouette
- stream
- paths
- buildings
- lanterns
- NPCs
- Cassidy
- railway
- clouds
- fog
- lighting
- audio zones
- camera transitions
- interaction
- UI intrusion
- mobile performance

---

# 50. FINAL DEFINITION OF DONE

Emerald Valley is done when the implementation is no longer asking:

> "What should I add next?"

and instead makes the player wonder:

> "What happened here before I arrived?"

and:

> "What might be different when I come back tomorrow?"

The world is successful when its systems become invisible and its atmosphere becomes memorable.

The player should remember:

**the café light in the evening,**

**the sound of the train somewhere beyond the trees,**

**the stream moving through the valley,**

**the path toward the sanctuary,**

**the quiet garden,**

**the library window glowing at dusk,**

**the market becoming quieter after sunset,**

**and Cassidy being there.**

That is Emerald Valley.

---

# IMPLEMENTATION AGENT INSTRUCTION

Treat this document as the **canonical creative specification** for Emerald Valley.

Do not reinterpret the world at a high level and then invent a different implementation.

Before changing spatial composition:

1. inspect the existing verified world coordinates;
2. preserve canonical anchors;
3. map existing assets to the specification;
4. identify exact deviations;
5. correct deviations systematically;
6. verify Web and Android;
7. verify performance;
8. verify the complete-world tests;
9. update the implementation report.

Do not perform destructive cleanup.

Do not delete existing systems without explicit agreement.

Do not create duplicate engines.

Do not replace working architecture simply to make implementation easier.

The specification defines **what Emerald Valley must feel and look like**. The existing architecture determines the safest way to implement it.

**World first. Technology second.**
