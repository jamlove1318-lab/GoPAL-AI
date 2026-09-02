import type { CassidyAnimation, CassidyExpression, CassidyOutfitVariant } from './cassidyCharacterDesign';

/**
 * Phase 2 production specification for the canonical Cassidy asset.
 *
 * This is a source-of-truth handoff contract for external art/3D production.
 * It describes the asset that will eventually be consumed by the existing
 * Cassidy runtime; it does not own Cassidy's intelligence or state.
 */
export type CassidyReferenceView = 'front' | 'three-quarter-front' | 'side' | 'three-quarter-back' | 'back';
export type CassidyProductionAssetKind =
  | 'hero'
  | 'turnaround'
  | 'face'
  | 'eyes'
  | 'hair'
  | 'outfit'
  | 'expression-sheet'
  | 'pose-sheet'
  | 'accessory'
  | 'material-sheet'
  | 'model'
  | 'texture'
  | 'rig'
  | 'animation';

export interface CassidyColorSpec {
  id: string;
  name: string;
  hex: string;
  usage: string;
}

export interface CassidyMaterialSpec {
  slot: 'skin' | 'hair' | 'eyes' | 'brows' | 'outfit' | 'shoes' | 'accessory';
  consistencyKey: string;
  surface: string;
  roughnessDirection: string;
  mobilePriority: 'critical' | 'high' | 'normal';
}

export interface CassidyReferenceAsset {
  id: string;
  kind: CassidyProductionAssetKind;
  required: boolean;
  description: string;
  views?: CassidyReferenceView[];
  approvedSourceUri?: string;
  version: string;
}

export interface CassidyProductionSpec {
  characterId: 'cassidy';
  specificationVersion: string;
  canonicalDesignVersion: string;
  identityLocked: boolean;
  visualTarget: 'premium-stylized-2.5d-3d-game-character';
  primaryCamera: 'full-body-three-quarter';
  canonicalReferenceViews: CassidyReferenceView[];
  expressions: readonly CassidyExpression[];
  animations: readonly CassidyAnimation[];
  outfits: readonly CassidyOutfitVariant[];
  colors: readonly CassidyColorSpec[];
  materials: readonly CassidyMaterialSpec[];
  requiredAssets: readonly CassidyReferenceAsset[];
  geometryRequirements: readonly string[];
  rigRequirements: readonly string[];
  textureRequirements: readonly string[];
  mobileRequirements: readonly string[];
  consistencyRules: readonly string[];
}

export const CASSIDY_PRODUCTION_COLORS: readonly CassidyColorSpec[] = [
  { id: 'emerald', name: 'Signature Emerald', hex: '#0F8A62', usage: 'restrained outfit and world accent' },
  { id: 'emerald-glow', name: 'Charm Glow', hex: '#66E0B5', usage: 'signature accessory emissive response' },
  { id: 'gold', name: 'Warm Gold', hex: '#D6A84F', usage: 'small trim and accessory metal accent' },
  { id: 'warm-beige', name: 'Warm Beige', hex: '#D8C2A7', usage: 'base clothing and natural material support' },
  { id: 'soft-cream', name: 'Soft Cream', hex: '#F3E7D3', usage: 'top/shirt highlight family' },
  { id: 'deep-chocolate', name: 'Deep Chocolate Hair', hex: '#3B2419', usage: 'canonical hair base' },
  { id: 'espresso-highlight', name: 'Espresso Hair Highlight', hex: '#70462F', usage: 'controlled hair highlight family' },
  { id: 'near-black-eye', name: 'Near-Black Eye', hex: '#17110E', usage: 'canonical iris/pupil family' },
];

