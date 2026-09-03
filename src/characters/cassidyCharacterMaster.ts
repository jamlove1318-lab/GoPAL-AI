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
  return errors;
}
