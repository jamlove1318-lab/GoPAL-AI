# Cassidy — 3N.35 All-Phases Execution Standard

## Authority

The authoritative artistic reference is:

`docs/cassidy-character-reference.md`

This document must remain consistent with that reference. The factory is not permitted to reinterpret Cassidy or replace the authored hero asset with procedural primitive anatomy.

## End-to-end production chain

1. **Reference lock** — canonical Cassidy character reference is present and validated.
2. **Hero source intake** — accept an externally authored `.blend`, `.glb/.gltf`, or manually corrected authored source.
3. **Semantic mapping** — map source objects to stable Cassidy component IDs.
4. **Hero quality analysis** — inspect geometry, topology, UVs, materials, facial data, rig and LOD evidence.
5. **Source preservation** — protect authored geometry, topology, UVs, shape keys and component identity from silent mutation.
6. **Technical upgrade** — add only approved runtime infrastructure, sockets, rig bindings, facial/gaze controls and derived data.
7. **Materials** — preserve authored look while validating PBR compatibility and world-safe material separation.
8. **Body rig** — validate production deformation bindings and mobile bone budget.
9. **Facial rig** — validate 60+ blendshape target, independent eyes, eyelids, gaze and expression controls.
10. **Animation** — validate Idle Breath, Walk, Run, Talk, Think and Celebrate, with reusable additional clips permitted when they do not change identity.
11. **LOD** — validate LOD0/LOD1/LOD2/LOD3 and identity preservation.
12. **Visual staging** — render front, 3/4 front, side and 3/4 back evidence plus presentation framing.
13. **Human visual review** — every required visual gate must pass; automation may never self-approve.
14. **Runtime export** — export only after structural, preservation and human visual gates pass.
15. **World integration** — derive world-specific clothing/background/material variants while keeping face, eyes, hair and core silhouette identical.

## Canonical design requirements

- Heroic-realism stylized proportions.
- Approximately 15K–45K triangles for the hero asset.
- Near-black eyes with a warm brown undertone and layered iris depth.
- Dark chocolate-brown hair with subtle warm highlights, natural waves and a side braid.
- Emerald Valley explorer outfit: emerald hooded vest, cream/white blouse, brown leather belt/gear, fitted grey/brown trousers and tall brown lace-up boots.
- Luminous Leaf-Star Compass Charm: gold star/compass form, teal/emerald center, contextual glow states.
- Nine core expressions: Neutral, Happy, Curious, Excited, Surprised, Thoughtful, Playful, Concerned, Gentle.
- Six standard interaction poses: Greeting, Explaining, Listening, Thinking, Encouraging, Celebrating.
- Six canonical animation states: Idle Breath, Walk, Run, Talk, Think, Celebrate.
- Full body + advanced facial rig.
- 60+ blendshapes.
- Independent eye controls.
- Hair Cards + Strand Hybrid.
- PBR 2K–4K textures.
- LOD0 / LOD1 / LOD2 / LOD3.
- Mobile, tablet and desktop support.

## Fail-closed rules

The build remains blocked when:

- no genuine authored Cassidy source is supplied;
- the source is a primitive procedural humanoid;
- required semantic components are missing or duplicated;
- authored geometry/topology/UV/shape-key identity changes during technical processing;
- technical gates fail;
- required LOD coverage is missing;
- visual review is incomplete.

## Current implementation status

The reusable factory infrastructure for intake, semantic identity, quality analysis, source preservation, technical authoring, staging, visual-review evidence and export gating is implemented on the `cassidy-blender-factory` branch.

The final **asset-dependent** phases cannot truthfully be marked complete until a genuine authored Cassidy 3D hero source exists and passes the pipeline. The old low-poly procedural result is intentionally rejected and must not be promoted to production.

This distinction is intentional: code can complete the factory, but code must not fabricate a production-quality character and call it finished.