export const CASSIDY_PRODUCTION_MATERIALS: readonly CassidyMaterialSpec[] = [
  { slot: 'skin', consistencyKey: 'cassidy-skin-v1', surface: 'clean stylized skin with gentle tonal variation', roughnessDirection: 'soft satin; avoid plastic gloss', mobilePriority: 'critical' },
  { slot: 'hair', consistencyKey: 'cassidy-hair-v1', surface: 'grouped dark-brown hair with directional sheen', roughnessDirection: 'controlled directional sheen', mobilePriority: 'critical' },
  { slot: 'eyes', consistencyKey: 'cassidy-eyes-v1', surface: 'sclera + layered near-black iris + pupil + cornea', roughnessDirection: 'corneal highlight only where light reaches', mobilePriority: 'critical' },
  { slot: 'brows', consistencyKey: 'cassidy-brows-v1', surface: 'authored brow geometry or equivalent facial control', roughnessDirection: 'matte/skin-compatible', mobilePriority: 'high' },
  { slot: 'outfit', consistencyKey: 'cassidy-outfit-v1', surface: 'fabric layers with readable seams and folds', roughnessDirection: 'fabric-dependent, generally matte/satin', mobilePriority: 'high' },
  { slot: 'shoes', consistencyKey: 'cassidy-shoes-v1', surface: 'durable practical footwear', roughnessDirection: 'mixed leather/fabric response', mobilePriority: 'normal' },
  { slot: 'accessory', consistencyKey: 'cassidy-accessory-v1', surface: 'small crafted metal/material with restrained emissive core', roughnessDirection: 'metal/material contrast plus controlled emissive', mobilePriority: 'high' },
];

export const CASSIDY_REQUIRED_ASSETS: readonly CassidyReferenceAsset[] = [
  { id: 'cassidy-hero-v1', kind: 'hero', required: true, description: 'Canonical three-quarter full-body hero showing the approved identity.', version: 'v1' },
  { id: 'cassidy-turnaround-v1', kind: 'turnaround', required: true, description: 'Front, three-quarter front, side, three-quarter back and back consistency sheet.', views: ['front', 'three-quarter-front', 'side', 'three-quarter-back', 'back'], version: 'v1' },
  { id: 'cassidy-face-v1', kind: 'face', required: true, description: 'Canonical face construction and framing reference.', views: ['front', 'three-quarter-front', 'side'], version: 'v1' },
  { id: 'cassidy-eyes-v1', kind: 'eyes', required: true, description: 'Near-black eye material, gaze, eyelid and catchlight reference.', version: 'v1' },
  { id: 'cassidy-hair-v1', kind: 'hair', required: true, description: 'Dark chocolate layered hairstyle silhouette and strand-group reference.', views: ['front', 'three-quarter-front', 'side', 'back'], version: 'v1' },
  { id: 'cassidy-outfit-base-v1', kind: 'outfit', required: true, description: 'Canonical Emerald Valley base outfit construction reference.', views: ['front', 'three-quarter-front', 'side', 'back'], version: 'v1' },
  { id: 'cassidy-expression-sheet-v1', kind: 'expression-sheet', required: true, description: 'Eight canonical expressions plus neutral control.', version: 'v1' },
  { id: 'cassidy-pose-sheet-v1', kind: 'pose-sheet', required: true, description: 'Locomotion, listening, explaining, greeting, pointing, discovery and celebration poses.', version: 'v1' },
  { id: 'cassidy-accessory-v1', kind: 'accessory', required: true, description: 'Leaf-star-compass charm geometry, material and state reference.', version: 'v1' },
  { id: 'cassidy-material-sheet-v1', kind: 'material-sheet', required: true, description: 'Approved color/material swatches and surface-response reference.', version: 'v1' },
  { id: 'cassidy-model-v1', kind: 'model', required: false, description: 'Production 3D model generated only after visual references are approved.', version: 'v1' },
  { id: 'cassidy-rig-v1', kind: 'rig', required: false, description: 'Full-body and facial rig generated from the approved model.', version: 'v1' },
  { id: 'cassidy-animation-v1', kind: 'animation', required: false, description: 'Canonical locomotion and emotional animation library.', version: 'v1' },
];

