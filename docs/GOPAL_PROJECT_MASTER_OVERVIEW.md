# GoPAL-AI — Project Master Overview

> **Purpose:** This document explains what GoPAL-AI is, what exists in the repository, how the major systems fit together, what the learner is supposed to experience, and what the project is ultimately trying to become.
>
> **Repository:** `jamlove1318-lab/GoPAL-AI`
>
> **Baseline documented:** `main`
>
> **Important:** This document separates **current repository reality** from the **long-term product vision**. A system existing in the codebase does not automatically mean it is fully wired into the player experience.

---

## 1. The simplest explanation of GoPAL-AI

GoPAL-AI is an attempt to build a **living, persistent, AI-powered language-learning world**.

It is not intended to be just:

- a language-learning app
- a flashcard app
- a lesson app
- an AI chatbot
- an AI tutor
- a game
- a virtual pet
- a 3D environment
- a collection of mini-games
- a social dashboard

It is meant to be a **single personal world that contains all of those things when they are useful**.

The central idea is:

> **The learner should feel that they are returning to a place that knows them.**

Instead of:

```
Open app
→ choose lesson
→ answer questions
→ earn points
→ close app
```

the intended experience is closer to:

```
Open GoPAL
→ the world wakes up
→ the current time/season/weather is reflected
→ the learner's previous state is restored
→ Cassidy remembers the learner
→ the world shows what has changed
→ the learner chooses what feels interesting
→ learning happens naturally inside that experience
→ discoveries, memories, relationships and progress are created
→ the world reacts
→ the learner leaves
→ the world remembers
→ the learner returns later
→ the story continues
```

The educational objective remains important, but **education is embedded inside a world rather than presented as the entire identity of the product**.

---

# 2. The emotional goal

The most important part of GoPAL is not a technical feature.

It is a feeling.

The project documentation repeatedly points toward a learner experience that feels:

- peaceful
- familiar
- curious
- personal
- alive
- rewarding
- emotionally warm
- exploratory
- surprising
- safe
- connected
- meaningful
- increasingly owned by the learner

The desired first reaction is not:

> "This is a very advanced language-learning UI."

It is:

> **"I'm back."**

And eventually:

> **"This is my world."**

The learner should feel that the application is somewhere they can return to, not a tool they must repeatedly operate.

---

# 3. What GoPAL should NOT feel like

GoPAL should not become:

### A lesson treadmill

```
lesson → quiz → XP → lesson → quiz → XP
```

### A dashboard

A wall of cards, numbers, streaks, statistics and buttons should not become the primary identity of the product.

### A generic AI companion

Cassidy is not supposed to be a decorative AI avatar that produces random friendly messages.

### A fake living world

The world should not claim that major things happened while the learner was away when they could not actually have happened.

### A technical demo

3D, animation, shaders, assets, audio and simulation exist to create a better world. They are not the reason the world exists.

### A collection of disconnected features

Study Room, Tutor, World Map, Journey, Museum, Cassidy, quests, discoveries and learning activities should ultimately feel like different parts of **one place**.

---

# 4. The central product principle

The project's master design principle can be summarized as:

> **One living world, not a collection of features.**

A feature is valuable when it becomes connected to the learner's personal world.

For example:

- A language lesson becomes a conversation in a café.
- Vocabulary becomes something encountered in a location.
- Culture becomes something discovered in the environment.
- A quest becomes a reason to use language.
- Cassidy's relationship grows through shared experiences.
- A memory becomes part of the learner's history.
- A plant grows as part of the learner's routine.
- A festival changes the environment.
- A return session reflects time passed.
- A place becomes familiar because the learner has actually visited it.

The product should continually turn isolated mechanics into connected experiences.

---

# 5. The current repository at a glance

The current `main` repository is considerably larger than a conventional mobile app.

The repository currently contains approximately:

- **704 Git tree entries**
- **603 tracked file blobs**
- **101 directories**
- **324 source files under `src/`**
- **56 Markdown documents under `docs/`**
- **108 asset files under `assets/`**
- a substantial world-asset library
- Cassidy character production assets
- 3D/GLB/Blender-related material
- production/validation tooling
- GitHub Actions workflows
- Supabase schema and migrations
- a Python-based character/art factory
- world acquisition and validation scripts

The code is therefore better understood as a **product platform plus an evolving world-production pipeline**, not simply a React Native screen collection.

---

# 6. Current technology foundation

The current application is built around:

- Expo
- React Native
- React
- TypeScript
- NativeWind/Tailwind-style utility styling
- Expo audio/video/runtime packages
- React Native Reanimated
- React Native SVG
- Three.js / React Three Fiber
- Supabase
- AsyncStorage/local persistence
- GitHub Actions
- custom world simulation/runtime engines
- external 2D/3D production tooling

The current package baseline uses approximately:

- Expo 57
- React Native 0.86
- React 19.2
- TypeScript strict mode
- Supabase JS
- Three.js
- React Three Fiber
- Reanimated 4
- NativeWind

The project is configured for Android/iOS/web through Expo, with EAS configuration for builds.

---

# 7. The current player-facing shell

The current `App.tsx` is **world-first**.

The primary navigation currently exposes:

1. **Explore**
2. **Travel**
3. **Cassidy**
4. **Study Room**

Additional tools are available through a secondary menu:

- Memory Museum
- People
- Settings

