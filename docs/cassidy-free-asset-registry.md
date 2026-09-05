# Cassidy — Free Asset Acquisition Registry

> Persistent source-of-truth for external free/licensed assets considered for Cassidy production. This prevents strong candidates from being forgotten while the asset search continues.
>
> **Canonical visual authority:** `docs/cassidy-character-reference.md`. This registry never overrides that file. Every candidate is subordinate to visual quality, identity fidelity, licensing, technical suitability, provenance, and human visual approval.

## 1. Cassidy quality contract

Cassidy is the hero character of GoPAL-AI. Target quality is **Heroic Realism / realistic stylized game-character quality**, not a generic free character.

### Locked visual identity

- Near-black eyes with warm brown undertone, layered iris depth, natural reflections and soft lashes.
- Dark chocolate-brown hair with subtle warm highlights, soft natural waves and a distinctive side braid.
- Luminous Leaf-Star Compass Charm: glowing gold star/compass pendant, teal/emerald center gem, gold chain, with contextual glow states.
- Emerald Valley home outfit: emerald sleeveless hooded vest/waistcoat, cream/white long-sleeve blouse with loose slightly puffed sleeves, brown leather belt/pouches/satchel details, layered straps/buckles, fitted grey/brown trousers, tall brown leather lace-up boots.
- Face, eyes, hair and core silhouette remain Cassidy's identity across world outfit variants.

### Locked production target

- ~15K–45K triangles for hero game asset.
- Full-body + advanced facial rig.
- 60+ facial blendshapes / equivalent facial control coverage.
- Independent eye control and expressive gaze/eyelids.
- PBR 2K–4K materials with natural skin shading and realistic material separation.
- Hair cards + strand hybrid where appropriate.
- LOD0 / LOD1 / LOD2 / LOD3.
- Mobile, tablet and desktop suitability.
- Natural expressive animation: idle breath, walk, run, talk, think, celebrate.
- Required visual review: front, 3/4 front, side, 3/4 back.

## 2. Non-negotiable selection rules

1. **Quality beats convenience.** Do not keep an asset merely because it is free or already integrated.
2. **Free means verified.** Record the exact license and source; never assume a marketplace label means unrestricted use.
3. **No primitive humanoid fabrication.** Blender scripts may assemble, customize, validate and derive technical outputs, but must not replace a weak source with a generated primitive body.
4. **No automatic Cassidy approval.** Candidate discovery/scoring is evidence only. Human visual review remains mandatory.
5. **Prefer reusable components.** A strong body, head, eyes, hair, clothing, boots, accessory, facial-control or animation source can be used independently when integration preserves Cassidy's identity.
6. **Do not compromise the face.** Face/head/eyes have the highest visual priority.
7. **The current realistic body is still only a candidate.** It is not permanently committed until stronger alternatives are compared.
8. **Preserve provenance.** For every accepted source record URL, author, license, original name, format, local filename, SHA-256, modifications and intended Cassidy role.
9. **No destructive source edits.** Keep originals immutable; create derived production assets separately.
10. **Reject generic-looking results.** Technical validity is necessary, never sufficient.

## 3. Strongest sources discovered so far

### A. MakeHuman Community — System Assets

- **Status:** HIGH-VALUE SOURCE ECOSYSTEM; inspect selectively.
- **License:** CC0 for listed system assets.
- **Useful categories:** female proxy meshes, brown/high-poly eyes, eyebrows, eyelashes, hair including braid/long/ponytail options, teeth/tongue, clothing and shoes.
- **Why retained:** Strongest current free component ecosystem because it provides compatible character parts rather than forcing us to accept one mediocre complete character.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html

### B. MakeHuman Community — Natural Female Skins 01

- **Status:** HIGH-VALUE MATERIAL SOURCE; visual inspection required.
- **License:** CC0.
- **Useful content:** natural female skin textures, including enhanced Indian female variants.
- **Why retained:** Strong free starting point for Cassidy's natural PBR skin appearance.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/skins01.html

### C. MakeHuman Community — Faceunits 01

- **Status:** HIGH-VALUE FACIAL-RIG SOURCE; technical foundation only.
- **License:** CC0.
- **Content:** ARKit-style face units. The current export workflow documents 54 ARKit face-unit shape keys.
- **Why retained:** Cassidy requires 60+ facial controls. These provide a strong standards-compatible starting layer that can be extended beyond the minimum.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/faceunits01.html

### D. MakeHuman Community — Visemes 01 / 02

- **Status:** HIGH-VALUE ANIMATION SOURCE.
- **License:** CC0.
- **Content:** Microsoft-style and Meta/VR-style viseme shape keys.
- **Why retained:** Useful for reusable speech animation alongside Cassidy's expressive facial system.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/index.html

