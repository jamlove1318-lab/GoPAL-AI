import type { CassidyExpression, CassidyAnimation, CassidyOutfitVariant } from './cassidyCharacterDesign';
import { CASSIDY_PRODUCTION_SPEC } from './cassidyProductionSpec';

/**
 * Phase 3C: the visual identity layer that sits above any particular renderer
 * or 3D asset. This is intentionally descriptive rather than renderer-specific.
 *
 * The production model must conform to this contract; the contract never
 * changes merely because a modeling tool, renderer, or asset format changes.
 */
export interface CassidyFacialIdentityContract {
  canonicalHead: 'single-consistent-head-across-all-views';
  facePriority: 'highest';
  eyePriority: 'highest';
  landmarks: readonly [
    'brow-arc',
    'eye-opening',
    'eye-spacing',
    'eye-corner-angle',
    'nose-bridge',
    'nose-tip',
    'cheek-volume',
    'mouth-width',
    'upper-lip-curve',
    'chin-shape',
    'jaw-contour',
  ];
  expressionPrinciple: 'recognizable-as-cassidy-before-expression-is-applied';
  gazePrinciple: 'eyes-lead-attention-with-natural-eyelid-support';
}

export interface CassidyHairIdentityContract {
  baseColor: '#3B2419';
  highlightColor: '#70462F';
  construction: 'authored-layered-groups';
  silhouette: 'stable-across-worlds';
  motion: 'controlled-secondary-motion';
  rule: 'never-change-hair-identity-to-match-a-world';
}

export interface CassidyBodyIdentityContract {
  proportionRule: 'natural-balanced-full-body-proportions';
  silhouetteRule: 'recognizable-at-game-camera-distance';
  hands: 'fully-modeled-and-readable';
  feet: 'fully-modeled-and-readable';
  poseRule: 'natural-weight-and-grounding';
  clothingRule: 'movement-safe-layered-construction';
}

export interface CassidyEyeIdentityContract {
  baseColor: '#17110E';
  structure: 'sclera-iris-pupil-corneal-highlight';
  gaze: 'independent-eye-and-eyelid-control';
  catchlight: 'lighting-dependent-natural';
  expressionSupport: 'eyes-and-brows-carry-emotional-intent';
}

export interface CassidyAccessoryIdentityContract {
  type: 'leaf-star-compass-companion-charm';
  role: 'signature-secondary-identity-cue';
  glowColor: '#66E0B5';
  accentColor: '#D6A84F';
  emissiveRule: 'restrained-and-state-driven';
  silhouetteRule: 'never-compete-with-face';
}

export interface CassidyOutfitIdentityContract {
  canonical: 'base';
  variants: readonly CassidyOutfitVariant[];
  worldRule: 'change-material-and-accent-not-cassidy-identity';
  construction: 'practical-adventure-learning-clothing';
}

/**
 * Visual review gates are intentionally renderer/art-tool agnostic. They make
 * the acceptance process explicit before an external asset is allowed into
 * the production registry.
 */
export type CassidyVisualReviewArea =
  | 'face'
  | 'eyes'
  | 'hair'
  | 'body'
  | 'clothing'
  | 'accessory'
  | 'expressions'
  | 'gaze'
  | 'animation'
  | 'world-consistency'
  | 'mobile-readability';

export type CassidyVisualReviewStatus = 'not-reviewed' | 'needs-revision' | 'approved';

export interface CassidyVisualReviewGate {
  area: CassidyVisualReviewArea;
  status: CassidyVisualReviewStatus;
  required: true;
  acceptanceCriteria: readonly string[];
}

export const CASSIDY_VISUAL_REVIEW_GATES: readonly CassidyVisualReviewGate[] = [
  {
    area: 'face',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Identity landmarks remain consistent across all canonical views.',
      'Cassidy remains recognizable in neutral expression before stylization effects.',
      'No generic source-character facial proportions were retained merely for convenience.',
    ],
  },
  {
    area: 'eyes',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Near-black eye family remains visually coherent with the canonical design.',
      'Iris, pupil, sclera and corneal response remain readable at game-camera distance.',
      'Gaze and eyelids can move independently without breaking the face.',
    ],
  },
  {
    area: 'hair',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Dark chocolate-brown identity and silhouette are preserved.',
      'Hair is authored as controlled groups suitable for secondary motion.',
      'World lighting does not turn the hairstyle into a different character design.',
    ],
  },
  {
    area: 'body',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Natural balanced proportions are preserved.',
      'Hands and feet are complete and readable.',
      'Pose and deformation preserve natural weight and grounding.',
    ],
  },
  {
    area: 'clothing',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Clothing reads as practical adventure/learning clothing.',
      'Layered construction remains stable during movement.',
      'World variants modify clothing rather than Cassidy identity.',
    ],
  },
  {
    area: 'accessory',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Leaf-star-compass silhouette is recognizable.',
      'Glow is restrained and state-driven.',
      'The charm never competes with Cassidy\'s face.',
    ],
  },
  {
    area: 'expressions',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'All eight canonical expressions are distinct and recognizable.',
      'Expression deformation preserves Cassidy\'s underlying facial identity.',
      'Expressions can transition without visible mesh or rig failure.',
    ],
  },
  {
    area: 'gaze',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Eyes can target attention independently of head rotation.',
      'Eyelids follow gaze naturally.',
      'Eye motion does not produce an artificial or disconnected appearance.',
    ],
  },
  {
    area: 'animation',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'All eleven canonical animation intents have production-ready clips.',
      'Movement has believable weight, timing and continuity.',
      'Animation communicates attention and personality without inventing engine decisions.',
    ],
  },
  {
    area: 'world-consistency',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Emerald Valley, Japanese World and French World variants remain unmistakably Cassidy.',
      'Face, eyes, hair identity, proportions and core silhouette remain stable.',
      'Only approved world-specific clothing/material accents change.',
    ],
  },
  {
    area: 'mobile-readability',
    status: 'not-reviewed',
    required: true,
    acceptanceCriteria: [
      'Face, eyes and hair silhouette remain readable at target gameplay distance.',
      'LOD transitions do not visibly redefine Cassidy.',
      'Performance measurements are captured before final registry integration.',
    ],
  },
];

