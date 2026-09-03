# Cassidy Phase 3N.25 — Animation Authoring Quality

## Purpose

3N.25 adds a reusable validation layer around Cassidy's existing eleven
canonical animation clips.

## Structural checks

The validator checks:

- all required clips exist
- actions contain authored F-curves
- curves target the real Cassidy armature
- expected clip frame ranges are covered
- authored animation metadata is available for inspection

## Canonical clips

`idle`, `walk`, `run`, `turn`, `sit`, `talk`, `gesture`, `point`, `celebrate`,
`think`, and `react` remain the single animation vocabulary used by the
existing runtime contract.

## Non-destructive policy

No curves, keyframes, poses, or timing are automatically rewritten. The tool
is a quality gate around artist-authored animation.

## Visual review

Structural validity cannot prove that a walk feels natural, a gesture reads
well, or secondary motion looks convincing. Those remain human visual-review
requirements before production approval.