export const CASSIDY_PRODUCTION_SPEC: CassidyProductionSpec = {
  characterId: 'cassidy',
  specificationVersion: 'phase-2-v1',
  canonicalDesignVersion: 'master-bible-v1',
  identityLocked: true,
  visualTarget: 'premium-stylized-2.5d-3d-game-character',
  primaryCamera: 'full-body-three-quarter',
  canonicalReferenceViews: ['front', 'three-quarter-front', 'side', 'three-quarter-back', 'back'],
  expressions: ['neutral', 'happy', 'curious', 'surprised', 'thoughtful', 'excited', 'concerned', 'playful'],
  animations: ['idle', 'walk', 'run', 'turn', 'sit', 'talk', 'gesture', 'point', 'celebrate', 'think', 'react'],
  outfits: ['base', 'spring', 'summer', 'autumn', 'winter', 'emerald-valley', 'japanese-world', 'french-world', 'festival', 'adventure'],
  colors: CASSIDY_PRODUCTION_COLORS,
  materials: CASSIDY_PRODUCTION_MATERIALS,
  requiredAssets: CASSIDY_REQUIRED_ASSETS,
  geometryRequirements: [
    'Preserve one canonical head and face across every angle.',
    'Use a readable three-quarter silhouette at game-camera distance.',
    'Model complete hands and feet; no placeholder geometry in the production asset.',
    'Keep hair in authored groups suitable for controlled secondary motion.',
    'Keep the signature charm small enough to remain secondary to the face.',
    'Build clothing as movement-safe layered geometry with clean intersections.',
  ],
  rigRequirements: [
    'Full-body skeleton for locomotion, turning, sitting and gestures.',
    'Facial controls or blendshapes for the eight canonical expressions.',
    'Independent eye/gaze controls with natural eyelid behavior.',
    'Hand controls sufficient for greeting, explaining, pointing and discovery.',
    'Secondary motion controls for hair and signature accessory.',
  ],
  textureRequirements: [
    'Keep face and eye readability as the highest texture priority.',
    'Use authored material separation rather than one noisy baked texture.',
    'Preserve dark-brown hair identity under different world lighting.',
    'Keep accessory emissive response restrained and state-driven.',
    'Prepare texture variants/LODs without changing canonical colors or identity.',
  ],
  mobileRequirements: [
    'Provide at least LOD0, LOD1 and LOD2 production targets.',
    'Preserve face, eyes, hair silhouette and hands at lower LODs.',
    'Use texture compression appropriate for the target mobile renderer.',
    'Avoid expensive per-frame effects that are not essential to Cassidy identity.',
    'Measure memory, loading time, draw calls and animation cost before final integration.',
  ],
  consistencyRules: [
    'The approved Phase 1 concept is the visual identity reference; later assets do not redefine Cassidy.',
    'World variants may change clothing accents and materials but never the face, hair identity or core silhouette.',
    'Every external asset must be traceable to a canonical reference version.',
    'Do not generate a new random Cassidy to fill a missing production asset.',
    'Cassidy intelligence, memory, relationships, learning and decisions remain owned by Cassidy engines.',
  ],
};

export function getCassidyProductionAsset(id: string): CassidyReferenceAsset | null {
  return CASSIDY_REQUIRED_ASSETS.find(asset => asset.id === id) ?? null;
}

export function validateCassidyProductionSpec(spec: CassidyProductionSpec = CASSIDY_PRODUCTION_SPEC): string[] {
  const errors: string[] = [];
  if (spec.characterId !== 'cassidy') errors.push('Canonical character id must remain cassidy.');
  if (!spec.identityLocked) errors.push('Cassidy production identity must be locked before asset production.');
  if (!spec.canonicalReferenceViews.includes('front') || !spec.canonicalReferenceViews.includes('three-quarter-front') || !spec.canonicalReferenceViews.includes('side') || !spec.canonicalReferenceViews.includes('back')) {
    errors.push('Canonical reference views are incomplete.');
  }
  for (const required of ['neutral', 'happy', 'curious', 'surprised', 'thoughtful', 'excited', 'concerned', 'playful'] as const) {
    if (!spec.expressions.includes(required)) errors.push(`Missing canonical expression: ${required}.`);
  }
  for (const required of ['idle', 'walk', 'run', 'turn', 'sit', 'talk', 'gesture', 'point', 'celebrate', 'think', 'react'] as const) {
    if (!spec.animations.includes(required)) errors.push(`Missing canonical animation: ${required}.`);
  }
  const requiredKinds = ['hero', 'turnaround', 'face', 'eyes', 'hair', 'outfit', 'expression-sheet', 'pose-sheet', 'accessory', 'material-sheet'] as const;
  for (const kind of requiredKinds) {
    if (!spec.requiredAssets.some(asset => asset.kind === kind && asset.required)) errors.push(`Missing required production asset kind: ${kind}.`);
  }
  return errors;
}