export interface CassidyCharacterMasterContract {
  contractVersion: 'phase-3c-v1';
  characterId: 'cassidy';
  identityLocked: true;
  sourceOfTruth: 'approved-canonical-concept';
  visualTarget: 'premium-stylized-2.5d-3d-game-character';
  facial: CassidyFacialIdentityContract;
  hair: CassidyHairIdentityContract;
  body: CassidyBodyIdentityContract;
  eyes: CassidyEyeIdentityContract;
  accessory: CassidyAccessoryIdentityContract;
  outfit: CassidyOutfitIdentityContract;
  expressions: readonly CassidyExpression[];
  animations: readonly CassidyAnimation[];
  productionSpecVersion: string;
}

export const CASSIDY_CHARACTER_MASTER: CassidyCharacterMasterContract = {
  contractVersion: 'phase-3c-v1',
  characterId: 'cassidy',
  identityLocked: true,
  sourceOfTruth: 'approved-canonical-concept',
  visualTarget: CASSIDY_PRODUCTION_SPEC.visualTarget,
  facial: {
    canonicalHead: 'single-consistent-head-across-all-views',
    facePriority: 'highest',
    eyePriority: 'highest',
    landmarks: [
      'brow-arc',
      'eye-opening',
      'eye-spacing',
      'eye-corner-angle',
      'nose-bridge',
      'nose-tip',
      'cheek-volume',
      'mouth-width',
      'upper-lip-curve',
      'chin-shape',
      'jaw-contour',
    ],
    expressionPrinciple: 'recognizable-as-cassidy-before-expression-is-applied',
    gazePrinciple: 'eyes-lead-attention-with-natural-eyelid-support',
  },
  hair: {
    baseColor: '#3B2419',
    highlightColor: '#70462F',
    construction: 'authored-layered-groups',
    silhouette: 'stable-across-worlds',
    motion: 'controlled-secondary-motion',
    rule: 'never-change-hair-identity-to-match-a-world',
  },
  body: {
    proportionRule: 'natural-balanced-full-body-proportions',
    silhouetteRule: 'recognizable-at-game-camera-distance',
    hands: 'fully-modeled-and-readable',
    feet: 'fully-modeled-and-readable',
    poseRule: 'natural-weight-and-grounding',
    clothingRule: 'movement-safe-layered-construction',
  },
  eyes: {
    baseColor: '#17110E',
    structure: 'sclera-iris-pupil-corneal-highlight',
    gaze: 'independent-eye-and-eyelid-control',
    catchlight: 'lighting-dependent-natural',
    expressionSupport: 'eyes-and-brows-carry-emotional-intent',
  },
  accessory: {
    type: 'leaf-star-compass-companion-charm',
    role: 'signature-secondary-identity-cue',
    glowColor: '#66E0B5',
    accentColor: '#D6A84F',
    emissiveRule: 'restrained-and-state-driven',
    silhouetteRule: 'never-compete-with-face',
  },
  outfit: {
    canonical: 'base',
    variants: CASSIDY_PRODUCTION_SPEC.outfits,
    worldRule: 'change-material-and-accent-not-cassidy-identity',
    construction: 'practical-adventure-learning-clothing',
  },
  expressions: CASSIDY_PRODUCTION_SPEC.expressions,
  animations: CASSIDY_PRODUCTION_SPEC.animations,
  productionSpecVersion: CASSIDY_PRODUCTION_SPEC.specificationVersion,
};

export function validateCassidyCharacterMaster(
  master: CassidyCharacterMasterContract = CASSIDY_CHARACTER_MASTER,
): string[] {
  const errors: string[] = [];
  if (master.characterId !== 'cassidy') errors.push('Character master id must remain cassidy.');
  if (!master.identityLocked) errors.push('Character master identity must remain locked.');
  if (master.sourceOfTruth !== 'approved-canonical-concept') errors.push('Canonical concept must remain the visual source of truth.');
  if (master.expressions.length !== 8) errors.push('Cassidy must retain all 8 canonical expressions.');
  if (master.animations.length !== 11) errors.push('Cassidy must retain all 11 canonical animations.');
  if (master.hair.baseColor !== '#3B2419') errors.push('Canonical dark chocolate-brown hair color changed unexpectedly.');
  if (master.eyes.baseColor !== '#17110E') errors.push('Canonical near-black eye color changed unexpectedly.');
  if (CASSIDY_VISUAL_REVIEW_GATES.length !== 11) errors.push('Cassidy visual review gate coverage is incomplete.');
  return errors;
}
