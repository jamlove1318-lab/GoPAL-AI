# GoPAL-AI — Existing-System Completion Tracker

> **Purpose:** Track how much of the existing GoPAL-AI project has been verified, repaired, connected, and made functional before we introduce major new ideas.
>
> **Rule:** This is an implementation tracker, not a deletion plan. Existing files and systems must be preserved. Unused systems are candidates for integration, repair, or archival — never blindly deleted.
>
> **Blueprint rule:** The blueprint is a source of product direction and ideas. It is **not a mandatory checklist**. Only adopt blueprint ideas that materially improve the current GoPAL-AI experience.

---

## 1. Non-Negotiable Product Rules

- [x] Emerald Valley remains the home world.
- [x] App opens into the world/home experience rather than making a dashboard the primary experience.
- [x] Language worlds remain separate living worlds.
- [x] Japan has its own world/locations/residents/learning experience.
- [x] Real locations are used as the spatial experience.
- [x] Do **not** convert the world into a Duolingo-style linear node path.
- [x] Locations should behave like explorable places on a world/map scene.
- [x] World objects, buildings, landmarks, residents and discoveries can become interaction points.
- [x] Not everything is unlocked immediately.
- [x] Completing an interaction can reveal what becomes available next.
- [x] The world should remember meaningful completed discoveries.
- [x] Existing characters and animations must be reused where they already exist.
- [x] Existing systems must be improved/connected before creating replacements.
- [x] Do not delete the current project structure during this completion pass.
- [x] Blueprint ideas are optional improvements, not mandatory implementations.

---

## 2. Status Legend

- `DONE` — verified functional and connected.
- `PARTIAL` — exists and works in part, but has missing behavior or integration.
- `BROKEN` — exists but has a confirmed functional defect.
- `DISCONNECTED` — valuable implementation exists but the active UI/runtime does not use it.
- `VERIFY` — exists but still requires forensic verification.
- `IMPROVE` — functional enough to use, but needs UX/polish/quality improvements.
- `NOT NEEDED` — intentionally not implementing because it does not improve the current experience.

---

# 3. Completion Dashboard

| Area | Status | Current Goal | Remaining |
|---|---|---|---|
| App startup & persistence | PARTIAL | Restore the correct world/location reliably | Verify saved travel restoration |
| Emerald Valley home | PARTIAL | Make home the rich living-world entry | Audit all existing home interactions |
| Language worlds | PARTIAL | Use existing world infrastructure fully | Verify every world end-to-end |
| Real destinations | PARTIAL | Spatial location exploration | Connect existing location systems |
| Japan world | VERIFY | Preserve and fully activate existing implementation | Full forensic pass |
| Residents & characters | PARTIAL | Reuse existing residents/animations | Complete interaction handoff |
| World interactions | PARTIAL | Direct spatial interactions | Verify every interaction type |
| Progressive discovery | PARTIAL | Completion reveals meaningful next content | Test all dependency chains |
| Learning scenarios | PARTIAL | Every world interaction can lead to learning | Verify completion callbacks |
| Cassidy | PARTIAL | Companion with memory/adventure/dream behavior | Audit existing ecosystem |
| Memory | PARTIAL | Persistent meaningful memories | Verify storage/ranking/integration |
| Relationships | PARTIAL | Residents/characters remember relationship state | Verify persistence and rewards |
| Quests | VERIFY | Existing quests become playable | Full audit |
| Festivals | VERIFY | Existing festivals become visible/playable | Full audit |
| Special events | VERIFY | Existing event infrastructure becomes functional | Full audit |
| Rare travelling cart | VERIFY | Rare visitor/event/reward loop | Locate and activate existing implementation |
| Backpack | VERIFY | Real inventory experience, not a card | Full audit + UX improvement |
| Passport | VERIFY | Living travel/discovery record | Full audit + UX improvement |
| Museum | PARTIAL | Meaningful collection/memory space | Audit current implementation |
| Journey | PARTIAL | Travel between language worlds | Verify persistence and transitions |
| XP / Hearts / Streak | VERIFY | Shared progression across systems | Audit and unify |
| Rewards / Currency | VERIFY | Rewards have real consequences | Audit |
| Achievements | VERIFY | Achievements unlock naturally | Audit |
| Plants / Environment | VERIFY | World reacts to player progress | Audit |
| Weather / Time / Seasons | PARTIAL | Atmosphere affects world naturally | Verify runtime integration |
| Audio | VERIFY | World/learning audio systems are usable | Audit |
| Vocabulary / Grammar | VERIFY | Existing learning engines are reachable | Audit |
| Tutor | PARTIAL | AI tutor integrates with world learning | Audit |
| Save / Restore | PARTIAL | World history survives restart | Test every major state |
| Plugins / extensibility | VERIFY | Existing architecture remains usable | Audit |