The current root application also starts the living-world reactor, restores Cassidy state, resolves environmental time-of-day presentation, handles authentication/local identity, and routes world/travel interactions.

This is important because the current main branch is no longer best described as the old flat learning-app architecture.

The repository still contains older or alternate screens and foundations, but the current shell is clearly moving toward:

> **World → experiences → learning → memory → relationships → return.**

---

# 8. The four primary surfaces

## 8.1 Explore

Explore is the learner's primary entrance into the living world.

The current implementation centers on **Emerald Valley**.

The learner can:

- enter the valley
- inspect the world
- move/drag around the world viewport
- encounter locations/buildings
- see time/environment information
- encounter opportunities
- receive "while you were away" continuity
- start contextual learning scenarios

The long-term goal is for Explore to feel less like a map screen and more like an actual place.

---

## 8.2 Travel

Travel is the gateway from the home world into other language/cultural worlds.

The repository contains infrastructure for multiple language worlds, including Japanese and French, with the architecture designed to expand.

Travel is intended to connect:

- language
- culture
- geography
- places
- characters
- conversations
- discoveries
- passport/travel identity
- quests
- memories
- progression

Travel should not feel like choosing a course from a dropdown.

It should feel like going somewhere.

---

## 8.3 Cassidy

Cassidy is the persistent companion.

She is not merely the face of the app.

She is intended to connect:

- learning
- exploration
- memory
- conversation
- world events
- emotional continuity
- discoveries
- quests
- encouragement
- shared history

Cassidy can:

- observe
- help
- celebrate
- suggest
- join
- wander
- live independently within bounded rules

The autonomy engine explicitly considers learner context, recent success, need for help, exploration state, elapsed time since Cassidy last spoke, opportunities, weather and Cassidy's personality traits.

That is a major part of the project's identity.

---

## 8.4 Study Room

Study Room is the intimate, low-pressure learning environment.

The repository contains systems for:

- a living bonsai
- soundscape/audio
- matcha crafting
- calligraphy
- pitch-accent shadow practice
- creative activities
- cultural study
- Cassidy's room/presence
- environmental atmosphere

The intended role is not "another lesson screen."

It is a place where the learner can sit down and study.

---

# 9. Emerald Valley — the Home World

Emerald Valley is the canonical home world.

Its project identity is:

> **THE WORLD REMEMBERS**

That phrase captures the purpose of the environment.

Emerald Valley is not supposed to be:

- a 3D benchmark
- a technical scene
- a generic fantasy village
- a collection of isolated screens
- a dashboard rendered in 3D

It is supposed to feel like a small mountain settlement that existed before the learner arrived and continues to exist after they leave.

The desired emotional sequence is:

1. "I have arrived somewhere peaceful."
2. "This place remembers me."
3. "There is more here than I can see immediately."
4. "I want to come back tomorrow."

---

# 10. Emerald Valley's visual identity

The world specification describes the visual identity as:

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

It should avoid:

- sterile UI
- neon sci-fi
- generic fantasy
- excessive saturation
- theme-park decoration
- empty procedural terrain
- visual noise
- unnecessary photorealism

The world should feel beautiful because its composition is good, not because every object is technically complex.

---

# 11. 2D + 2.5D + 3D + Hybrid

A major architectural decision is that GoPAL should **not force everything into 3D**.

The world intentionally supports different representations.

### 2D

Useful for:

- atmospheric art
- illustrations
- UI
- special scenes
- distant visual storytelling
- situations where flat art is simply better

### 2.5D

Useful for:

- mountains
- background forests
- clouds
- atmospheric depth
- distant scenery

### 3D

Useful for:

- locations that can be inspected
- interactive environments
- objects that require changing camera angles
- characters
- meaningful physical spaces

### Hybrid

Used when mixing representations produces the strongest experience.

The rule is:

> **Use the representation that makes the world feel best, not the representation that sounds most technically impressive.**

---

# 12. World geography

Emerald Valley is designed as one connected valley rather than separate scenes.

The canonical structure includes:

- mountain approach
- railway entry
- valley floor
- stream
- footpaths
- café
- market
- library
- sanctuary/garden
- railway tunnel
- mountain continuation
- home/study spaces

The geographic hierarchy is intentionally:

1. sky
2. distant mountains
3. treeline
4. valley terrain
5. stream and major paths
6. buildings
7. NPCs/railway
8. props
9. interactions
10. UI

The UI should never compete visually with the world.

---

# 13. The Suzu Stream

The stream is intended to be one of the valley's geographic and emotional spines.

It should:

- connect locations
- help the learner understand the geography
- provide movement and visual rhythm
- react to lighting
- feel alive
- change subtly with weather

It is not merely decoration.

A good world landmark should help the learner build a mental map.

---

# 14. Time, weather and seasons

The environment is designed to respond to time and world state.

The repository contains time/environment logic for:

- morning
- afternoon
- evening
- night
- spring
- summer
- autumn
- winter
- weather states

Time can affect:

- lighting
- atmosphere
- world presentation
- NPC routines
- opportunities
- Cassidy behavior
- audio
- visual ambience

The goal is that returning at a different time does not feel like opening the same static screen with a different label.

---

# 15. World continuity

One of the most important systems is continuity between sessions.

The current runtime includes a bridge between persisted world state and living simulation.

The basic model is:

