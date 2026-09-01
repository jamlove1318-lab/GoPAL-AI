# GoPAL-AI — Cassidy System Completion Checklist

> **Purpose:** This is the single source of truth for completing Cassidy before the project moves to the next major system.
>
> **Branch:** `world-integration-work`
>
> **Main branch rule:** Do not merge or push Cassidy work to `main` until the user explicitly says the project is ready to build.
>
> **Completion rule:** Cassidy is NOT complete until every applicable item below is implemented, integrated, verified, and marked `[x]`. Documentation alone never counts as implementation.

---

## 0. Non-negotiable Cassidy identity

- [ ] Cassidy is a person-like autonomous companion inside the GoPAL-AI universe, not merely a tutor UI.
- [ ] Cassidy can have her own activities, interests, moods, memories, dreams, stories, discoveries, and plans.
- [ ] Cassidy can accompany the learner without requiring a learning task.
- [ ] Cassidy can choose not to interact when appropriate.
- [ ] Cassidy can exist anywhere the learner goes in the universe where the world provides a valid presence/anchor.
- [ ] Cassidy remains compatible with Emerald Valley as home and all current/future language worlds.
- [ ] Cassidy never replaces or collapses the existing world systems.

## 1. Character identity and personality

- [ ] Canonical Cassidy character definition is singular and reused everywhere.
- [ ] Personality traits are represented by data, not scattered hardcoded UI behavior.
- [ ] Core traits include curiosity, warmth, playfulness, patience, adventurousness, confidence, and future extensible traits.
- [ ] Cassidy has preferences/favorites that can evolve over time.
- [ ] Personality changes are gradual, bounded, explainable, and persistent.
- [ ] Personality changes affect future behavior/content selection.
- [ ] Personality does not randomly change in ways that contradict established memories or identity.
- [ ] Cassidy's mood is distinct from permanent personality traits.
- [ ] Mood can change without permanently rewriting personality.

## 2. First meeting / introduction

- [ ] First launch detects whether Cassidy has met the learner before.
- [ ] First meeting uses a dedicated cinematic experience.
- [ ] Cassidy introduces herself naturally and explains who she is.
- [ ] Cassidy explains that the learner has entered a living language universe.
- [ ] Cassidy explains that she can accompany the learner across worlds.
- [ ] Cassidy explains that she has her own life and activities.
- [ ] Introduction is paced as a cinematic, not a wall of onboarding text.
- [ ] Character entrance/exit animation is polished and reusable.
- [ ] Ambient world/environment animation participates in the introduction.
- [ ] Dialogue transitions are smooth.
- [ ] The learner can continue/skip safely without corrupting state.
- [ ] Completion is persisted exactly once.
- [ ] Returning users do not receive the full first-meeting sequence again.
- [ ] First meeting becomes a meaningful shared memory.
- [ ] Introduction versioning exists so future redesigned introductions can be migrated safely.

## 3. Presence and embodiment

- [ ] Cassidy has a reusable world-presence representation.
- [ ] Cassidy can be anchored to existing physical world locations/hotspots.
- [ ] Cassidy does not require a duplicate map system.
- [ ] Presence understands world ID, destination/location ID, and physical anchor where available.
- [ ] Presence can represent orientation/facing where the scene supports it.
- [ ] Presence can use existing animation infrastructure.
- [ ] Presence reacts to the environment where supported.
- [ ] Presence does not spawn at impossible/invalid locations.
- [ ] Cassidy can leave a location cleanly.
- [ ] Cassidy can wait at a location.
- [ ] Cassidy can move between supported locations.
- [ ] Cassidy's presence is restored correctly after reload.
- [ ] No duplicate Cassidy presence instance is created by multiple runtime paths.

## 4. Independent life simulation

- [ ] Cassidy has persistent life state separate from learner progress.
- [ ] Activity selection is autonomous and extensible.
- [ ] Existing activities are represented where useful: wandering, café, reading, watching rain, stargazing, dreaming, storytelling, adventure, helping, resting, discovering, celebrating.
- [ ] Additional activity types can be added without changing the core state contract.
- [ ] Activities have duration/transition semantics where needed.
- [ ] Cassidy can finish an activity naturally.
- [ ] Cassidy can transition between activities.
- [ ] Cassidy does not repeatedly choose the same activity without a reason/cooldown.
- [ ] Activity selection can consider time, weather, world, destination, personality, memories, recent activity, and context.
- [ ] Quiet behavior is supported.
- [ ] Cassidy can simply exist in the world without presenting a CTA.
- [ ] Cassidy's independent life continues without requiring the learner to open a Cassidy screen.