**Estimated completion:** `~30%` of the existing-system integration/verification program.

> This percentage is intentionally conservative. It represents confirmed implementation work and verification, not the percentage of files that merely exist.

---

# 4. Phase A — Runtime Foundation

## A1. Startup

- [PARTIAL] App starts in the world experience.
- [PARTIAL] Emerald Valley is represented as home.
- [BROKEN/PENDING] Saved world presence restoration must be verified so a persisted journey is not silently forced back to home.
- [VERIFY] Startup hydration ordering.
- [VERIFY] Loading state and race conditions.
- [VERIFY] Cassidy snapshot hydration.
- [VERIFY] Living-world reactor startup.

### Acceptance criteria

- Fresh launch → Emerald Valley.
- Returning user with no active journey → Emerald Valley.
- Returning user with active journey → correct saved world/location.
- No black screen.
- No duplicate initialization.

---

# 5. Phase B — Emerald Valley Home World

Emerald Valley is the user's **home**, not merely another tab.

### Must verify

- [VERIFY] Living valley scene.
- [VERIFY] Home interactions.
- [VERIFY] Plants.
- [VERIFY] Environment.
- [VERIFY] Cassidy presence.
- [VERIFY] Home memories.
- [VERIFY] Home rewards.
- [VERIFY] Home quests.
- [VERIFY] Home special events.
- [VERIFY] Scroll organization.
- [VERIFY] World should occupy roughly 75–80% of the available visual space where the current screen layout permits it.

### Design constraint

Do **not** place every system as a row of cards on Emerald Valley. Important systems should emerge naturally through the living world, contextual controls, objects, buildings, companions, or carefully organized secondary panels.

---

# 6. Phase C — Language Worlds

Current architecture indicates separate language-world families. The existing system should remain the authority.

### Worlds to verify

- [VERIFY] Japanese world (`ja`).
- [VERIFY] Spanish world (`es`).
- [VERIFY] French world (`fr`).
- [VERIFY] Korean world (`ko`).

### For every world

- [VERIFY] World metadata.
- [VERIFY] Locations.
- [VERIFY] Location entrance.
- [VERIFY] Spatial map/scene.
- [VERIFY] Residents.
- [VERIFY] Character visuals.
- [VERIFY] Character animations.
- [VERIFY] Interactions.
- [VERIFY] Learning scenarios.
- [VERIFY] Completion.
- [VERIFY] Unlock/reveal progression.
- [VERIFY] Rewards.
- [VERIFY] Persistence.
- [VERIFY] Return to previous location.

---

# 7. Phase D — Japan World Deep Verification

Japan is the reference implementation because it already contains substantial world infrastructure.

### Locations to inspect

- [VERIFY] Kyoto.
- [VERIFY] Gion.
- [VERIFY] Shibuya.
- [VERIFY] Other existing Japan destinations found during repository inventory.

### For each location