```
last active state
      ↓
elapsed time
      ↓
world simulation advances
      ↓
environment/state is resolved
      ↓
new state is persisted
      ↓
return experience is generated
```

This enables concepts such as:

- a new day
- a new season
- a changed environment
- changed revisit context
- new eligible opportunities
- evolving world state

The system is intentionally bounded.

GoPAL should **not fake major events** that supposedly happened entirely while the learner was absent.

Continuity must remain:

- deterministic enough to reason about
- persistent
- explainable
- bounded
- emotionally believable

---

# 16. The world is meant to remember places

The world runtime contains concepts such as:

- visit count
- last visited time
- discovered events
- residents associated with places
- world snapshots
- seen events
- relationship state

This creates the foundation for a future where a location can gradually become personally meaningful.

A café should not always be "Café #4."

It should eventually become:

> "the café where I practiced ordering matcha with Ren."

That distinction is central to GoPAL.

---

# 17. NPCs and residents

The world contains a significant resident/NPC architecture.

The engine layer includes systems for:

- resident routines
- resident actions
- resident relationships
- resident memory
- resident stories
- resident opportunities
- ambient behavior
- context reactions
- consequences
- route/navigation
- presentation
- animation
- destination residents
- NPC runtime

This suggests a long-term model where characters are not merely dialogue boxes.

They can have:

- locations
- routines
- relationships
- moods
- activities
- context
- memories
- reactions

The world should feel inhabited.

---

# 18. Learning inside the world

GoPAL's language-learning architecture is designed around **contextual learning**.

The repository contains engines for:

- adaptive conversation
- contextual language learning
- language capabilities
- evaluation
- learning needs
- conversation continuity
- word-bank answers
- world learning flow
- world learning integration
- world learning outcomes
- world learning responses
- world learning scenarios

The underlying idea is:

> **Use language because something is happening.**

Not:

> **Something is happening because the app needs to show a language question.**

---

# 19. Example: contextual conversation

The current tutor engine contains concrete scenario definitions such as:

### Café

A learner interacts with Barista Ren.

They practice:

- greetings
- ordering
- preferences
- polite language
- responding naturally

### Library

The learner interacts with Librarian Emi.

They practice:

- asking for books
- descriptions
- cultural vocabulary
- polite conversation

### Lantern Market

The learner interacts with Kenji.

They practice:

- asking prices
- ordering food
- quantities
- recommendations

These are important because the learning is attached to:

- a place
- a character
- a situation
- a purpose
- a cultural context

---

# 20. Tutor / AI conversation

The Tutor system is not supposed to remain isolated.

The current tutor architecture includes:

- scenario definitions
- dialogue turns
- phonetics
- translations
- expected concepts
- sample responses
- hints
- evaluation
- cultural insights
- follow-up suggestions

The intended future is a contextual tutor that knows:

- where the learner is
- what they are doing
- which lesson/experience they are in
- what the learner already knows
- relevant memories
- Cassidy's state
- world context

The Tutor should feel like part of the world rather than a separate chatbot product embedded inside it.

---

# 21. Experience Director

The Experience Director is one of the systems that makes GoPAL more than a menu.

It can compose a learner experience from:

- time of day
- world state
- Cassidy routine
- learner intention
- session duration
- current context

Supported intent categories include:

- focus
- adventure
- conversation
- relax
- challenge
- creative
- surprise me

The system can generate a bounded session plan containing:

- title
- subtitle
- destination
- reason
- steps
- scenario
- activity types

This supports an important product principle:

> **The learner should not always have to decide what to do next from a giant menu.**

The world can gently suggest a meaningful next thing.

---

# 22. Natural-language world direction

The project README describes a "Natural Language World DJ."

The long-term idea is that the learner can express intent naturally, and GoPAL can translate that intent into an experience.

For example:

> "I only have five minutes and want to practice speaking."

could become a short contextual conversation.

Or:

> "I want something relaxing."

could lead to:

- a quiet study space
- ambient audio
- a light review
- Cassidy's observations
- no-pressure interaction

The interface should increasingly adapt to the learner rather than forcing the learner to understand the application's internal structure.

---

# 23. Cassidy — the heart of GoPAL

Cassidy is explicitly defined in the repository's character bible as:

> the learner's constant companion and the emotional bridge between learning, exploration, memory, quests, and the living world.

She is not a mascot.

She is not a generic NPC.

She is not merely a chatbot persona.

She is one of the product's central continuity mechanisms.

---

# 24. Cassidy's personality and presence

Cassidy is intended to feel:

- warm
- intelligent
- adventurous
- curious
- playful
- emotionally expressive
- observant
- supportive
- connected to the world

Her behavior should be contextual.

She may:

- help when the learner struggles
- celebrate success
- notice a discovery
- suggest something without forcing it
- join a relevant experience
- wander or live independently
- give the learner space
- react to weather or location
- reference meaningful shared history

The system explicitly contains a distinction between Cassidy acting and Cassidy giving the learner space.

That matters.

A believable companion should not constantly interrupt.

---

# 25. Cassidy's relationship with the learner

The intended relationship should grow through:

- lessons
- conversations
- exploration
- discoveries
- world events
- letters
- festivals
- study visits
- memories
- shared activities
- companion objects such as the bonsai
- meaningful moments

Relationship should not simply be:

```
friendship = 74
```

