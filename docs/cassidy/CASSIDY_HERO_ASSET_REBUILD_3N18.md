# Cassidy Hero Asset Rebuild — 3N.18

## Decision

The previous Cassidy mesh generation result is rejected as a production asset.
The factory must no longer synthesize a humanoid hero character from isolated
primitive solids.

The new production architecture is:

`Hero Authored Asset -> Intake -> Asset Assembly -> Technical Upgrade -> Rig -> Expressions/Gaze -> Outfit/Charm -> Animation -> LOD -> Visual Review -> Export`

## Preserved infrastructure

- deterministic orchestration
- source-aware synchronization
- checkpoints and resume/repair
- Blender CI entrypoint
- animation contract/library
- material roles
- rig/facial/gaze contracts
- mobile LOD validation
- five-view visual-review package
- fail-closed production gate
- runtime GLB export

## Replaced responsibility

The procedural character geometry generator is no longer considered a hero
asset authoring system. Its geometry output must not be used as Cassidy's
production source.

Legacy geometry routines remain available for historical/reference purposes but
must not be used to satisfy the hero asset contract.

## Hero asset contract

A production source must provide authored geometry and declare a continuous base
mesh. The intake gate rejects missing, low-detail, loose, or excessively
disconnected body candidates before expensive upgrade/render work begins.

Minimum automated intake is deliberately conservative; visual quality still
requires human review.

## 3N.18 reference-driven workspace

The Blender workspace now creates only reference infrastructure:

- canonical concept image
- X-axis symmetry guide
- five canonical view guides
- body landmarks
- facial landmarks
- proportion checkpoints
- non-destructive Mirror/Subdivision configuration metadata

No synthetic character geometry is created by this workspace.

## Authoring target

Cassidy's hero asset must preserve the locked identity:

- warm intelligent stylized face
- deep expressive near-black eyes
- dark chocolate-brown layered hair
- natural balanced human proportions
- practical adventure/learning outfit
- emerald/gold signature palette
- attached luminous leaf-star-compass charm

The same underlying identity must remain stable across worlds; world variants
may change clothing and material accents without changing Cassidy's core face,
hair identity, anatomy, or silhouette.

## Quality rule

Technical validity is necessary but never sufficient. A rigged, animated,
exportable mesh that visually fails Cassidy's identity is still rejected.
