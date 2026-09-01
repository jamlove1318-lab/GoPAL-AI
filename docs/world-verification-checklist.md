# World Integration Verification Checklist

Branch: `world-integration-work`

This checklist is intentionally separate from the architecture audit. It records runtime correctness gates for the current world-integration phase.

## Core flow

- [ ] Enter Emerald Valley home.
- [ ] Enter Japan destination without replacing home state.
- [ ] Enter a real physical location.
- [ ] Explore without automatically starting a resident encounter.
- [ ] Select a hotspot.
- [ ] Resolve a hotspot-specific scenario when one is configured.
- [ ] Complete a multi-turn scenario only after its actual terminal response.
- [ ] Return to the physical location after completion.

## Hotspot progression

- [ ] Completion is scoped to the physical place.
- [ ] Completing hotspot A reveals only its declared next hotspot.
- [ ] A hotspot cannot reveal itself.
- [ ] A next hotspot from another place is rejected.
- [ ] Locked hotspots remain unavailable until their prerequisite is satisfied.
- [ ] Completing an optional activity does not complete the destination.
- [ ] Completing a learning scenario does not complete the destination.

## Consequences

- [ ] Rewards are granted exactly once.
- [ ] Memory creation occurs exactly once.
- [ ] Relationship consequence occurs exactly once.
- [ ] Cassidy consequence occurs exactly once.
- [ ] Reopening/replaying an already-completed hotspot does not duplicate one-time consequences.

## Persistence

- [ ] Hotspot progress survives app reload.
- [ ] Destination/world location survives app reload where intended.
- [ ] In-progress state does not incorrectly restore as completed.
- [ ] Selection/recent mini-game history survives when its persistence contract requires it.

## Japan content

- [ ] Kyoto physical locations and resident/content links work.
- [ ] Tokyo/Shibuya naming compatibility works.
- [ ] Kanazawa resident/content records are verified rather than assumed.
- [ ] Osaka resident/content records are verified.
- [ ] Fukuoka resident/content records are verified.

## Cross-world compatibility

- [ ] World-specific IDs remain namespaced.
- [ ] The same mini-game mechanic can be supplied with non-Japan content.
- [ ] No Japan-specific routing is required by reusable world engines.
- [ ] Fictional locations can use the same hotspot/activity contracts.

## Learning variety

- [ ] Target/search mechanic is playable.
- [ ] Phrase ordering mechanic is playable.
- [ ] Memory mechanic is playable.
- [ ] Timed reaction mechanic is playable.
- [ ] Spatial navigation mechanic is playable.
- [ ] Investigation mechanic is playable.
- [ ] Next primitive batch: drag/drop.
- [ ] Next primitive batch: object interaction.
- [ ] Next primitive batch: audio-following.
- [ ] Next primitive batch: clue chains.
- [ ] Next primitive batch: construction.
- [ ] Next primitive batch: branching story.

## Release gate

Do not merge to `main` merely because TypeScript passes. Runtime verification and the consequence/persistence checks above must be completed first. APK-building remains an explicit user-authorized step.
