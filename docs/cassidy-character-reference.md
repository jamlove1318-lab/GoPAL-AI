# Cassidy — Character Design Reference (GoPAL AI)

> **Purpose of this file:** This document is a full text description of the official Cassidy character reference sheet. It exists so that AI tools without image-reading access (e.g. GitHub-connected coding assistants) can still understand Cassidy's exact appearance, personality, and design specs when generating or reviewing code/assets. **Any implementation of Cassidy must match this description exactly — do not alter her design.**

---

## 1. Core Identity

- **Tagline:** "Your AI Companion. Your Guide. Your Friend."
- **Description:** Cassidy is the heart of GoPAL_AI. She explores worlds with you, celebrates every discovery, challenges you to grow, and remembers what matters most. More than a guide — she is a friend who learns, supports, and believes in you.
- **Brand:** GoPAL AI — "Learn. Explore. Grow. Together."

### Identity Anchors
- Warm
- Curious
- Intelligent
- Adventurous
- Loyal
- Empathetic
- Playful
- Wise
- Always by your side · Sees the best in you
- Learns and remembers · Inspires growth
- Makes the world feel alive

### Quick Facts
| Attribute | Value |
|---|---|
| Age | 18–22 (Timeless) |
| Role | Companion, Guide, Explorer, Friend |
| Personality | Warm, Curious, Playful, Brave, Wise |
| Presence | Comforting, Inspiring, Energetic |
| Signature | Luminous Leaf-Star Compass Charm |

---

## 2. Physical Appearance

### Face / Eyes
- **Color:** Near-black with a warm brown undertone
- **Detail:** Layered iris for depth
- **Quality:** Natural reflections, soft lashes
- **Behavior:** Gaze follows you (expressive, alive eye contact)

### Hair
- **Color:** Dark Chocolate Brown, rich dark brown with subtle warm highlights
- **Texture:** Soft, natural waves
- **Signature style:** Side braid
- **Motion:** Moves with emotion and motion (dynamic hair physics)

### Signature Accessory — Necklace
- **Design:** Luminous Leaf-Star Compass Charm (a glowing gold star/compass pendant with a teal/emerald gem center) on a gold chain
- **Behavior:** Reacts to moments, emotions, and discoveries; connects Cassidy with you and the world
- **Glow states** (the charm changes to reflect context):
  - Normal (At Ease)
  - Curious (Interest)
  - Learning (Focus)
  - Discovery (Moment)
  - Important (Significant)
  - Celebration (Victory)
  - Memory (Protected)

### Color Palette
- Emerald (deep green)
- Gold
- Warm Beige
- Chocolate Brown
- Deep Brown
- Soft Coral
- Accent Teal
- **Accent & Glow:** Subtle "breathing" glow effect applied to accessory/accents

---

## 3. Outfit

### Base Outfit — "Emerald Valley" (Home)
Adventurer/explorer-style outfit:
- Emerald green sleeveless vest/waistcoat with hood, worn over a cream/white long-sleeve blouse with loose, slightly puffed sleeves
- Brown leather belt with pouches and satchel details at the waist
- Layered brown leather straps and buckles across the torso and hips
- Fitted grey/brown trousers
- Tall brown leather lace-up boots reaching toward the knee
- The gold Leaf-Star Compass Charm necklace worn over the outfit

### Outfit Variants (Same Cassidy, Different Worlds)
Cassidy keeps the same face, hair, and core silhouette; only the outfit adapts to each "world":
1. **Emerald Valley (Home):** Green vest + cream blouse (base outfit, described above)
2. **Japanese World (Travel):** Outfit re-themed with soft pink/floral tones, set against a cherry-blossom backdrop
3. **French World (Travel):** Outfit re-themed with cream/beige tones and a beret-style hat, set against a Paris/Eiffel Tower backdrop

**Design rule:** Across all worlds, Cassidy's face, hair, eyes, and core identity stay identical — only clothing colors/styles and background adapt to the setting.

---

## 4. Full Body Turnaround (Base Outfit Reference)
Four required reference angles for 3D/2D modeling consistency:
- Front
- 3/4 Front
- Side
- 3/4 Back

---

## 5. Expressions

