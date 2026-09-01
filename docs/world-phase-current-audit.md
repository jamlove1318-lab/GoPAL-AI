# World Integration — Current Phase Audit

## Working branch
`world-integration-work`

`main` is intentionally untouched while this work accumulates.

## Completed repairs

- [x] Resident visual lifecycle connected to the existing world visual runtime.
- [x] Learner response events reach resident visual reactions.
- [x] Hotspot progress is scoped by physical `placeId`.
- [x] Hotspot completion/reveal is atomic for the explicit next physical hotspot.
- [x] World hotspot experience routing distinguishes resident, discovery, landmark, path and optional activities.
- [x] Generic exploration no longer automatically launches a resident encounter.
- [x] Scenario completion no longer automatically marks the entire physical place as completed.
- [x] Hotspot catalog defaults normal hotspots to enabled and keeps locked hotspots disabled.
- [x] 60 reusable mini-game concepts documented.
- [x] Reusable mini-game catalog added.
- [x] Reusable mini-game selection/history engine added with recent-repeat cooldown logic.

## Current structural findings

### Resident coverage
Japan has resident hotspots for Kyoto, Tokyo, Kanazawa, Osaka and Fukuoka, but the resident engine must be checked for native resident records in each place. Missing residents should not be replaced with fake placeholders; the hotspot can remain an exploration/activity location until existing assets/content are connected.

### Place vs hotspot progression
A scenario is an experience inside a place. Completing it must not imply that the whole place is exhausted. Hotspot progression and destination discovery are separate authorities.

### Optional activity progression
Quiz/quest/challenge/special hotspots are optional physical activities. Completing one should complete that hotspot, not automatically complete the destination.

### Mini-game foundation
The project now has a 60-game catalog spanning seven families:
- discovery
- puzzle
- arcade
- social
- listening
- adventure
- creative

The current engine foundation supports reusable sessions, scoring, streaks, lives, deterministic seeds and round progression. The catalog and selector are deliberately separate from the world map so the same mechanics can be reused in every language world.

## Not yet declared complete

- [ ] End-to-end Japan scenario -> hotspot completion -> next hotspot reveal verification.
- [ ] Persistence/reload verification for hotspot state.
- [ ] Exactly-once reward/memory/relationship consequence verification.
- [ ] Cassidy world-reaction verification.
- [ ] Native resident coverage verification for every Japan resident hotspot.
- [ ] Cross-world compatibility verification.
- [ ] Duplicate world runtime/layer conflict audit.
- [ ] TypeScript validation after the accumulated changes.
- [ ] Actual playable implementations for the 60 mini-game mechanics.
- [ ] Connect the selector to activity locations.
- [ ] Add genuinely different playable interaction surfaces rather than card-only quizzes.

## Variety principle
The 60 games are not 60 copies of a question card. They are intended to become different interaction mechanics: searching, movement, sequencing, audio following, dialogue decisions, timed arcade play, map navigation, crafting, investigation, story branching and world-building.

The same mechanic may be reused across worlds with different language content, characters, environments, art, story and difficulty.

## Next order of work

1. Finish current world correctness audit.
2. Verify consequences are exactly once.
3. Verify persistence and reload behavior.
4. Verify Japan and other world compatibility.
5. Fix remaining contract/type issues.
6. Wire mini-game selection to optional fictional locations.
7. Build the first genuinely playable mini-games as reusable interaction primitives.
8. Expand those primitives until the full 50+ library is playable.
9. Add variety/anti-repeat selection using history.
10. Only after a large verified batch is ready, merge to `main` and spend build quota.