Instead, the learner should eventually feel:

> "Cassidy knows me because we've actually experienced things together."

The underlying data can contain relationship state, but the product should communicate the relationship through behavior and shared history rather than a visible "relationship score" whenever possible.

---

# 26. Cassidy's visual identity

The repository contains a dedicated Cassidy production system and canonical visual references.

There are:

- portrait references
- full-body references
- turnaround references
- companion references
- master showcase art
- character production specifications
- renderer contracts
- asset registries
- production validation
- 2D runtime contracts
- 3D production tooling

Cassidy's visual identity is intended to remain consistent across:

- 2D
- 2.5D
- 3D
- portrait
- full-body
- conversational presentation
- world presentation
- future production formats

The character should feel like the same person everywhere.

---

# 27. Cassidy's animation philosophy

Cassidy should be alive without being constantly animated for the sake of animation.

The character bible calls for things such as:

- idle
- walking
- running
- turning
- sitting
- talking
- gestures
- pointing
- celebrating
- thinking
- reacting
- greeting
- listening
- discovering
- remembering
- reflecting
- playful surprise

The desired animation language is subtle.

Important moments can take control of the character temporarily, but normal life should include breathing, gaze, small movement and context-sensitive behavior.

---

# 28. Memory

Memory is a foundational system rather than an optional feature.

The memory engine supports layers such as:

- profile
- learning
- conversation
- character
- world
- story
- progress
- preference
- achievement
- session

The database contains persistent memory records.

This allows the architecture to distinguish different kinds of "remembering."

For example:

### Learning memory

The learner struggled with a particular concept.

### Character memory

Cassidy remembers a meaningful shared experience.

### World memory

The learner has visited a particular place several times.

### Story memory

The learner experienced a story event.

### Preference memory

The learner prefers a certain experience style.

This is much closer to a personal world model than a simple chat history.

---

# 29. Persistent data model

Supabase currently defines structures for:

- profiles
- learner preferences
- worlds
- locations
- world state
- world events
- environment objects
- characters
- character state
- character relationships
- character-memory links
- memories
- conversation memories
- object memories
- time capsules
- knowledge items
- knowledge mastery
- learning sessions
- mistakes
- explanation preferences
- conversations
- conversation turns
- pronunciation attempts
- and related progression/collection data

This means the intended system is not merely stateless AI generation.

It is a persistent application state model.

---

# 30. Local-first resilience

The codebase contains both:

- Supabase persistence
- local storage fallbacks

The World Engine and Memory Engine, for example, can operate against local state when Supabase is not configured or unavailable.

This is valuable for a product whose core promise is continuity.

The learner's basic experience should not collapse simply because a remote service is unavailable.

---

# 31. Journey

Journey is the learner's personal record of their time in GoPAL.

The repository includes:

- Journey Book
- Living Journey
- Conversation Archive
- Quest Shop
- Time Capsules
- Memory Museum

The long-term purpose is to transform progress into a personal history.

Instead of only showing:

> "You completed 37 lessons."

the learner should eventually be able to see:

> "This is what I experienced."

---

# 32. Conversation Archive

The project includes conversation-history concepts designed to preserve learning moments.

These can include:

- dialogue
- phonetics
- translations
- evaluations
- context

The archive turns conversations into reusable learning memories rather than disposable chat messages.

---

# 33. Time Capsules

Time Capsules are intended to let learners preserve something for their future selves.

A learner can create a message and associate it with a future milestone.

This is important because it shifts progress from:

> "I earned another reward."

toward:

> "I left something for the person I am becoming."

---

# 34. Memory Museum

The Memory Museum is a presentation layer for accumulated experiences.

The repository supports categories such as:

- postcards
- learner creations
- cultural artifacts/keepsakes
- canonical memories/exhibits

The museum should become a visual history of the learner's world.

It should answer:

> **What have I experienced here?**

rather than:

> **How many points have I earned?**

---

# 35. Discoveries

The project contains a Discovery/Constellation concept.

Discoveries are intended to connect:

- places
- objects
- culture
- learning
- memories
- stories

The learner should gradually uncover connections.

A discovery can therefore be more meaningful than a conventional unlock.

---

# 36. Study Room experiences

The Study Room is unusually rich for a learning environment.

The repository includes systems/components for:

### Living Bonsai

A persistent plant with growth stages.

The plant can become a quiet visual representation of continuity.

### Matcha Crafting

A contextual activity involving:

- measuring
- pouring
- temperature
- whisking

This can become a language/culture interaction rather than a generic mini-game.

### Calligraphy

A stroke-order and brush interaction space.

### Pitch Accent Shadow Trainer

A focused pronunciation/cadence practice experience.

### Soundscape Mixer

Ambient audio channels can include:

- rain
- lo-fi
- vinyl crackle
- wind chimes

### World Radio

Ambient stations help make the environment feel like a place rather than a silent exercise screen.

---

# 37. Audio

The codebase contains an Audio Engine plus world audio contracts, profiles and runtime/navigation systems.

Audio is treated as part of environment design.

The intended principle is:

> **You should be able to feel a location before interacting with it.**

Audio can support:

- rain
- wind
- environmental ambience
- music
- radio
- world-specific atmosphere
- activity-specific sounds
- transitions

Audio should be contextual rather than a permanent generic soundtrack.

---

# 38. World interaction