Cassidy has a defined set of core facial expressions for emotional range:
1. Neutral
2. Happy
3. Curious
4. Excited
5. Surprised
6. Thoughtful
7. Playful
8. Concerned
9. Gentle

---

## 6. Pose & Interaction Reference
Standard interaction poses used for UI/dialogue moments:
1. Greeting
2. Explaining
3. Listening
4. Thinking
5. Encouraging
6. Celebrating

---

## 7. Personality in Motion
- Moves with purpose and energy
- Expressive hands and natural gestures
- Maintains eye contact
- Reacts to the world around her
- Her accessory reflects her inner state (see charm glow states above)

## 8. World Role
- Companion in every adventure
- Guide through languages and cultures
- Keeper of memories/stories
- Encourages growth and mastery
- Celebrates your progress

## 9. Relationship With You
- Sees you as her most important person
- Remembers the little things
- Encourages you when you struggle
- Celebrates your every win
- Grows a deeper bond over time

**Core Promise:** "Cassidy makes every step of your journey meaningful. She turns learning into adventure, challenges you to grow, and turns the world into a place you belong." — *"Always with you, Cassidy"*

---

## 10. Animation Personality
- Fluid and natural
- Expressive and alive
- Playful and energetic
- Grounded and believable
- Emotion-driven performance

### Animation Set (Idle/Action States)
- Idle Breath
- Walk
- Run
- Talk
- Think
- Celebrate

---

## 11. Technical Character Spec (3D Pipeline)

| Spec | Detail |
|---|---|
| Proportions | Realistic stylized proportion (Heroic Realism) |
| Triangles | ~15K–45K tris |
| Rig | Full Body + Advanced Facial Rig |
| Facial | 60+ Blendshapes, Full Facial Rig, Eyes with independent control |
| Textures | PBR Textures, 2K–4K |
| Hair | Hair Cards + Strand Hybrid |
| LOD System | LOD0 / LOD1 / LOD2 / LOD3 |
| Materials | Natural skin shading, realistic materials |
| Platforms | Mobile, Tablet, Desktop |

---

## 12. Camera & Presentation Framing
Standard camera/shot types for use across the app:
- Portrait (Conversations)
- Half Body (Dialogue & UI)
- Full Body (Exploration)
- Over the Shoulder (World) — used for dynamic & emotional framing

---

## 13. Design Details (Material/Asset Callouts)
Close-up reference callouts for asset consistency:
- Embroidery
- Leather
- Fabric
- Metal
- Charm Glow
- Hair Movement
- Clothing Flow
- Boot Details
- Pouch & Gear

---

## 14. Visual Language (Brand Feel)
- **Warm & Inviting** — Soft shapes, open posture
- **Curious & Intelligent** — Bright eyes, thoughtful gaze
- **Adventurous** — Ready for new places
- **Supportive** — Encouraging gestures
- **Magical Connection** — Her charm echoes her bond with you
- **World Explorer** — Travel-ready, culturally respectful

---

## 15. Cassidy Creation Pipeline (High Level)
1. Concept (External Artist)
2. Character Sheet (Approved Canon) ← *this document corresponds to this stage*
3. 3D Modeling (High Quality)
4. Texturing (Materials & Detail)
5. Rigging (Facial & Body)
6. Animation Library (Emotes, Movement)
7. World Integration (GoPAL-AI)
8. Living Cassidy (Evolves With You)

### Phase Status (as of this reference sheet)
- [x] Phase 1: Complete (Specification & Concept Package)
- [x] Phase 2: Create Canonical Visual Sheet (Art)
- [ ] Phase 3: 3D Model & Production Assets
- [ ] Phase 4: Animation & Integration

---

## ⚠️ Design Lock Notice

This character sheet is the **approved canon** for Cassidy. Any code, prompts, asset generation, or UI implementation referencing Cassidy must preserve:
- Exact face shape, eye color/style, and hair color/style/braid
- The Leaf-Star Compass Charm necklace and its glow-state behavior
- The Emerald Valley base outfit silhouette and color palette
- Her defined personality traits and expression set

Do **not** alter or reinterpret her design when generating new art, animations, or descriptions — always reference this file as ground truth.
