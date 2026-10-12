# Spine — Resident Animation Pipeline

Spine is the 2D character production lane for GoPAL.

Use it for residents, villagers, cafe/shop characters, story characters, animals, and lightweight creatures that benefit from expressive 2D deformation without requiring a full 3D asset.

## Boundary

Spine owns:

- skeletons and meshes
- skins and attachments
- animation clips
- animation blending inside the character
- visual state-machine presentation when useful

GoPAL owns:

- world state
- actor schedules and behavior
- relationships
- encounters and consequences
- when an animation intent happens

## Shared vocabulary

Map Spine animations to the semantic actions in `src/engines/world/worldAnimationContract.ts`, especially `idle`, `walk`, `look`, `greet`, `talk`, `think`, `discover`, `inspect`, `interact`, `celebrate`, `sit`, and `stand`.

Do not invent a second behavior vocabulary that only Spine understands.

## Production goal

Residents should feel like inhabitants, not looping stickers. Build short loops plus transition/reaction animations, then let the existing world runtime decide when they occur.