## 5. Time, weather, and environment

- [ ] Cassidy can consume existing time/environment data where available.
- [ ] Time of day can influence activity selection.
- [ ] Weather can influence activity selection/mood.
- [ ] Season/festival context can influence behavior where supported.
- [ ] Environmental reactions do not bypass existing world engines.
- [ ] Missing environmental data falls back safely.
- [ ] Cassidy's behavior remains deterministic/reproducible enough for debugging while retaining variety.

## 6. Long-term memory

- [ ] Cassidy uses the canonical memory system rather than creating a parallel memory database.
- [ ] Cassidy can remember important learner interactions.
- [ ] Cassidy can remember meaningful places and shared experiences.
- [ ] Cassidy can remember stories/adventures/discoveries when appropriate.
- [ ] Memory metadata identifies Cassidy-relevant context without corrupting canonical memory contracts.
- [ ] Duplicate memory creation is prevented.
- [ ] Memory writes are idempotent where required.
- [ ] Failed memory persistence is handled safely.
- [ ] Memory retrieval is bounded/ranked appropriately.
- [ ] Cassidy does not claim to remember information that was not actually persisted.
- [ ] Old/invalid memory records fail gracefully.

## 7. Personality evolution from memory and experience

- [ ] Meaningful interactions can influence personality traits.
- [ ] Repeated experiences can reinforce preferences.
- [ ] Strong experiences can create lasting but bounded changes.
- [ ] Personality evolution is persisted.
- [ ] Personality evolution is not triggered twice for one event.
- [ ] Learner choices can affect Cassidy's relationship/personality context where appropriate.
- [ ] Cassidy can develop favorite worlds/locations/activities from actual experience.
- [ ] Personality can influence future activity selection.
- [ ] Personality can influence tone/mood selection.
- [ ] Personality evolution never directly rewrites canonical learner progress.

## 8. Dreams

- [ ] Dreams are first-class Cassidy life moments.
- [ ] Dreams can be spontaneous.
- [ ] Dreams can be influenced by memories.
- [ ] Dreams can be influenced by places/worlds.
- [ ] Dreams can be influenced by Cassidy's current personality/mood.
- [ ] Dreams have persistent records where appropriate.
- [ ] Dreams have reusable generation structure rather than one-off hardcoded scenes.
- [ ] Dream seeds/history prevent immediate repetition.
- [ ] Dreams can optionally lead to stories, discoveries, or adventures.
- [ ] Dream content does not falsely rewrite real world state.

## 9. Stories

- [ ] Cassidy can spontaneously tell stories.
- [ ] Stories can reference real shared memories when appropriate.
- [ ] Stories can be fictional without pretending they happened.
- [ ] Stories can branch where useful.
- [ ] Stories can become reusable content instances.
- [ ] Story history prevents pointless repetition.
- [ ] Stories can be associated with a location/world context.
- [ ] Stories can contribute to relationship/shared-memory context where appropriate.

## 10. Adventures

- [ ] Cassidy can initiate adventures.
- [ ] Adventures can be generated from reusable templates/primitives.
- [ ] Adventures can use existing world locations.
- [ ] Adventures can use fictional locations where appropriate.
- [ ] Adventures have explicit start/progress/completion state.
- [ ] Adventure completion consequences are exactly once.
- [ ] Adventures can produce discoveries, memories, rewards, quests, or world reactions through existing systems.
- [ ] Cassidy can abandon/pause/return to an adventure safely.
- [ ] Adventure generation avoids immediate repetition.

## 11. Conversation and emotional behavior

- [ ] Cassidy conversation uses the canonical conversation/AI path where applicable.
- [ ] No duplicate Cassidy response engine is introduced unnecessarily.
- [ ] Cassidy can respond to current location/context.
- [ ] Cassidy can respond to current mood.
- [ ] Cassidy can respond to relevant memories.
- [ ] Cassidy can react to learner choices.
- [ ] Cassidy can celebrate successes naturally.
- [ ] Cassidy can be curious about discoveries.
- [ ] Cassidy can be quiet when no response is needed.
- [ ] Conversation state survives transitions where appropriate.
- [ ] Conversation does not fabricate persistence.

