# 🏭 Cassidy Automated Production Factory & Local Ubuntu Agent

This document specifies the architecture, operational contracts, and CLI commands for the repository-driven **Cassidy Automated Production Factory**.

---

## 🏛️ System Architecture

```
                    GITHUB
                       │
                       ▼
             Cassidy Production Job
              (jobs/cassidy-production.json)
                       │
                       ▼
              LOCAL UBUNTU WATCHER
             (factory/agent/watcher.py)
                       │
                       ▼
          Cassidy Production Orchestrator
         (factory/orchestrator/orchestrator.py)
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Blender 5.x     Source Assets    Production Config
 (ARM64 Ubuntu) (Authored Meshes) (contracts/cassidy-identity.json)
        │
        ▼
 ┌────────────────────────────────────────────────────────┐
 │            CASSIDY PRODUCTION STAGES                   │
 │                                                        │
 │   1. INIT            : Clean production scene setup    │
 │   2. REFERENCE       : Canonical proportions & palette │
 │   3. BASE_MESH       : Authored body, head & hands     │
 │   4. FACE            : Facial contours & lips/nose     │
 │   5. EYES            : 3D eyes, irises & eyelids       │
 │   6. HAIR            : Layered chestnut hair & bangs   │
 │   7. OUTFIT          : Emerald sweater & charcoal slacks│
 │   8. CHARM           : Emerald Valley signature charm  │
 │   9. MATERIALS       : PBR Principled BSDF shaders     │
 │  10. BODY_RIG        : Humanoid armature & weights     │
 │  11. FACIAL_RIG      : Jaw and brow controls           │
 │  12. GAZE            : Look-at target & tracking       │
 │  13. EXPRESSIONS     : 8 canonical shape keys          │
 │  14. ANIMATIONS      : 11 production animation clips   │
 │  15. LODS            : LOD0, LOD1, LOD2 budgets        │
 │  16. VISUAL_STAGING  : Review cameras & lighting       │
 │  17. VALIDATION      : Quality gates & node audit      │
 │  18. EXPORT          : Mobile runtime GLB export       │
 │  19. PACKAGE         : Manifest & checksum generation  │
 │  20. ACCEPTANCE      : Acceptance gate verification    │
 │  21. DONE            : Final certification             │
 └────────────────────────────────────────────────────────┘
                       │
                       ▼
             EXISTING TEST SYSTEM
                       │
              ┌────────┴────────┐
              │                 │
            FAIL              PASS
              │                 │
        Save diagnostics      Export
        Preserve checkpoint     │
        Stop & alert            ▼
                           Cassidy GLB
                                │
                                ▼
                         Package manifest
                                │
                                ▼
                         Acceptance gate
                                │
                                ▼
                         GITHUB ARTIFACTS
```

---

## 🧩 7 Core Subsystems

### 1. `CassidyProductionOrchestrator` (`factory/orchestrator/`)
The central brain of the factory. It tracks the 21 production stages, manages checkpoints, enforces quality gates at every stage boundary, and supports seamless crash resumption.

### 2. `CassidyProductionJob` (`jobs/cassidy-production.json`)
Declarative job specification containing character target, reference contracts, quality profile, target platform (`mobile`), Blender version (`5.x`), and required acceptance gates. Changing this file triggers the agent to build or update the character asset.

### 3. `Local CassidyFactoryAgent` (`factory/agent/`)
Persistent background watcher for the local Ubuntu machine. It monitors the repository for job changes, runs the Blender pipeline headlessly, executes quality gates, and generates reports.

### 4. Checkpoint System (`build/cassidy/checkpoints/`)
Stage-by-stage durability system saving `.blend` checkpoints:
- `00-init.blend`
- `01-reference.blend`
- `02-base-mesh.blend`
- `03-face.blend`
- `04-hair.blend`
- `05-outfit.blend`
- `06-rig.blend`
- `07-facial-rig.blend`
- `08-animation.blend`
- `09-lod.blend`
- `10-final.blend`

Supports modern Zstandard (ZSTD) compressed `.blend` formats in Blender 5.x.

### 5. Quality-Gated Progression (`factory/validation/`)
Authoritative judge that enforces:
- 12 Required Nodes: `Cassidy_Root`, `Cassidy_Body`, `Cassidy_Head`, `Cassidy_Face`, `Cassidy_Eye_L`, `Cassidy_Eye_R`, `Cassidy_Eyelid_L`, `Cassidy_Eyelid_R`, `Cassidy_Hand_L`, `Cassidy_Hand_R`, `Cassidy_Charm`, `Cassidy_Hair_Root`.
- 11 Required Animations: `idle`, `walk`, `run`, `turn`, `sit`, `talk`, `gesture`, `point`, `celebrate`, `think`, `react`.
- 8 Required Expressions: `expression_neutral`, `expression_happy`, `expression_curious`, `expression_surprised`, `expression_thoughtful`, `expression_excited`, `expression_concerned`, `expression_playful`.
- Mobile polygon budget (< 25,000 triangles).

### 6. Artifact & Report System (`artifacts/cassidy/`)
- `cassidy-runtime.glb`: Mobile-optimized runtime binary asset.
- `cassidy-package.json`: Component, node, material, animation, and expression inventory.
- `acceptance-report.json`: Gate verification report with verdict (PASS/FAIL).
- `validation-evidence.json`: Triangle, vertex, and channel counts.
- `production-report.json`: Stage durations, completion status, and execution metadata.
- `checksums.json`: Cryptographic SHA-256 hashes of all artifacts.

### 7. GitHub ↔ Local Synchronization (`factory/agent/sync.py`)
Synchronizes repository jobs and commits machine-readable JSON reports back to GitHub for inspection, keeping large binary `.glb` files appropriately placed.

---

## 🛠️ CLI Reference (`bin/cassidy`)

```bash
# Build complete character asset from start or resume point
./bin/cassidy build

# Force clean rebuild from INIT stage
./bin/cassidy build --clean

# Resume pipeline from last successful checkpoint
./bin/cassidy resume

# Re-run a specific stage and rebuild forward
./bin/cassidy repair ANIMATIONS

# Run standalone validation and acceptance gate
./bin/cassidy validate

# Export GLB asset and generate package manifest
./bin/cassidy export

# Display factory status and checkpoints
./bin/cassidy status

# Launch persistent factory agent watcher
./bin/cassidy watch

# Run single agent inspection pass
./bin/cassidy watch --once
```
