# Cassidy Phase 3M — Runtime Model Validation

## Purpose

Phase 3M hardens the boundary between an authored Cassidy GLB and the mobile renderer.

A model is never trusted merely because a URI exists. After loading, the runtime checks the GLB against the stable Cassidy runtime contract before presenting it.

## Runtime validation

The loaded asset must contain:

- all 11 canonical animation clips;
- all 8 canonical expression morph targets;
- all required semantic Cassidy nodes;
- the stable eye/eyelid, hand, hair and charm node names.

The shared validator in `cassidyRuntimeModelContract.ts` remains the single definition of these runtime requirements.

## Fail-closed behavior

If any required runtime element is missing, the 3D scene returns no production geometry. The existing fallback presentation remains responsible for the character.

This prevents a partially authored model from silently reaching users with missing animation, facial, eye or identity-critical controls.

## Animation and expression behavior

Animation transitions and facial morph application are now gated by successful runtime validation. Cleanup also clears the active animation reference and uncaches the mixer root.

## Production status

The repository still contains no finished Cassidy GLB. The production registry therefore remains intentionally pending, and the application continues to use the existing fallback character.

## Next phase — actual 3D production

The next major milestone is **Phase 3N: Cassidy 3D Asset Creation & Intake**. This is where the actual authored 3D model is created outside the TypeScript runtime, then brought through turnaround/model/rig/animation validation and finally committed or referenced as the production runtime asset.

No placeholder GLB, random generated model, or unverified character will be promoted to production.
