import type { CassidyAnimation, CassidyExpression } from './cassidyCharacterDesign';

/**
 * Names shared by the art pipeline and the runtime. The production artist is
 * free to choose topology and rig implementation, but exported controls must
 * resolve to these stable semantic names.
 */
export const CASSIDY_RUNTIME_ANIMATION_CLIPS: readonly CassidyAnimation[] = [
  'idle',
  'walk',
  'run',
  'turn',
  'sit',
  'talk',
  'gesture',
  'point',
  'celebrate',
  'think',
  'react',
] as const;

export const CASSIDY_RUNTIME_EXPRESSIONS: readonly CassidyExpression[] = [
  'neutral',
  'happy',
  'curious',
  'surprised',
  'thoughtful',
  'excited',
  'concerned',
  'playful',
] as const;

export const CASSIDY_RUNTIME_NODES = {
  root: 'Cassidy_Root',
  body: 'Cassidy_Body',
  head: 'Cassidy_Head',
  face: 'Cassidy_Face',
  leftEye: 'Cassidy_Eye_L',
  rightEye: 'Cassidy_Eye_R',
  leftEyelid: 'Cassidy_Eyelid_L',
  rightEyelid: 'Cassidy_Eyelid_R',
  leftHand: 'Cassidy_Hand_L',
  rightHand: 'Cassidy_Hand_R',
  charm: 'Cassidy_Charm',
  hairRoot: 'Cassidy_Hair_Root',
} as const;

export const CASSIDY_RUNTIME_MORPHS = {
  neutral: 'expression_neutral',
  happy: 'expression_happy',
  curious: 'expression_curious',
  surprised: 'expression_surprised',
  thoughtful: 'expression_thoughtful',
  excited: 'expression_excited',
  concerned: 'expression_concerned',
  playful: 'expression_playful',
} as const satisfies Record<CassidyExpression, string>;

export const CASSIDY_RUNTIME_GAZE = {
  leftEye: CASSIDY_RUNTIME_NODES.leftEye,
  rightEye: CASSIDY_RUNTIME_NODES.rightEye,
  leftEyelid: CASSIDY_RUNTIME_NODES.leftEyelid,
  rightEyelid: CASSIDY_RUNTIME_NODES.rightEyelid,
} as const;

export interface CassidyRuntimeModelValidationResult {
  valid: boolean;
  missingAnimations: CassidyAnimation[];
  missingExpressions: CassidyExpression[];
  missingNodes: string[];
}

/** Validate an imported GLB against the stable semantic runtime contract. */
export function validateCassidyRuntimeModel(input: {
  animationNames: readonly string[];
  morphNames: readonly string[];
  nodeNames: readonly string[];
}): CassidyRuntimeModelValidationResult {
  const animationNames = new Set(input.animationNames);
  const morphNames = new Set(input.morphNames);
  const nodeNames = new Set(input.nodeNames);

  const missingAnimations = CASSIDY_RUNTIME_ANIMATION_CLIPS.filter(
    name => !animationNames.has(name),
  ) as CassidyAnimation[];
  const missingExpressions = CASSIDY_RUNTIME_EXPRESSIONS.filter(
    name => !morphNames.has(CASSIDY_RUNTIME_MORPHS[name]),
  ) as CassidyExpression[];
  const missingNodes = Object.values(CASSIDY_RUNTIME_NODES).filter(
    name => !nodeNames.has(name),
  );

  return {
    valid:
      missingAnimations.length === 0 &&
      missingExpressions.length === 0 &&
      missingNodes.length === 0,
    missingAnimations,
    missingExpressions,
    missingNodes,
  };
}