- [VERIFY] Real-world visual identity.
- [VERIFY] Spatial positioning.
- [VERIFY] Hotspots.
- [VERIFY] Landmarks.
- [VERIFY] Residents.
- [VERIFY] Resident animation.
- [VERIFY] Resident approach interaction.
- [VERIFY] Learning scenario.
- [VERIFY] Memory result.
- [VERIFY] Reward result.
- [VERIFY] Next discovery.
- [VERIFY] Return-to-location behavior.

### Critical rule

The Japan implementation should be **completed and connected**, not replaced with a new generic destination system.

---

# 8. Phase E — Spatial Interaction Model

The desired model is **not** a linear Duolingo path.

```text
REAL WORLD LOCATION
        │
        ├── building
        ├── landmark
        ├── object
        ├── resident
        ├── hidden discovery
        └── path / area
                │
                ▼
          TAP / APPROACH
                │
                ▼
           ANIMATION
                │
                ▼
          INTERACTION
                │
                ▼
       LEARNING / STORY / EVENT
                │
                ▼
           COMPLETION
                │
                ▼
         WORLD REMEMBERS IT
                │
                ▼
       NEXT THING BECOMES AVAILABLE
```

### Required behavior

- [PARTIAL] Visible hotspots.
- [PARTIAL] Locked/revealed state.
- [PARTIAL] Dependency-aware progression.
- [PARTIAL] Reveal animation.
- [PARTIAL] Memory marker.
- [PARTIAL] Resident appearance.
- [PARTIAL] Resident approach.
- [BROKEN/PENDING] Resident completion must happen after the learning encounter, not merely when Approach is pressed.
- [VERIFY] Every hotspot kind.
- [VERIFY] Error/retry behavior.

---

# 9. Phase F — Residents & Characters

Existing character infrastructure must be reused.

### Verify

- [PARTIAL] Destination resident resolution.
- [PARTIAL] Resident presentation.
- [PARTIAL] Character view.
- [PARTIAL] Resident approach state.
- [VERIFY] Dialogue/conversation integration.
- [VERIFY] Learning integration.
- [VERIFY] Relationship updates.
- [VERIFY] Memory creation.
- [VERIFY] Rewards.
- [VERIFY] Completion callback.
- [VERIFY] Resident returns/changes after previous interactions.

### Acceptance criteria

A resident should feel like a person inside the world, not a card in a menu.

---

# 10. Phase G — Cassidy Ecosystem

Cassidy is not just a tab.

### Existing concepts to verify

- [VERIFY] Cassidy brain.
- [VERIFY] Context.
- [VERIFY] Decision system.
- [VERIFY] Learning.
- [VERIFY] Memory.
- [VERIFY] Relationship.
- [VERIFY] Companion presence.
- [VERIFY] Adventure stories.
- [VERIFY] Dreams.
- [VERIFY] World reactions.
- [VERIFY] User relationship progression.

### Safety/architecture

- [VERIFY] No uncontrolled mutation of shared state.
- [VERIFY] Single authoritative AI response path where appropriate.
- [VERIFY] Memory creation is not duplicated.
- [VERIFY] Relationship events are persisted correctly.

---

# 11. Phase H — Memory & Relationships

### Memory

- [VERIFY] Storage.
- [VERIFY] Error handling.
- [VERIFY] Duplicate prevention.
- [VERIFY] Metadata.
- [VERIFY] Ranking.
- [VERIFY] Integration scope.
- [VERIFY] World memories.
- [VERIFY] Learning memories.
- [VERIFY] Cassidy memories.
- [VERIFY] Resident memories.

### Relationships

- [VERIFY] Persistence.
- [VERIFY] Relationship progression.
- [VERIFY] Relationship rewards.
- [VERIFY] Memory creation.
- [VERIFY] Character behavior changes.

---

# 12. Phase I — Quests, Festivals & Events

These should be real playable systems, not decorative labels.

## Quests

- [VERIFY] Quest catalog.
- [VERIFY] Quest activation.
- [VERIFY] Quest objectives.
- [VERIFY] Quest completion.
- [VERIFY] Quest rewards.
- [VERIFY] Quest persistence.
- [VERIFY] World integration.

