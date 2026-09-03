import type { CassidyAnimation, CassidyExpression } from './cassidyCharacterDesign';

export interface CassidyBlenderModelManifest {
  path: string;
  format: 'glb' | 'gltf';
  bytes: number;
  sha256: string;
}

export interface CassidyBlenderValidationManifest {
  ready: boolean;
  animation: {
    valid: boolean;
    missing_animations: string[];
    empty_animations: string[];
    unbound_animations?: string[];
  };
  rig: {
    armature_found: boolean;
    body_rig_valid: boolean;
    gaze_controls_valid: boolean;
  };
  lod: {
    valid: boolean;
  };
  review?: {
    valid: boolean;
    complete: boolean;
  };
}

/** Exact portable JSON boundary emitted by tools/blender/characters/cassidy_package.py. */
export interface CassidyBlenderPackageManifest {
  package_version: string;
  character: 'Cassidy';
  model: CassidyBlenderModelManifest;
  source: string | null;
  required_expressions: readonly CassidyExpression[];
  required_animations: readonly CassidyAnimation[];
  validation: CassidyBlenderValidationManifest;
  model_version?: string;
  rig_version?: string;
  animation_version?: string;
  texture_version?: string;
}

export interface CassidyBlenderManifestValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_EXPRESSIONS: readonly CassidyExpression[] = [
  'neutral', 'happy', 'curious', 'surprised', 'thoughtful', 'excited', 'concerned', 'playful',
];

const REQUIRED_ANIMATIONS: readonly CassidyAnimation[] = [
  'idle', 'walk', 'run', 'turn', 'sit', 'talk', 'gesture', 'point', 'celebrate', 'think', 'react',
];

const REQUIRED_LODS = ['LOD0', 'LOD1', 'LOD2'] as const;

function sameMembers<T>(actual: readonly T[], expected: readonly T[]): boolean {
  return actual.length === expected.length && expected.every(value => actual.includes(value));
}

export function validateCassidyBlenderPackageManifest(
  manifest: CassidyBlenderPackageManifest,
): CassidyBlenderManifestValidationResult {
  const errors: string[] = [];

  if (manifest.character !== 'Cassidy') errors.push('Blender manifest character must be Cassidy.');
  if (!manifest.package_version.trim()) errors.push('Blender package version is required.');
  if (!manifest.model.path.trim()) errors.push('Blender model path is required.');
  if (!/^[a-f0-9]{64}$/i.test(manifest.model.sha256)) errors.push('Blender model SHA-256 is invalid.');
  if (manifest.model.bytes <= 0) errors.push('Blender model byte size must be positive.');
  if (!sameMembers(manifest.required_expressions, REQUIRED_EXPRESSIONS)) errors.push('Blender expression coverage does not match the canonical Cassidy contract.');
  if (!sameMembers(manifest.required_animations, REQUIRED_ANIMATIONS)) errors.push('Blender animation coverage does not match the canonical Cassidy contract.');
  if (!manifest.validation.ready) errors.push('Blender production validation is not ready.');
  if (!manifest.validation.animation.valid) errors.push('Blender animation validation failed.');
  if (manifest.validation.animation.missing_animations.length) errors.push('Blender manifest reports missing animations.');
  if (manifest.validation.animation.empty_animations.length) errors.push('Blender manifest reports empty animations.');
  if (manifest.validation.animation.unbound_animations?.length) errors.push('Blender manifest reports animations not bound to the Cassidy rig.');
  if (!manifest.validation.rig.armature_found) errors.push('Cassidy armature was not found by Blender validation.');
  if (!manifest.validation.rig.body_rig_valid) errors.push('Cassidy body rig validation failed.');
  if (!manifest.validation.rig.gaze_controls_valid) errors.push('Cassidy eye/gaze control validation failed.');
  if (!manifest.validation.lod.valid) errors.push(`Cassidy LOD validation failed; required LODs are ${REQUIRED_LODS.join(', ')}.`);
  if (manifest.validation.review && (!manifest.validation.review.valid || !manifest.validation.review.complete)) {
    errors.push('Cassidy visual review is incomplete or invalid.');
  }

  return { valid: errors.length === 0, errors };
}