The learning/world feature layer contains a large interaction vocabulary.

Examples include:

- hotspots
- object inspection
- investigations
- story choices
- crafting
- rhythm
- drag/drop
- answer controls
- discovery marks
- memory marks
- environmental interactions
- resident conversations
- destination exploration
- world consequences

This is the foundation for a world where learning can happen through actions rather than only through text questions.

---

# 39. Cultural learning

Culture is intended to be embedded into the environment.

The repository includes concepts such as:

- cultural wonder prompts
- objects
- food
- festivals
- calligraphy
- matcha
- architecture
- locations
- historical material
- cultural artifacts
- world-specific conversations

The goal is not:

> "Here is a culture fact. Memorize it."

It is:

> "You are somewhere. You encounter something. You become curious. The language and culture help you understand what you are seeing."

---

# 40. Language worlds

The architecture includes language-world data and location systems.

The current code specifically contains language-world handling for Japanese and French, with broader support designed into the world model.

A language world can have:

- canonical identity
- locations
- culture
- residents
- learning opportunities
- travel
- visual presentation
- conversations
- discoveries

The home world and language worlds should eventually share the same core world architecture rather than becoming separate apps.

---

# 41. Travel and Passport

The feature-preservation contract explicitly protects the Passport concept.

Passport is intended to become a living travel/learning record containing things such as:

- regions discovered
- language/culture encounters
- stamps or memories
- places visited
- milestones
- quests
- discoveries
- collectible artifacts

Passport should connect to world/travel state.

It should **not become another independent progression system**.

---

# 42. Quests and economy

The project contains Quest and Economy engines.

The purpose of these systems should be to give experiences context and motivation.

Good examples:

- help a resident
- explore a location
- practice a language skill
- discover an object
- participate in a festival
- complete a creative activity
- revisit a meaningful place

Economy/reward systems can provide:

- collectibles
- seeds
- fertilizers
- decorations
- souvenirs
- artifacts
- other world items

But the economy should support the world, not become the reason the learner returns.

---

# 43. Progression

GoPAL still contains progression concepts.

The important product decision is how progression is presented.

The project should avoid multiple competing versions of:

- XP
- streak
- hearts
- mastery
- currency
- progression

The long-term target is one coherent progression model.

Progress should be visible through:

- capability
- remembered experiences
- unlocked places
- world changes
- relationships
- discoveries
- story
- collections
- personal history

Numbers can exist underneath the experience without becoming the experience.

---

# 44. Knowledge and mastery

The Knowledge Engine and database support learning concepts such as:

- vocabulary/knowledge items
- meanings
- examples
- cultural notes
- relationships between items
- mastery score
- last seen
- next review
- proficiency

This gives GoPAL a real learning foundation beneath the world.

The world is not meant to replace educational quality.

It is meant to make educational practice more meaningful.

---

# 45. Event system

The repository contains an Event Bus connecting systems.

This is important because GoPAL is designed around consequences.

A meaningful event can affect:

- world state
- Cassidy
- memories
- journey
- learning
- quests
- relationships
- presentation
- audio
- progression

For example:

```
Learner completes a conversation
        ↓
Learning outcome
        ↓
Event emitted
        ├── memory recorded
        ├── Cassidy reacts
        ├── quest progress changes
        ├── world state can change
        ├── journey entry can be created
        └── future recommendations can change
```

This is how separate engines can still create one experience.

---

# 46. Experience orchestration

The project has multiple layers of orchestration:

- Experience Director
- Event Bus
- World Runtime
- World Reactor
- Cassidy Runtime Bridge
- learning integration engines
- presentation adapters

The architectural intention is that no single UI screen should have to understand every subsystem.

Instead:

```
learner intent
      ↓
experience orchestration
      ↓
world + learning + character + memory
      ↓
presentation
```

---

# 47. World runtime vs presentation

One of the strongest architectural principles in the project is the separation between:

### State/Simulation

What is actually true in the world.

### Presentation

How that truth is rendered.

For example:

```
Cassidy
mood = calm
activity = reading
location = study_room
```

could eventually be presented through:

- current 2D renderer
- 2.5D scene
- 3D character
- future richer runtime
- different device form factors

The world state should not be permanently coupled to one renderer.

This is why the repository contains explicit visual/runtime contracts.

---

# 48. World visual systems

The world feature layer contains many visual components, including:

- world viewport
- terrain
- infrastructure
- landmarks
- residents
- player
- vehicles
- transport
- props
- depth layers
- environment
- atmosphere
- hotspots
- consequences
- visual runtime hosts
- world scene stages

These are not all separate worlds.

They are pieces of the same world presentation architecture.

---

# 49. Real asset pipeline

The repository contains a serious external-art pipeline.

It includes:

- world asset manifests
- source registries
- acquisition plans
- normalization scripts
- GLB validation
- visual representation validation
- runtime-promotion validation
- world pipeline validation
- audio validation
- asset reports

The repository also contains real external assets, including:

- mountainside terrain
- vegetation
- railway assets
- HDRI environment assets
- Blender source archives
- GLB models
- textures
- world manifests

The purpose is to move from placeholder world geometry toward a more convincing environment.

---

# 50. Asset philosophy

The project explicitly favors:

1. acquiring strong reusable assets
2. normalizing them
3. validating them
4. binding them to canonical world locations
5. promoting them into runtime
6. keeping the runtime world authoritative

