# Cassidy — Zero-Cost Base Asset Strategy

## Decision

Cassidy will use a **free, legally reusable human base** as the starting geometry. The base is not Cassidy. It is only an anatomical/topology foundation. The finished Cassidy remains a substantially customized GoPAL asset.

## Preferred sources

### 1. Blender Studio Stylized Character Workflow base meshes
Blender Studio publishes full stylized human base meshes for free. The documentation describes evenly distributed quad topology, closed volumes, face sets, and UDIM UV maps. These properties make the source particularly suitable for sculpting, reshaping, and later technical processing.

Source: https://studio.blender.org/training/stylized-character-workflow/base-meshes/

The Blender developer discussion for the asset bundle also explicitly identifies stylized female full-body and supporting head/hand/foot/eye assets as part of the planned base-mesh collection and states the bundle goal was CC0.

### 2. MakeHuman / MPFB2 assets
MPFB2 is a free and open-source Blender human generator. Its bundled graphical assets—including base meshes, targets, textures, clothes, rigs, poses, and expressions—are released under CC0. The MakeHuman community also states that there are no license fees or paywalls for the core assets.

Sources:
- https://github.com/makehumancommunity/mpfb2
- https://github.com/makehumancommunity/mpfb2/blob/master/LICENSE.md
- https://static.makehumancommunity.org/mpfb/faq/is_it_really_free.html

MPFB2 is an excellent fallback when a Blender Studio base cannot be downloaded conveniently.

### 3. CC0 community base meshes
CC0 community meshes can be evaluated as additional candidates, but they must pass our intake checks before becoming eligible. Examples may have incomplete hands, feet, head topology, or be explicitly marked WIP, so they are not automatically accepted.

## Selection rules

A candidate must pass all of these before it can enter Cassidy production:

- explicit permissive/public-domain license with commercial use permitted;
- source provenance recorded;
- female human base suitable for Cassidy;
- sufficient mesh density for reshaping;
- connected body geometry;
- no loose vertices;
- no accidental disconnected anatomy;
- usable facial/head topology or a separately compatible head source;
- usable UVs where available;
- source remains untouched until preservation baseline is captured;
- no automatic visual approval.

## Cassidy transformation

```text
FREE LICENSED BASE
        ↓
SOURCE INTAKE
        ↓
STRUCTURAL QUALITY CHECK
        ↓
SEMANTIC MAPPING
        ↓
PRESERVATION BASELINE
        ↓
CASSIDY FACE / PROPORTIONS
        ↓
HAIR + SIDE BRAID
        ↓
EMERALD VALLEY OUTFIT
        ↓
BOOTS + SATCHEL / POUCHES
        ↓
LEAF-STAR COMPASS CHARM
        ↓
PBR MATERIALS
        ↓
RIG + FACIAL RIG + GAZE
        ↓
EXPRESSIONS + ANIMATIONS
        ↓
LOD0–LOD3
        ↓
HUMAN VISUAL REVIEW
        ↓
CANONICAL CASSIDY MASTER
```

## Important boundary

The factory must never convert a weak procedural mannequin into a claimed production hero. If a source is not good enough, the intake gate rejects it and we select another free source.

The technical pipeline can be automated. Final artistic approval remains human-controlled.