## Festivals

- [VERIFY] Festival definitions.
- [VERIFY] Date/time triggers.
- [VERIFY] Festival world presentation.
- [VERIFY] Festival interactions.
- [VERIFY] Festival rewards.
- [VERIFY] Festival memory.

## Special events

- [VERIFY] Event definitions.
- [VERIFY] Trigger system.
- [VERIFY] World presentation.
- [VERIFY] Completion.
- [VERIFY] Rewards.
- [VERIFY] Persistence.

## Rare travelling cart visitor

- [VERIFY] Visitor/merchant definition.
- [VERIFY] Rare appearance rules.
- [VERIFY] Arrival animation.
- [VERIFY] Special events.
- [VERIFY] Rare rewards.
- [VERIFY] Limited/rare inventory.
- [VERIFY] World disappearance/return rules.

---

# 13. Phase J — Backpack, Passport & Museum

These should feel like **world objects/experiences**, not generic cards.

## Backpack

- [VERIFY] Inventory engine.
- [VERIFY] Items.
- [VERIFY] Item acquisition.
- [VERIFY] Item usage.
- [VERIFY] Item metadata.
- [VERIFY] Cultural objects.
- [VERIFY] Quest/event rewards.
- [VERIFY] Visual presentation.

## Passport

- [VERIFY] Travel history.
- [VERIFY] World stamps.
- [VERIFY] Location discoveries.
- [VERIFY] Resident encounters.
- [VERIFY] Cultural milestones.
- [VERIFY] Visual presentation.

## Museum

- [PARTIAL] Memory museum screen exists.
- [VERIFY] Collection model.
- [VERIFY] Cultural artifacts.
- [VERIFY] Memories.
- [VERIFY] Discovery history.
- [VERIFY] Visual presentation.
- [VERIFY] Links back to world experiences.

---

# 14. Phase K — Learning Integration

Learning should happen **inside the world**, not feel detached from it.

- [VERIFY] Lessons.
- [VERIFY] Lesson progression.
- [VERIFY] Vocabulary.
- [VERIFY] Grammar.
- [VERIFY] Conversation.
- [VERIFY] Tutor.
- [VERIFY] Listening/audio.
- [VERIFY] Contextual learning.
- [VERIFY] Cultural learning.
- [VERIFY] Scenario completion.
- [VERIFY] XP.
- [VERIFY] Hearts.
- [VERIFY] Streak.
- [VERIFY] Reward integration.

---

# 15. Phase L — World Systems

### Environment

- [VERIFY] Plants.
- [VERIFY] Environment state.
- [VERIFY] Time of day.
- [VERIFY] Weather.
- [VERIFY] Season.
- [VERIFY] Ambient atmosphere.
- [VERIFY] Audio.
- [VERIFY] Living-world reactor.

### Goal

World state should make the place feel persistent and alive without turning every environmental system into a visible control panel.

---

# 16. Phase M — Progression & Rewards

- [VERIFY] XP authority.
- [VERIFY] Hearts authority.
- [VERIFY] Streak authority.
- [VERIFY] Currency.
- [VERIFY] Rewards.
- [VERIFY] Achievements.
- [VERIFY] Unlocks.
- [VERIFY] Quests.
- [VERIFY] Event rewards.
- [VERIFY] Rare rewards.
- [VERIFY] Persistence.

### Important

Avoid hardcoded rewards in UI components when an authoritative progression/reward engine already exists.

---

# 17. Phase N — Persistence & Restore

Test restart behavior for:

- [VERIFY] Home state.
- [VERIFY] Current world.
- [VERIFY] Current location.
- [VERIFY] Revealed discoveries.
- [VERIFY] Completed interactions.
- [VERIFY] Resident relationships.
- [VERIFY] Memories.
- [VERIFY] Backpack.
- [VERIFY] Passport.
- [VERIFY] Museum.
- [VERIFY] Quests.
- [VERIFY] Events.
- [VERIFY] Rewards.
- [VERIFY] Cassidy state.

