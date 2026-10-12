# GoPAL-AI Master Blueprint
## A living sanctuary for language, memory, companionship and discovery

**Repository:** [jamlove1318-lab/GoPAL-AI](https://github.com/jamlove1318-lab/GoPAL-AI)  
**Blueprint date:** 12 October 2026

## 1. North star — a place to return to

GoPAL-AI should feel less like a checklist app and more like a living place where a learner is known, welcomed and gently invited back.

> “My world continued. Cassidy remembers what matters. I can explore and practice without being judged by a streak.”

Learning is the purpose; world, character, story and atmosphere make practice meaningful.

**Design principles**
- Continuity over resets.
- Curiosity over obligation.
- Relationship over score.
- Context over disconnected drills.
- Small meaningful surprises over noisy notifications.
- Agency over rigid paths.
- Honest memory over simulated intimacy.

## 2. Illustrated experience model

```text
                         LEARNER
                            |
                    Intent + current mood
                            v
                  EXPERIENCE DIRECTOR
                    /      |       \
                   v       v        v
               LEARNING  CASSIDY  EMERALD VALLEY
                   \       |        /
                    \      v       /
                  TYPED EVENTS + MEMORY
                            |
                  JOURNEY / FUTURE VISIT
                            |
                  World responds over time
```

The learner should not need to navigate this architecture. Every interaction should answer: **Where am I? Why is this happening now? What can I do next?** Use one primary action, a few meaningful secondary choices and optional detail.

## 3. Emotional rhythm and re-entry

1. **Arrival:** time-aware greeting, subtle environmental change and a concise “while you were away” recap only when something meaningful happened.
2. **Invitation:** offer options suited to intent and energy—talk, study, explore, create, revisit a memory or simply spend a moment in the sanctuary.
3. **Engagement:** language practice emerges naturally from the chosen activity. Feedback is specific, kind and actionable.
4. **Consequence:** Cassidy, a resident, a plant or a location remembers the outcome and changes in a coherent way.
5. **Departure:** save context and offer a soft stopping point. Recover unfinished activities without guilt or punishment for absence.

The app should never make a learner feel they failed by being away.

## 4. Visual direction — Emerald Valley

**Mood:** a warm, cinematic illustrated sanctuary with emerald greens, jade accents, sunlit wood, paper, stone, water, lantern light and seasonal color. It should feel tactile, inhabited and slightly mysterious.

**Environmental storytelling**
- Cool dawn, warm morning, golden late afternoon and lantern-lit evening.
- Rain-softened light, seasonal shifts and festival accents.
- Layered foreground, midground and background; readable silhouettes and gentle depth.
- Subtle movement and clear touch targets, not constant particles or a noisy game HUD.
- Readable UI typography; expressive display typography reserved for chapters and landmarks.
- Respect contrast, scalable text, localization and reduced-motion preferences.

**Audio:** location-specific ambience and optional music layers, independent volume controls, ducking, mute, sleep-friendly defaults and offline fallback. Never surprise the learner with loud playback.

## 5. Learning — meaningful language in context

### Adaptive conversation
Infer level, intent, recent errors and confidence; choose a scenario where language matters. Learners control hints, difficulty and correction intensity.

### Socratic roleplay
Ask questions that help learners think and respond instead of always revealing the answer first. Offer a model answer or translation when requested.

### Residents as learning partners
Residents have roles, routines, preferences and continuity. They are people in the world, not merely decorative chatbot wrappers.

### Pronunciation and listening
Pitch/prosody step-through, shadowing, replay, slower audio, syllable highlighting and comparison. Be transparent about recognition confidence and never overstate automated pronunciation accuracy.

### Writing and calligraphy
Stroke-order guidance, brush/canvas practice and saved creations. Explain language patterns and allow retries rather than simply marking answers wrong.

### Vocabulary and spaced recall
Capture useful words from scenes, attach context and difficulty, schedule revisits and measure retention over time—not raw taps.

### Evaluation and Journey
Combine comprehension, productive use, recall, fluency and self-reported confidence. Separate formative feedback from a single opaque score. Save dialogue with script, phonetics/romaji where useful, translation and replayable audio drills. Show “then vs now” only with learner consent.

## 6. Cassidy — a companion, not a meter

Cassidy should have a consistent voice, boundaries, preferences, life rhythm and a relationship built through shared experiences.

**Conceptual layers**
- Identity and personality.
- Perception of learner and world context.
- Action and bounded autonomy.
- Interaction lifecycle.
- Learning reactions.
- World presence.
- Presentation and renderer.

Give each layer one documented responsibility with explicit inputs and outputs.

**Memory model:** separate session context, learner preferences, shared experiences, milestones and world facts. Save only useful information, allow correction/deletion, and never pretend to remember an event that is absent from memory.

**Relationship expression:** a remembered joke, a letter, an invitation, a changed greeting, a festival memory or a companion plant—not a visible affection score.

**Autonomy:** low-pressure moments, respect for user intent, quiet mode, privacy and notification limits. Never create guilt for missed activity.

**Presentation:** one canonical identity/asset manifest, robust 2D fallback, consistent scale/lighting/animation, graceful loading/error states and validated renderer contracts. A production asset is not proof that runtime 3D is wired.

## 7. Emerald Valley — a world with continuity

Locations should have a distinct sensory identity, purpose, inhabitants, discoverable details and evolving state.

**World state dimensions:** day cycle, weather, season, festival, location familiarity, resident schedules, discovered lore, object state, activity outcomes and learner-created artifacts.

```text
CLOCK + ENVIRONMENT + LEARNER HISTORY
                 |
                 v
           EVENT DIRECTOR
                 |
        SCENE / RESIDENT / ACTIVITY
                 |
          LANGUAGE OPPORTUNITY
                 |
           LEARNER ACTION
                 |
        EVENT BUS + PERSISTENCE
                 |
       MEMORY + WORLD STATE CHANGE
                 |
          NEXT VISIT FEELS ALIVE
```

Objects should matter beyond collecting: a plant grows through care, a wish plaque preserves an intention, a landmark reveals new context, a resident changes a routine, and a familiar path gains details.

Discovery should be layered, not a grind. Offline state should remain coherent: local state and downloaded assets usable, queued sync safe, conflict rules deterministic, and learner creations never silently lost.

## 8. Activities in the living sanctuary

| Activity / surface | Experience intent |
|---|---|
| Home / Sanctuary | Greeting, environmental scene, continuity cards, relevant invitations and easy access to Study, World and Journey |
| Study | Roleplay, contextual drills, pitch/prosody, calligraphy, vocabulary recall, listening, transcript archive and creative tasks |
| World Map | Locations, resident profiles, familiarity, atmospheric transitions, lore inspection and clear discovered/accessible states |
| Living Bonsai | Care choices and visible growth; absences should not kill it or create guilt |
| Matcha workshop | Sequence, measurement, vocabulary and cultural context, with accessible alternatives to timed gestures |
| Soundscape / World Radio | Separate volumes, mute, optional ambience and sleep-friendly defaults |
| Ema wish ritual | Private intention with visibility control and optional reminders |
| Quests / souvenir shop | Optional narrative goals, seeds, fertilizer and artifacts that reward expression/discovery, not grinding |
| Creation Studio / Museum | Save/reopen learner work, postcards, cultural keepsakes and story memories with attribution and privacy controls |
| Journey | Personal timeline, dialogue, milestones and capability growth—not leaderboards |
| Settings / diagnostics | Memory/privacy, accessibility, storage health, asset/runtime checks and understandable errors |

Each activity must teach or express something, produce a meaningful consequence, and save/reopen reliably.

## 9. How systems work together

1. **Presentation layer:** screens, accessible components, Cassidy renderer and world scene. UI must not duplicate domain rules.
2. **Experience Director:** turns intent and context into a small set of useful choices and explains why an activity is suggested.
3. **Domain engines:** learning/tutor, Cassidy, world/environment, Journey/memory, audio, creation, knowledge and quest/economy. Each owns a narrow responsibility.
4. **Event bus:** typed events such as `LessonCompleted`, `ResidentConversationFinished`, `ObjectDiscovered`, `PlantCaredFor`, `MemorySaved` and `LocationVisited`.
5. **Memory/state services:** canonical schemas, consent boundaries, persistence adapters, migrations, offline queue and sync-conflict policy.
6. **Observability:** trace user action → director → engine → event → storage → rendered consequence. Redact private dialogue and secrets.

**Core product loop:** intent → activity → language use → feedback → meaningful outcome → memory/world change → later recall and re-entry.

## 10. Privacy, accessibility and trust

- Explain what is remembered, why it helps, and how to edit/delete/export it.
- Clarify local versus synced data and apply data minimization.
- Keep secrets server-side; validate Supabase row-level security. Never ship service-role keys in the mobile app.
- Support screen readers, sufficient contrast, scalable text, reduced motion, captions/transcripts, adjustable audio, adequate touch targets and alternatives to timed gestures.
- Provide quiet mode and optional reminders. Avoid streak shame, manipulative scarcity, forced comparison and deceptive AI-memory claims.
- Avoid raw private conversation logs in diagnostics; document retention and opt-in analytics where appropriate.

## 11. Roadmap and acceptance gates

### Phase 1 — Reliable foundation
Route inventory, build/typecheck, navigation smoke tests, state ownership, persistence contracts, error boundaries and offline restart.

### Phase 2 — One complete learning loop
Intent → contextual roleplay → feedback → transcript/vocabulary → later recall → visible growth in Journey.

### Phase 3 — Cassidy continuity
Canonical assets, tested memory boundaries, contextual reactions, predictable autonomy and 2D fallback.

### Phase 4 — Emerald Valley continuity
Environment clock, event director, resident routines, object state, activity outcomes and return-visit changes.

### Phase 5 — Activities and archive
Bonsai, matcha, calligraphy, audio, wishes, quests, creation and Museum; each saves/reopens and offers accessible alternatives.

### Phase 6 — Trust and polish
Performance budgets, asset size, battery/audio policy, localization, privacy controls, telemetry and regression suite.

**Acceptance gate for every feature:** reachable route; successful happy path; loading/error/empty states; persisted outcome; restart/re-entry behavior; accessibility; offline policy; automated test; documented owner.

## 12. Preservation rule and final principle

Do not delete ambiguous legacy systems. Trace references, archive or deprecate additively, compare behavior, and get explicit agreement before removal.

**GoPAL-AI should not ask the learner to maintain an app. It should invite them back into a place they care about.**

Success is meaningful language use, remembered context, a world that responds, a companion who feels consistent and a learner who notices their own growth. Build fewer disconnected features and more complete loops.