## 12. Companion behavior

- [ ] Cassidy can accompany the learner.
- [ ] Cassidy can temporarily separate from the learner.
- [ ] Cassidy can wait for the learner.
- [ ] Cassidy can reunite with the learner.
- [ ] Cassidy can invite the learner into activities.
- [ ] Invitations have sensible cooldowns.
- [ ] Cassidy does not spam interruptions.
- [ ] Cassidy can notice meaningful world events.
- [ ] Cassidy can offer help without hijacking the learner's intended activity.
- [ ] Cassidy can lead the learner into optional content.
- [ ] Learner agency always remains intact.

## 13. World integration

- [ ] Cassidy integrates with the existing world engine.
- [ ] Cassidy integrates with existing destinations.
- [ ] Cassidy integrates with existing physical locations.
- [ ] Cassidy integrates with existing hotspots.
- [ ] Cassidy integrates with existing scene/animation systems.
- [ ] Cassidy integrates with existing world events.
- [ ] Cassidy integrates with existing quests where appropriate.
- [ ] Cassidy integrates with festivals where appropriate.
- [ ] Cassidy integrates with stories where appropriate.
- [ ] Cassidy does not turn real locations into mini-games by default.
- [ ] Real physical locations retain their resident-first learning design.
- [ ] Fictional locations can host broader adventure/game experiences.
- [ ] Cassidy can appear in both real and fictional locations without changing their fundamental learning rules.

## 14. Learning relationship

- [ ] Cassidy can support learning without replacing residents.
- [ ] Real-location residents remain the primary language-teaching interaction.
- [ ] Cassidy can explain, encourage, celebrate, or accompany.
- [ ] Cassidy can participate in optional learning activities when explicitly designed for it.
- [ ] Learning outcomes can influence Cassidy relationship context without coupling all learning completion to Cassidy.
- [ ] Cassidy does not make every interaction feel like a lesson.

## 15. Relationship and consequences

- [ ] Cassidy relationship state is persistent where such a system exists.
- [ ] Relationship consequences happen exactly once.
- [ ] Relationship changes use existing relationship infrastructure.
- [ ] Cassidy memory and relationship writes are not duplicated.
- [ ] Cassidy consequences do not accidentally complete destinations/worlds.
- [ ] Failed consequence persistence is handled safely.

## 16. Persistence and restoration

- [ ] First-meeting state survives restart.
- [ ] Life state survives restart.
- [ ] Personality survives restart.
- [ ] Relevant memories survive restart.
- [ ] Current Cassidy location survives/reconstructs safely.
- [ ] Current activity survives/reconstructs safely.
- [ ] Pending invitation/adventure state survives where required.
- [ ] Corrupt/missing persisted state has safe defaults/migration.
- [ ] Persistence keys are versioned.
- [ ] No migration destroys existing learner data.

## 17. Event architecture

- [ ] Cassidy events use the canonical typed event bus.
- [ ] No untyped Cassidy event path is introduced.
- [ ] Event payloads are type-safe.
- [ ] Events that can fire more than once are explicitly idempotent or deduplicated.
- [ ] Event listeners do not create feedback loops.
- [ ] Cassidy event handlers clean up subscriptions correctly.
- [ ] Autonomous activity does not accidentally trigger itself recursively.

## 18. AI/provider integration

- [ ] Cassidy uses the project's canonical AI response path.
- [ ] Cassidy does not introduce a competing provider stack without architectural justification.
- [ ] AI failures have deterministic fallbacks.
- [ ] Cassidy remains usable without live AI where static/fallback content is appropriate.
- [ ] AI-generated content cannot directly mutate protected world/progression state.
- [ ] Generated content is validated before entering typed domain state.
- [ ] Memory/context passed to AI is bounded and relevant.

## 19. Safety and content boundaries

- [ ] Cassidy content follows the app's intended audience and safety requirements.
- [ ] Cassidy does not pressure the learner into unwanted actions.
- [ ] Cassidy respects learner agency.
- [ ] Generated stories/adventures remain appropriate for the product.
- [ ] Emotional behavior remains supportive and non-manipulative.

