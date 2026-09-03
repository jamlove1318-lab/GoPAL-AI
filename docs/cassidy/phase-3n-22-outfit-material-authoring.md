# Cassidy Phase 3N.22 — Outfit and Material Authoring

## Purpose

3N.22 establishes one reusable outfit/material contract for Cassidy instead
of creating separate clothing systems for every world.

## Canonical outfits

- base
- spring
- summer
- autumn
- winter
- emerald-valley
- japanese-world
- french-world
- festival
- adventure

## Material slots

The shared character contract remains:

`skin`, `hair`, `eyes`, `brows`, `outfit`, `shoes`, `accessory`

The existing canonical material definitions remain the source for base
identity. This layer adds authored outfit metadata and safe material binding.

## World variants

World-specific variants may alter clothing construction, textile treatment,
patterns, and restrained accent colors. They must not change Cassidy's core
face, eyes, hair identity, proportions, or signature charm identity.

## Mobile requirements

Production variants should favor a small, deliberate material count,
texture reuse, compressed textures where appropriate, and predictable shader
features. Visual quality must be preserved before optimization is accepted.

## Quality boundary

The tooling never creates replacement clothing geometry. Authored outfit
construction, fit, deformation, texture quality, and visual appeal remain
explicit review responsibilities.
