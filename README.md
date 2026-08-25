# 🌸 GoPAL-AI: Autonomous Companion & Living Language Sanctuary

<p align="center">
  <img src="./assets/icon.png" width="120" height="120" alt="GoPAL AI Logo" />
</p>

<p align="center">
  <b>An authentic living world for language immersion and contextual companionship.</b><br/>
  Powered by 12 autonomous engines, multi-turn Socratic roleplay, and persistent world continuity.
</p>

---

## ✨ Key Features

- 🌿 **Living Sanctuary Hub (`Home`)**:
  - Contextual time-of-day greetings & "While you were away..." continuity recaps.
  - **Natural Language World DJ**: Dynamically parses learner intent into curated playlists and world routing.
  - **Continuity Cards**: Unfinished bookmark recovery for frictionless re-entry.
  - **Seasonal Festivals**: Hanami Cherry Blossom, Tanabata Star Festival, Momijigari Maple Harvest, and Snow Lantern celebrations.

- 🍵 **Interactive Sunlit Study (`Study`)**:
  - **Living Bonsai**: 5-stage watering and growth progression.
  - **Matcha Crafting Workshop**: Measure chashaku scoops, pour 80°C hot water, and tap-whisk chasen in rapid W-motion for velvety microfoam.
  - **Calligraphy & Stroke Studio**: Japanese brush stroke recognition with step-by-step stroke orders and official *Gokujou* seal stamps.
  - **Soundscape Mixer Deck**: 4-channel Kyoto atmosphere audio mixer (Rain, Lo-Fi beats, Vinyl crackle, Windchimes).
  - **Pitch Accent Shadow Trainer**: Syllable-by-syllable pitch step-through and cadence practice.
  - **World Radio**: 4 ambient lo-fi stations.

- 🗺️ **Living World Map (`World Map`)**:
  - Interactive map of Emerald Valley with location familiarity stages, revisit tracking, and resident NPC bios.
  - **World Threshold Transitions**: Atmospheric location transitions with compass animations and lore narration.
  - **Cultural Wonder Prompts**: Socratic object inspection with progressive cultural clues.
  - **Ema Wish Ritual**: Inscribe personal wooden plaques and hang them at the Moonlit Zen Garden.

- 📖 **Personal Chronicle & Journey (`Journey`)**:
  - Timeline milestones, narrative chapter reviews, and **Then vs Now** speech growth comparisons.
  - **Conversation Archive Transcripts**: Step-by-step roleplay dialogue review with Romaji phonetics and audio drills.
  - **Personal Time Capsules**: Seal private goals with unlock milestone dates.
  - **Quest & Emerald Souvenir Shop**: Daily world quests, personal challenges, rare seeds, and bonsai fertilizers.

- 🏛️ **Memory Museum (`Museum`)**:
  - 4-way exhibit archive: Commemorative Postcards, Learner Creations, Cultural Keepsakes, and Canonical Story Memories.

- ⚙️ **Runtime Diagnostics Suite (`Settings`)**:
  - Full self-verification suite verifying all 12 engines and storage layers live on device.

---

## 🏛️ Autonomous Architecture (12 Engines)

```
                       ┌─────────────────────────────────────┐
                       │       Experience Director           │
                       │   (Intent Composer & Explainability)│
                       └──────────────────┬──────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
┌──────────────┐                  ┌──────────────┐                  ┌──────────────┐
│ World Engine │                  │ Tutor Engine │                  │Character Eng │
│ & Continuity │                  │ & World DJ   │                  │  (Cassidy)   │
└───────┬──────┘                  └───────┬──────┘                  └───────┬──────┘
        │                                 │                                 │
        └─────────────────────────────────┼─────────────────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Central Event Bus & Memory Core    │
                      │ (Learning, Character, Story, World)   │
                      └───────────────────┬───────────────────┘
                                          │
        ┌───────────────────┬─────────────┴───────┬───────────────────┐
        ▼                   ▼                     ▼                   ▼
┌──────────────┐    ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
│Journey Engine│    │Knowledge Eng │      │ Economy &    │    │ Audio Engine │
│(Then vs Now) │    │(Constellation│      │ Quest Engine │    │ (Soundscape) │
└──────────────┘    └──────────────┘      └──────────────┘    └──────────────┘
```

---

## 📱 EAS Cloud & Mobile Build

This project is pre-configured with **EAS Build** ([`eas.json`](./eas.json)) linked to project ID `d5c5fd84-2317-4bcd-b9e0-3a0fc15938cd`.

### 1. Build Standalone Android APK (Direct Phone Install)
```bash
eas build -p android --profile preview
```
*Generates an installable `.apk` file that installs directly onto physical Android devices without requiring Expo Go.*

### 2. Build Android App Bundle (Google Play Store)
```bash
eas build -p android --profile production
```

### 3. Build iOS Development / Simulator Client
```bash
eas build -p ios --profile preview
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js >= 18.0.0
- Yarn package manager

### Setup & Run
```bash
# 1. Install dependencies
yarn install

# 2. Typecheck
npx tsc --noEmit

# 3. Start development server (Tunnel mode)
npx expo start --tunnel
```

---

## 📜 License
Private & Confidential — GoPAL-AI Project.
