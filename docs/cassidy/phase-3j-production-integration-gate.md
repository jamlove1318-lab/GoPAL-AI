# Cassidy Phase 3J — Production Integration Gate

Phase 3J closes the boundary between authored production assets and the runtime.

## Purpose

Cassidy must never become a partially integrated character. The runtime may use the existing canonical reference/fallback while production assets are incomplete, but a production model is only eligible for integration when every required gate passes.

## Composed gates

The integration gate composes the existing authorities:

1. **Canonical reference intake** — the exact canonical artwork must have real visual-inspection approval.
2. **Reference package** — the required production reference set must permit production to begin.
3. **Production package contract** — views, expressions, animations, material slots, LODs and rig controls must be complete.
4. **Runtime asset manifest** — model, rig and animation records must be explicitly integrated.

No new character registry or state owner is introduced.

## Failure behavior

A failed gate is a hard `ready: false` result. The gate does not:

- generate a replacement character;
- invent missing animations or expressions;
- silently promote pending assets;
- alter Cassidy's canonical identity;
- bypass visual approval;
- mutate Cassidy state.

This keeps incomplete external production work outside the runtime production path.

## API

`validateCassidyProductionIntegrationGate()` returns structured errors and warnings.

`canIntegrateCassidyProduction()` provides a boolean convenience check for callers that only need the final decision.

## Definition of done

Phase 3J is complete when a production package cannot be considered integratable unless canonical visual approval, reference readiness, package validation and explicit runtime integration all succeed.