This avoids a common failure mode:

> beautiful assets existing in the repository but never becoming part of the actual player experience.

---

# 51. Cassidy production factory

GoPAL contains a dedicated Python production factory for Cassidy.

It includes tooling for:

- mesh building
- materials
- hair
- facial rigging
- eyes
- gaze
- expressions
- animations
- LODs
- reference handling
- rigging
- staging
- export
- validation
- round-trip checking
- packaging
- evidence/checkpoints

This is effectively a small production pipeline inside the repository.

---

# 52. External art/engine tooling

The repository contains tooling/documentation for:

- Blender
- Godot
- Rive
- Spine
- Unreal

These should not be interpreted as five competing application runtimes.

They are production/lab tools that can contribute assets, animation or experimentation to the GoPAL world.

The runtime should remain coherent.

---

# 53. Validation philosophy

The repository contains validation scripts and GitHub Actions for:

- TypeScript
- Cassidy production
- world assets
- world GLBs
- world visual representations
- runtime promotion
- world pipeline
- world audio
- mini-game assets
- production manifests

The development workflow explicitly favors:

1. coherent implementation batches
2. local typechecking
3. pull-request validation
4. fixing failures
5. merging only when validation is healthy
6. release APK builds when the batch is ready

This is important because GoPAL is large enough that unvalidated changes can easily break systems far away from the screen being edited.

---

# 54. GitHub Actions

The repository includes workflows for areas such as:

- release APK builds
- Cassidy production
- remote art factory
- world asset acquisition
- world final validation
- world typechecking
- world modal verification

The current workflow policy intentionally keeps expensive builds from triggering on every direct change.

---

# 55. Documentation system

The repository contains a substantial product/design documentation layer.

Major categories include:

### Product

- project specifications
- development workflow
- implementation tracking
- feature preservation

### World

- Emerald Valley master specification
- world integration
- world assets
- world animation
- world audio
- world learning
- mini-games
- verification
- external art pipeline

### Cassidy

- character bible
- visual design
- canonical reference
- production phases
- renderer contracts
- asset contracts
- integration gates
- runtime validation
- 2D/3D production

This means the repository is not only source code.

It is also the evolving design memory of the project.

---

# 56. The most important distinction: current state vs North Star

GoPAL currently contains more architecture than the final player experience can expose cleanly.

There are:

- mature systems
- partially integrated systems
- experimental systems
- dormant foundations
- older implementations
- parallel implementations
- production tooling
- future-oriented architecture

Therefore:

> **A file existing does not mean the feature is complete.**

And:

> **A feature not currently visible does not mean it should be deleted.**

The repository's preservation contract explicitly says existing features should be classified before removal.

The preferred classifications are:

1. Keep + integrate
2. Keep but reshape
3. Keep dormant
4. Remove only with evidence

---

# 57. Preservation rule

A core project rule is:

> **Do not delete an existing feature simply because it is not currently visible.**

Before removal, establish:

- what it does
- where it is implemented
- whether users derive value from it
- whether another system replaces it
- whether data migration is required
- whether the replacement preserves the original intent
- why keeping it would make GoPAL worse

The project should prefer:

- integration
- refactoring
- deprecation
- archiving
- consolidation

before deletion.

---

# 58. Why the project is intentionally large

At first glance, a 600+ file repository can look excessive.

But GoPAL is trying to solve several problems at once:

### Educational system

The learner needs real language learning.

### World system

The learner needs somewhere to practice.

### Character system

The learner needs relationships.

### Memory system

The learner needs continuity.

### Simulation system

The world needs to change.

### Presentation system

The world needs to look and sound alive.

### Production system

Assets and characters need to be created and validated.

### Persistence system

The learner's world needs to survive sessions.

The challenge is not merely having all of these systems.

The challenge is making them behave like **one product**.

---

# 59. The ideal GoPAL session

A future ideal session could look like this:

### 1. Return

The learner opens GoPAL.

The current environment is resolved.

Maybe it is:

> early evening, autumn, light rain.

### 2. Recognition

The learner sees Emerald Valley.

The world looks different from the previous session.

Cassidy is somewhere nearby.

### 3. Continuity

A small return moment appears:

> "The valley has been raining all afternoon."

No fake story is invented.

### 4. Invitation

The world contains a natural opportunity.

Perhaps Cassidy is at the café.

### 5. Choice

The learner can:

- talk
- explore
- study
- travel
- relax
- inspect something
- follow a quest

### 6. Learning

The learner ends up practicing language because they are doing something meaningful.

### 7. Reaction

Cassidy responds to the result.

A resident remembers the interaction.

### 8. Memory

A meaningful event is stored.

### 9. World consequence

Something small may change.

A discovery appears.

A quest progresses.

A place becomes more familiar.

### 10. Departure

The learner leaves.

The state is saved.

### 11. Return later

The learner comes back and the experience continues.

That is the fundamental GoPAL loop.

---

# 60. The emotional progression over months

GoPAL should become more meaningful the longer someone uses it.

### Day 1

> "This is interesting."

### Week 1

> "I know this place."

### Month 1

> "I recognize these people."

### Month 3

> "This world remembers what I've done."

### Month 6

> "I've built a history here."

### Long term

> **"This is my learning world."**

