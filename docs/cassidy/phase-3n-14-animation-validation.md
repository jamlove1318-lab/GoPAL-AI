# Cassidy Phase 3N.14 — Authored Animation Validation

## Purpose

Cassidy animation validation is intentionally fail-closed. The factory must not treat an action as production animation merely because an action with the expected name exists.

## Required validation

For every required runtime animation:

1. The action exists.
2. The action contains F-curves.
3. The F-curves target pose bones.
4. At least one targeted pose bone belongs to the real Cassidy armature.
5. The action remains authored data; the factory does not generate motion as a substitute.

## Required clips

- idle
- walk
- run
- turn
- sit
- talk
- gesture
- point
- celebrate
- think
- react

## Why this gate exists

A named but unrelated action can otherwise pass a superficial coverage check and reach export. That would create a false production-ready state.

The animation validator now reports `missing_animations`, `empty_animations`, and `unbound_animations` separately so an artist or CI system can identify the exact remaining work.

## Quality boundary

This validator checks structural authorship and rig association. It does **not** claim to judge whether movement is aesthetically good, natural, expressive, or game-ready. Those remain part of the visual/art review process.