---

# 18. Existing Audit Issues — Must Remain Tracked

These findings from the earlier architecture audit remain authoritative and should be resolved during this completion program rather than forgotten:

- [VERIFY] ISSUE-001 — Cassidy Brain mutation risk.
- [VERIFY] ISSUE-002 — Multiple AI response paths.
- [VERIFY] ISSUE-003 — Bootstrap complexity.
- [VERIFY] ISSUE-004 — Relationship creating memories.
- [VERIFY] ISSUE-005 — Possible duplicate memory creation.
- [VERIFY] ISSUE-006 — Hardcoded relationship rewards.
- [VERIFY] ISSUE-007 — Event payload type safety.
- [VERIFY] ISSUE-008 — Memory storage error handling.
- [VERIFY] ISSUE-009 — Relationship persistence validation.
- [VERIFY] ISSUE-010 — Memory ranking optimization.
- [VERIFY] ISSUE-011 — Memory integration scope.
- [VERIFY] ISSUE-012 — Memory duplicate prevention.
- [VERIFY] ISSUE-013 — Memory metadata.

---

# 19. Current Implementation Work Log

### Completed during this integration pass

- [x] Added dependency-aware destination hotspot reveal/completion flow.
- [x] Added destination reveal pulse behavior.
- [x] Added world-level memory marker behavior.
- [x] Connected destination resident hotspots to existing resident resolution/presentation infrastructure.
- [x] Added an explicit resident approach stage instead of immediately treating visibility as interaction completion.
- [x] Added learning-modal completion callback support so encounter completion can be distinguished from merely entering the encounter.
- [ ] Finish the callback round trip from learning → destination → next reveal.
- [ ] Verify current Japan implementation before adding further destination abstractions.

---

# 20. Verification Protocol

For each subsystem:

1. Locate the existing implementation.
2. Identify its authoritative engine/state source.
3. Identify the active UI/runtime entry point.
4. Trace the complete user interaction.
5. Find disconnects, broken contracts, duplicate logic, stale scaffolding, and missing persistence.
6. Patch only the necessary files.
7. Preserve existing structure.
8. Run targeted checks.
9. Run TypeScript validation.
10. Re-test the user-visible flow.
11. Update this tracker immediately.

### Never mark something DONE because:

- a file exists,
- a component renders,
- an engine has types,
- a button exists,
- or a mock screen looks correct.

It is DONE only when the **actual user journey works end-to-end**.

---

# 21. Completion Gate Before New Ideas

We are **not ready for a major new feature wave** until the following are substantially functional:

- [ ] Emerald Valley living home.
- [ ] All existing language worlds usable.
- [ ] Japan world fully verified.
- [ ] Existing real locations usable.
- [ ] Residents interact correctly.
- [ ] Existing animations actually participate in interactions.
- [ ] Progressive discovery works.
- [ ] Learning scenarios complete correctly.
- [ ] XP/Hearts/Streak work consistently.
- [ ] Cassidy ecosystem is connected.
- [ ] Memory and relationships persist.
- [ ] Quests work.
- [ ] Festivals work.
- [ ] Special events work.
- [ ] Rare cart/visitor system works if already present.
- [ ] Backpack works.
- [ ] Passport works.
- [ ] Museum works.
- [ ] Save/restore works.
- [ ] Major existing runtime errors are resolved.
- [ ] TypeScript/build validation passes.

Only after this gate is reached should we decide which **new** ideas are worth adding.

---

# 22. Guiding Principle

> **GoPAL-AI should not feel like a collection of implemented features. It should feel like one world in which the features already present in the codebase actually come alive together.**

The job of this phase is therefore not to make the project bigger.

It is to make the **existing project deeper, more connected, more functional, more coherent, and more alive.**