That is a much stronger retention mechanism than simply increasing rewards.

---

# 61. The role of surprise

The world should contain controlled surprises.

Examples include:

- an unexpected conversation
- a new opportunity
- a seasonal event
- a new discovery
- Cassidy remembering something
- a resident behaving differently
- a location revealing something on a revisit
- a cultural object prompting curiosity
- a small environmental change

But surprise should not become randomness for its own sake.

The best surprises are:

> **unexpected but meaningful.**

---

# 62. The role of mystery

Long-term GoPAL can use mystery to encourage exploration.

A learner may notice:

- an object they cannot yet explain
- a location that changes
- a recurring character
- an unusual cultural artifact
- a hidden interaction
- a story thread
- a strange world event

The goal is not to make the learner grind to uncover lore.

It is to create the feeling:

> "There is more here."

---

# 63. The role of culture

Culture should not be a textbook pasted onto the world.

It should appear through:

- objects
- architecture
- food
- conversations
- festivals
- music
- rituals
- locations
- stories
- language choices

The learner should become curious first and learn because they want to understand what they encountered.

---

# 64. The role of gamification

Gamification is allowed.

But it is not the soul of GoPAL.

Useful mechanics include:

- quests
- collectibles
- souvenirs
- seeds
- decorations
- mastery
- milestones
- discoveries

The rule is:

> **Rewards should reinforce meaning, not replace meaning.**

A learner should want to revisit the world even if the reward counter disappeared.

---

# 65. The role of AI

AI should make the world more responsive.

It can support:

- conversation
- contextual explanations
- adaptive learning
- recommendations
- Cassidy behavior
- personalized experiences
- memory interpretation
- world opportunities
- language feedback

But AI should not be allowed to destroy continuity.

Cassidy should not suddenly change personality.

The world should not contradict established facts.

The system should distinguish:

- canonical state
- generated conversation
- temporary suggestions
- persistent memories

---

# 66. Canonical truth

As the project grows, the most important architectural discipline is maintaining canonical sources of truth.

There should be one authoritative representation for:

- world identity
- locations
- characters
- major state
- Cassidy identity
- assets
- relationships
- learning outcomes
- progression

Different UI surfaces may render the same truth differently.

They should not invent their own competing versions.

---

# 67. The project architecture in one diagram

Conceptually, the project is moving toward:

```
                         LEARNER
                            |
                            v
                  EXPERIENCE DIRECTOR
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
       WORLD             CASSIDY           LEARNING
       ENGINE             SYSTEM             ENGINE
          |                 |                 |
          +-----------------+-----------------+
                            |
                            v
                      EVENT BUS
                            |
       +------------+-------+-------+------------+
       |            |               |            |
       v            v               v            v
    MEMORY       JOURNEY         QUESTS       KNOWLEDGE
       |            |               |            |
       +------------+-------+-------+------------+
                            |
                            v
                   PERSISTENT STATE
                            |
                            v
                2D / 2.5D / 3D / HYBRID
                            |
                            v
                       THE WORLD
```

The learner should experience this as one coherent system.

---

# 68. Current important code areas

The most important source areas currently include:

## `src/engines/`

The behavior layer.

Important groups:

- `cassidy/`
- `world/`
- `learning/`
- `memory/`
- `tutor/`
- `journey/`
- `knowledge/`
- `quest/`
- `economy/`
- `audio/`
- `director/`
- `events/`

The world engine group is currently the largest engine area.

## `src/features/`

Player-facing feature composition.

Important groups:

- Cassidy
- characters
- discoveries
- home
- journey
- learning
- settings
- study
- world

## `src/characters/`

Canonical Cassidy and character contracts, visual identity, runtime integration and production logic.

## `src/components/`

Shared presentation components such as:

- ambient background
- Cassidy
- living companion
- living world pulse
- error boundary
- production renderer

## `src/lib/`

Core persistence/support infrastructure:

- local store
- wave store
- events
- memory
- mastery
- storage
- time
- Supabase client
- types
- randomness

## `supabase/`

Database schema and migrations.

## `assets/`

World, Cassidy and application visual assets.

## `factory/`

Cassidy production/art factory.

## `scripts/`

World and asset acquisition/validation automation.

## `tools/`

External production tooling integrations.

## `docs/`

Product and implementation memory.

---

# 69. What the current code proves

The current repository provides strong evidence that GoPAL is already implementing the following architectural ideas:

- world-first navigation
- Emerald Valley
- persistent world state
- time/environment state
- world simulation
- revisit tracking
- contextual learning
- tutor scenarios
- Cassidy presence
- Cassidy autonomy
- Cassidy production pipeline
- memory
- journey
- study environment
- cultural interactions
- world opportunities
- quests/economy foundations
- audio
- 2D/2.5D/3D presentation infrastructure
- external world assets
- validation pipelines
- Supabase persistence
- local persistence fallback

These are not merely abstract ideas in the documentation.

They have corresponding source, data, assets or tooling in the repository.

---

# 70. What is still a design/architecture target

Some ambitions remain broader than what a current production build necessarily exposes.

Examples include:

- a completely seamless world where every feature is physically represented
- deeply autonomous residents across every location
- fully mature Cassidy relationship continuity
- complete multi-language travel worlds
- full 3D character/world parity across every screen
- advanced personalized AI behavior
- a completely unified progression model
- every legacy feature reintegrated into the world
- all envisioned "living" systems operating together without duplication

