# Cassidy 3N.21 — Hero Source Handoff

## Goal

3N.21 is the controlled handoff from a genuinely authored Cassidy hero asset into the GoPAL-AI production factory.

The factory is ready to perform the repetitive engineering work. The only thing it must not do is fabricate Cassidy's identity from primitive geometry.

## Source hierarchy

Preferred source quality order:

1. artist-authored Blender `.blend` with editable meshes/materials
2. artist-authored `.glb`/`.gltf` with production-quality geometry/materials
3. externally generated mesh that has been manually inspected and corrected by an artist

A generated mesh is not automatically a production asset merely because it imports successfully.

## Required visual target

The source must preserve the canonical Cassidy identity:

- warm intelligent stylized human face
- deep expressive near-black eyes
- readable eyelids and eye sockets
- dark chocolate-brown layered hair
- natural balanced proportions
- practical adventure/learning clothing
- emerald/gold signature accents
- luminous leaf-star-compass companion charm

The source must survive five-view inspection: front, 3/4 front, side, 3/4 back, and back.

## Required structural target

The source should contain stable semantic components for:

- body
- face/head
- eyes
- hair
- outfit
- shoes
- companion charm

The canonical manifest template is:

`docs/cassidy/cassidy-hero-source-manifest.example.json`

The manifest must be copied into a working source-specific manifest and its object names must be reviewed against the actual source. Never mark a guessed mapping as approved.

## Ubuntu handoff

Keep the original source untouched. Copy it into the Ubuntu GoPAL-AI workspace under a source-specific location, for example:

```bash
cd /root/cassidy-github-factory
mkdir -p build/cassidy/source
cp /absolute/path/to/cassidy-hero.blend build/cassidy/source/cassidy-hero.blend
cp docs/cassidy/cassidy-hero-source-manifest.example.json build/cassidy/source/cassidy-hero-source-manifest.json
```

For GLB:

```bash
cp /absolute/path/to/cassidy-hero.glb build/cassidy/source/cassidy-hero.glb
```

Set the source variables:

```bash
export CASSIDY_SOURCE_BLEND="$PWD/build/cassidy/source/cassidy-hero.blend"
```

or:

```bash
export CASSIDY_SOURCE_ASSET="$PWD/build/cassidy/source/cassidy-hero.glb"
```

Then set:

```bash
export CASSIDY_SOURCE_MANIFEST="$PWD/build/cassidy/source/cassidy-hero-source-manifest.json"
```

## Verification sequence

Run the authoritative pipeline only after the source and manifest are present:

```bash
cd /root/cassidy-github-factory
python3 - <<'PY'
from pathlib import Path
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator

repo = Path.cwd()
orchestrator = CassidyProductionOrchestrator(repo_dir=repo)
print("FACTORY_HASH:", orchestrator.factory_hash())
print("SOURCE_HASH:", orchestrator.source_hash())
print("JOB_HASH:", orchestrator.job_hash())
result = orchestrator.build(from_scratch=False)
print("BUILD_RESULT:", "SUCCESS" if result else "BLOCKED")
PY
```

The pipeline must stop before expensive technical work when hero intake or manifest validation fails.

## Review evidence

A successful technical build is still not visual approval.

Inspect the generated five-view package and verify:

- facial identity
- eye readability
- hair silhouette
- body proportions
- hands and feet
- clothing construction
- charm design/readability
- material separation
- expressions
- gaze/eyelids
- animation quality
- world consistency
- mobile readability

All visual gates remain human-controlled.

## No shortcut rule

Do not lower thresholds, disable gates, rename placeholders, or manufacture geometry merely to obtain `PRODUCTION_READY`.

If the source is not beautiful enough, the correct action is to improve the source.

## Reuse strategy

Once accepted, this becomes Cassidy's stable hero identity source. Future world variants should derive from this asset through controlled modular changes to clothing, materials, accessories, and contextual presentation while preserving the core face, hair identity, proportions, and silhouette.

This same source-first pattern should become the reusable standard for future GoPAL-AI characters and world assets.