## 20. UI/animation quality

- [ ] Cassidy has a reusable visual presence component.
- [ ] First-meeting animation is cinematic and polished.
- [ ] Idle animations exist where supported.
- [ ] Movement/entrance/exit transitions are smooth.
- [ ] Mood can influence expression/animation where assets support it.
- [ ] World/environment continues living behind Cassidy.
- [ ] Cassidy does not visually freeze while the world is active.
- [ ] Loading states do not expose broken/empty Cassidy state.
- [ ] Reduced-motion/accessibility behavior is respected where the app supports it.

## 21. Architecture integrity

- [ ] No duplicate Cassidy life state system exists.
- [ ] No duplicate Cassidy memory store exists.
- [ ] No duplicate Cassidy conversation engine exists.
- [ ] No duplicate Cassidy presence system exists.
- [ ] Existing useful Cassidy systems have been reused rather than replaced.
- [ ] Existing files have not been deleted.
- [ ] Deprecated/obsolete code is archived/deprecated rather than blindly deleted.
- [ ] Cassidy engines remain domain-focused.
- [ ] UI does not own Cassidy business logic.
- [ ] Cassidy state is not mutated through uncontrolled shared references.

## 22. Verification matrix

### Static verification

- [ ] TypeScript passes with zero errors.
- [ ] Relevant lint checks pass.
- [ ] No new circular dependency is introduced.
- [ ] No invalid event names/payloads remain.
- [ ] No duplicate state contracts remain.

### Behavioral verification

- [ ] Fresh user → first meeting works.
- [ ] Returning user → first meeting does not replay.
- [ ] Cassidy can appear in Emerald Valley.
- [ ] Cassidy can appear in Japan.
- [ ] Cassidy can appear in another language world.
- [ ] Cassidy can appear in a fictional location.
- [ ] Cassidy can perform a quiet activity.
- [ ] Cassidy can initiate a story.
- [ ] Cassidy can initiate an adventure.
- [ ] Cassidy can dream.
- [ ] Cassidy can remember a previous shared experience.
- [ ] Personality can evolve from an experience.
- [ ] Reload restores Cassidy correctly.
- [ ] Repeated events do not duplicate consequences.
- [ ] Cassidy does not hijack resident-first real-location learning.
- [ ] Cassidy does not spam invitations.
- [ ] Cassidy can leave and later return.

### Failure verification

- [ ] Missing world/location data does not crash Cassidy.
- [ ] Missing memory does not crash Cassidy.
- [ ] Failed AI generation has a fallback.
- [ ] Failed persistence has a safe failure path.
- [ ] Invalid generated data is rejected safely.
- [ ] Stale persisted Cassidy state migrates safely.
- [ ] Duplicate runtime initialization does not create duplicate Cassidy instances.

## 23. Final freeze gate

Cassidy may be declared **COMPLETE** only when:

- [ ] Every applicable checkbox above is `[x]`.
- [ ] All Cassidy-related TypeScript errors are fixed.
- [ ] All Cassidy-related CI checks are green.
- [ ] All Cassidy integration paths have been inspected.
- [ ] No known Cassidy duplicate runtime path remains.
- [ ] Persistence has been verified.
- [ ] Memory/relationship consequences have been verified exactly once.
- [ ] First meeting has been verified.
- [ ] Independent life has been verified.
- [ ] Dreams/stories/adventures have been verified.
- [ ] Personality evolution has been verified.
- [ ] World integration has been verified.
- [ ] The final Cassidy audit has been written below.
- [ ] Only then may the project move to the next major system.

---

# Cassidy Final Audit

**Status:** NOT COMPLETE

**Completed on:** _pending_

**Final verified commit:** _pending_

**TypeScript:** _pending_

**CI:** _pending_

**Persistence:** _pending_

**First meeting:** _pending_

**Independent life:** _pending_

**Memory:** _pending_

**Personality evolution:** _pending_

**Dreams:** _pending_

**Stories:** _pending_

**Adventures:** _pending_

**World integration:** _pending_

**Final decision:** _pending_

> Do not mark this document complete merely because the engines exist. Every capability must be connected to the actual application architecture and verified.
