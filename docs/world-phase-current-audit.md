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
- [x] Final learning consequence flow now has a persisted idempotency ledger plus an in-flight duplicate guard.
- [x] Optional activity hotspots can declare a reusable `miniGameId` instead of being anonymous quiz screens.
- [x] The activity launcher now consults the mini-game selector before starting a game, while preserving a hotspot's preferred mechanic.
- [x] Playable target/search, phrase ordering, memory recall and contextual-choice interaction surfaces implemented.
- [x] Playable timed-reaction and spatial-map interaction surfaces added.
- [x] Timed-round lifecycle stabilized so its countdown is not restarted on every render.
- [x] Failed mini-game runs no longer complete their physical hotspot; only a won session can return through the completion path.
- [x] Branch-only TypeScript CI workflow added; it does not build an APK and therefore does not consume the release-build workflow.

## Current structural findings

### Resident coverage
Japan has resident hotspots for Kyoto, Tokyo, Kanazawa, Osaka and Fukuoka, but the resident engine must be checked for native resident records in each place. Missing residents should not be replaced with fake placeholders; the hotspot can remain an exploration/activity location until existing assets/content are connected.

### Place vs hotspot progression
A scenario is an experience inside a place. Completing it must not imply that the whole place is exhausted. Hotspot progression and destination discovery are separate authorities.

### Optional activity progression
Quiz/quest/challenge/special hotspots are optional physical activities. Completing one should complete that hotspot, not automatically complete the destination. A failed mini-game remains replayable and does not advance physical hotspot progression.

### Mini-game foundation
The project has a 60-game catalog spanning seven families:
- discovery
- puzzle
- arcade
- social
- listening
- adventure
- creative

The engine foundation supports reusable sessions, scoring, streaks, lives, deterministic seeds and round progression. The catalog and selector are deliberately separate from the world map so the same mechanics can be reused in every language world. fileciteturn46file0L1-L2

The playable layer now has distinct interaction shapes rather than rendering every activity as the same three-choice quiz:
- target/search interaction
- phrase construction/order
- memory recall
- timed reaction
- spatial map navigation
- contextual choice/investigation

These are the first reusable primitives, not the completed 60-game library.

## Verification status

Repository-level inspection confirms the current contracts are wired together. A branch-only TypeScript workflow is now configured to validate every source-changing push to `world-integration-work`, but its result must still be observed after the latest commits.

The release APK workflow intentionally remains triggered by `main` pushes or manual dispatch, so world development does not automatically consume the user's release-build quota. fileciteturn56file0L2-L2

## Not yet declared complete

- [ ] Observe successful branch TypeScript CI run after the latest changes.
- [ ] End-to-end Japan scenario -> hotspot completion -> next hotspot reveal verification on a running app.
- [ ] Persistence/reload verification for hotspot state on device.
- [ ] Exactly-once reward/memory/relationship consequence verification on device and with configured backend.
- [ ] Cassidy world-reaction verification.
- [ ] Native resident coverage verification for every Japan resident hotspot.
- [ ] Cross-world compatibility verification.
- [ ] Duplicate world runtime/layer conflict audit.
- [ ] Build/runtime validation after the accumulated changes.
- [ ] Expand playable mechanics across the full 60-game catalog.
- [ ] Add genuinely different primitives for movement, drag/drop, audio following, investigation, crafting, branching story and world-building.
- [ ] Add destination-specific content packs without duplicating mechanic implementations.

## Variety principle
The 60 games are not 60 copies of a question card. They are intended to become different interaction mechanics: searching, movement, sequencing, audio following, dialogue decisions, timed arcade play, map navigation, crafting, investigation, story branching and world-building.

The same mechanic may be reused across worlds with different language content, characters, environments, art, story and difficulty.

## Next order of work

1. Observe/fix TypeScript CI from the accumulated world changes.
2. Finish running-app Japan correctness verification.
3. Verify persistence/reload and exactly-once consequence behavior.
4. Verify Japan and other world compatibility and resident coverage.
5. Add the next mechanically different primitive batch: drag/drop, richer spatial navigation, audio-following, clue chains, object interaction and construction.
6. Implement the next batch of real games on top of those primitives.
7. Continue until the full 50+ / 60-game target is genuinely playable.
8. Only after a large verified batch is ready, merge to `main` and spend build quota.