These should be treated as the roadmap, not falsely described as finished.

---

# 71. What success looks like

GoPAL succeeds when a learner can use it without thinking about its architecture.

They should not think:

> "Now I am opening the tutor engine."

or:

> "Now I am entering the quest system."

or:

> "Now I am looking at a database-backed NPC."

They should think:

> "I wonder what Cassidy is doing."

> "Let's go to the café."

> "I want to practice speaking."

> "What's that object?"

> "I haven't been here in a while."

> "I remember this place."

That is the real abstraction boundary.

---

# 72. Product design rules

## Rule 1 — World first

When possible, place features inside the world.

## Rule 2 — Context over isolation

A learning interaction should have a reason to exist.

## Rule 3 — Memory over reset

Important experiences should leave traces.

## Rule 4 — Relationship over scores

Cassidy should feel like a person, not a progress bar.

## Rule 5 — Discovery over clutter

Let the learner uncover things instead of presenting every system immediately.

## Rule 6 — Calm over pressure

The app should support relaxed sessions as well as focused practice.

## Rule 7 — Surprise over repetition

The world should have controlled variation.

## Rule 8 — Persistence over illusion

Only claim changes that the system can actually justify.

## Rule 9 — One source of truth

Avoid parallel state models.

## Rule 10 — Preserve before deleting

Existing product ideas must be understood before they are removed.

## Rule 11 — Technology serves experience

3D, AI, simulation, audio and production pipelines are means, not the product.

## Rule 12 — The learner owns the history

The accumulated world should increasingly feel personal.

---

# 73. The deepest idea behind GoPAL

The project is ultimately trying to change the basic model of educational software.

Traditional educational software asks:

> "What lesson should the learner complete?"

GoPAL wants to ask:

> **"What should happen in the learner's world today?"**

Traditional apps store:

- scores
- completed lessons
- streaks

GoPAL wants to store:

- places
- memories
- conversations
- discoveries
- relationships
- preferences
- world changes
- learning progress
- personal history

Traditional apps say:

> "Come back tomorrow to continue your course."

GoPAL should say:

> **"Come back tomorrow. Something in your world may be waiting for you."**

That is the product.

---

# 74. The ultimate GoPAL experience

At full maturity, GoPAL should feel like a combination of:

- a language school
- a cozy personal world
- an exploration game
- a cultural atlas
- an AI tutor
- a persistent companion
- a personal journal
- a memory museum
- a living simulation
- a creative space

But the learner should never experience these as separate products.

They should experience:

> **GoPAL.**

A place.

A world.

A learning journey.

A relationship.

A history.

---

# 75. One-sentence definition

If someone asks, "What is GoPAL-AI?", the best current answer is:

> **GoPAL-AI is a persistent AI-powered living world where language learning, exploration, culture, companionship, memory and personal progression become one continuous experience.**

---

# 76. One-paragraph definition

GoPAL-AI is a world-first language-learning platform built around the idea that education becomes more meaningful when it happens inside a place the learner can care about. The learner enters persistent worlds such as Emerald Valley, interacts with residents and the companion Cassidy, practices language through contextual conversations and activities, discovers culture, explores locations, completes quests, builds memories, and sees the environment change over time. Underneath the experience is a modular architecture of world simulation, learning, memory, character autonomy, events, journey, knowledge, audio, persistence and production tooling. The long-term goal is not to make the largest language app or the most technically impressive 3D demo, but to create a world that feels personal enough that the learner genuinely wants to return to it.

---

# 77. Final North Star

Everything in GoPAL should ultimately answer one question:

> **Does this make the learner's world feel more alive, more personal, more meaningful, or more useful for learning?**

If yes, it belongs.

If it is technically impressive but makes the world less coherent, it should be reconsidered.

If it is a useful existing feature but currently disconnected, it should be integrated before being discarded.

If it is not ready, it can remain dormant.

The objective is not to finish every file.

The objective is to make the entire system converge toward one experience:

# **A world worth returning to.**

---

## Related project documents

The repository currently contains more detailed specifications for specific areas. Important references include:

- `docs/project-specifications.md` — master product vision and experience blueprint
- `docs/feature-preservation-and-world-integration.md` — preservation and integration rules
- `docs/EMERALD_VALLEY_WORLD_MASTER_SPEC.md` — canonical Emerald Valley world specification
- `docs/cassidy-master-character-bible.md` — Cassidy visual/character identity
- `docs/CASSIDY_PRODUCTION_FACTORY.md` — Cassidy production pipeline
- `docs/DEVELOPMENT-WORKFLOW.md` — development and CI workflow
- `docs/world-phase-current-audit.md` — current world implementation audit
- `docs/world-learning-variety-blueprint.md` — contextual learning variety
- `docs/world-audio-system.md` — world audio direction
- `supabase/schema.sql` — persistent data model

---

## Maintenance rule for this document

This file is a **living project overview**.

Update it when the project's fundamental identity, architecture, player experience or North Star changes.

Do not turn it into a changelog.

Use it to answer:

- What is GoPAL?
- Why does it exist?
- What does it contain?
- How should it feel?
- How do the systems fit together?
- What is implemented?
- What is the intended direction?
- What must future contributors protect?

For detailed implementation truth, inspect the source code and the specialized documents linked above.
