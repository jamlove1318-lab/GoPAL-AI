# Cassidy Phase 3L — Production Presentation Routing

## Purpose

Phase 3L connects the production-aware visual resolver to the user-facing Cassidy presence component.

## Runtime flow

Cassidy mood/action/world presentation input is translated into the canonical character state contract. That state is passed through `resolveCassidyVisual`.

- If the resolver returns `fallback`, the existing lightweight 2D Cassidy presentation is used.
- If the resolver returns a production LOD with a real model URI, `Cassidy3DScene` is mounted.
- The presentation layer does not invent model URIs or override the resolver's asset decision.

## Canonical mappings

| Presentation input | Runtime contract |
| --- | --- |
| idle | idle |
| talking | talk |
| waving | gesture |
| walking | walk |
| happy | happy |
| thinking | thoughtful |
| excited | excited |
| calm / warm | neutral |

## Safety behavior

The current production registry is still pending, so the existing application continues to use the 2D fallback. No 3D asset is rendered merely because the R3F scene component exists.

When the real production model, rig, and animation package is integrated, the same presentation component will automatically route to the 3D scene through the resolver.

## Architecture

This phase deliberately does not replace the existing fallback component. The fallback remains a compatibility path and a safe visual state while production assets are being authored and validated.

The result is one reusable presentation entry point rather than separate application-specific Cassidy implementations.