### E. MakeHuman Community — Hair 01

- **Status:** CANDIDATE COMPONENT SOURCE; visual inspection required.
- **License:** CC0 for this pack.
- **Notable braid candidates:** `elvs_double_mh_braid`, `elvs_french_braid_variation`, `elvs_reverse_french_braid_bun`, `elvs_unkempt_french_braid`.
- **Why retained:** Cassidy's side braid is a locked identity feature; authored braid assets are preferable to weak procedural fabrication.
- **Important:** The final hairstyle must match Cassidy's canonical silhouette; a braid asset is not automatically acceptable.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/hair01.html

### F. MakeHuman Community — Shoes 01 / related shoe packs

- **Status:** CANDIDATE COMPONENT SOURCE.
- **License:** CC0 for CC0 mesh packs.
- **Why retained:** Candidate source for tall brown leather lace-up boots. Final silhouette/details must match Cassidy.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/index.html

### G. MakeHuman Community — Jewelry01 / Jewelry02

- **Status:** CANDIDATE COMPONENT SOURCE for necklace/charm construction.
- **License:** Jewelry01 is CC0; Jewelry02 is CC-BY and therefore requires attribution if used.
- **Why retained:** The Leaf-Star Compass Charm is a Cassidy identity anchor. A jewelry base may reduce modeling work, but the final charm must be specifically Cassidy's design and support its glow states.
- **Official source:** https://static.makehumancommunity.org/assets/assetpacks/index.html

### H. Blender Studio / Community — Human Base Meshes v1.4.1

- **Status:** EXISTING LOCAL CANDIDATE; already acquired and inspected.
- **License:** CC0.
- **Current selected object:** `GEO-body_female_realistic`
- **Inspected metrics:** 10,582 vertices; 10,590 polygons; 21,160 triangles; 21,170 edges; 1 UV layer; 1 connected component; 0 boundary; 0 non-manifold; 0 loose vertices; Multires 3/3/3.
- **Visual status:** Human visual inspection accepted it as a realistic professional base-mesh candidate.
- **Important:** This is a foundation candidate, not finished Cassidy. Face, hair, outfit, facial rig, animation, materials, charm and final visual review are still unresolved.
- **Official source:** https://www.blender.org/download/demo-files/

## 4. Current search priority

1. **Face/head foundation** — strongest realistic, expressive, game-suitable option.
2. **Eyes + eyelids + gaze** — near-black/brown identity, reflections and alive eye contact.
3. **Hair + side braid** — beautiful natural waves and dynamic braid silhouette.
4. **Body foundation** — compare the existing realistic body against stronger free alternatives.
5. **Skin/materials** — natural high-quality PBR appearance.
6. **Emerald Valley clothing** — exact outfit construction, not a generic costume.
7. **Boots / leather / pouches / straps.**
8. **Leaf-Star Compass Charm** — custom identity asset and glow states.
9. **Facial controls / visemes / animation.**
10. **Final rig, LODs, optimization and GoPAL-AI integration.**

## 5. Candidate record template

```text
### [Candidate name]
- Role:
- Status: DISCOVERED | INSPECTION | ACCEPTED_CANDIDATE | REJECTED | PRODUCTION
- Source:
- Author:
- License:
- Original asset name:
- Format:
- Local acquisition path:
- SHA-256:
- Geometry metrics:
- Rig/facial metrics:
- Texture/material metrics:
- Cassidy visual match:
- Cassidy modifications required:
- Provenance notes:
- Human visual review: PENDING | PASS | FAIL
- Reason for status:
```

## 6. Future search policy

Continue searching beyond these sources. Add a new candidate only when it provides a meaningful quality advantage or fills a missing Cassidy requirement.

Priority targets:

- realistic female hero heads/faces with strong topology and deformation
- high-quality realistic eyes/eyelids
- natural wavy hair with side-braid compatibility
- game-quality explorer/adventure clothing
- leather boots, belts, pouches and straps
- jewelry/charm components
- facial rig/blendshape/viseme systems
- high-quality free PBR materials
- compatible body/face/animation foundations

Do not turn this into a giant catalog of mediocre assets. **A small list of excellent candidates is more valuable than hundreds of weak ones.**

## 7. Final production gate

No candidate becomes production Cassidy merely because it is free, CC0, rigged, sufficiently dense, renderable, or Blender-compatible.

Production Cassidy must satisfy the canonical character reference, technical production gates, provenance requirements, and **human visual approval**.

Canonical reference: `docs/cassidy-character-reference.md`
