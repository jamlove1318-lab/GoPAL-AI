import type { CassidyAnimation, CassidyExpression } from './cassidyCharacterDesign';
import type { CassidyProductionAssetKind } from './cassidyProductionSpec';

/**
 * Phase 3A canonical import contract.
 *
 * This describes the production package that an external 3D/art pipeline must
 * hand to GoPAL-AI. It contains no renderer implementation and never owns
 * Cassidy state, intelligence, memory, learning, relationships, or decisions.
 */
export type Cassidy3DFileFormat = 'glb' | 'gltf';
export type CassidyTextureFormat = 'png' | 'jpg' | 'webp' | 'ktx2';
export type CassidyAssetRole =
  | 'model'
  | 'lod0'
  | 'lod1'
  | 'lod2'
  | 'texture'
  | 'material'
  | 'rig'
  | 'animation';

export interface CassidyProductionFile {
  id: string;
  role: CassidyAssetRole;
  uri: string;
  format: Cassidy3DFileFormat | CassidyTextureFormat;
  version: string;
  sha256?: string;
  byteSize?: number;
}

export interface CassidyModelValidationProfile {
  requiredViews: readonly string[];
  requiredExpressions: readonly CassidyExpression[];
  requiredAnimations: readonly CassidyAnimation[];
  requiredMaterialSlots: readonly string[];
  requiredLods: readonly ('lod0' | 'lod1' | 'lod2')[];
  requiresFacialControls: boolean;
  requiresEyeGazeControls: boolean;
  requiresHandControls: boolean;
  requiresSecondaryMotion: boolean;
}

export interface CassidyProductionPackage {
  characterId: 'cassidy';
  packageVersion: string;
  canonicalDesignVersion: string;
  productionSpecVersion: string;
  identityLocked: true;
  files: readonly CassidyProductionFile[];
  validatedViews: readonly string[];
  validatedExpressions: readonly CassidyExpression[];
  validatedAnimations: readonly CassidyAnimation[];
  validatedMaterialSlots: readonly string[];
  controls: {
    facial: boolean;
    eyeGaze: boolean;
    hands: boolean;
    secondaryMotion: boolean;
  };
  validationProfile: CassidyModelValidationProfile;
}

export interface CassidyAssetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const CASSIDY_IMPORT_VALIDATION_PROFILE: CassidyModelValidationProfile = {
  requiredViews: ['front', 'three-quarter-front', 'side', 'three-quarter-back', 'back'],
  requiredExpressions: ['neutral', 'happy', 'curious', 'surprised', 'thoughtful', 'excited', 'concerned', 'playful'],
  requiredAnimations: ['idle', 'walk', 'run', 'turn', 'sit', 'talk', 'gesture', 'point', 'celebrate', 'think', 'react'],
  requiredMaterialSlots: ['skin', 'hair', 'eyes', 'brows', 'outfit', 'shoes', 'accessory'],
  requiredLods: ['lod0', 'lod1', 'lod2'],
  requiresFacialControls: true,
  requiresEyeGazeControls: true,
  requiresHandControls: true,
  requiresSecondaryMotion: true,
};

export const CASSIDY_PRODUCTION_ASSET_KINDS: readonly CassidyProductionAssetKind[] = [
  'hero',
  'turnaround',
  'face',
  'eyes',
  'hair',
  'outfit',
  'expression-sheet',
  'pose-sheet',
  'accessory',
  'material-sheet',
  'model',
  'texture',
  'rig',
  'animation',
];

export function createEmptyCassidyProductionPackage(): CassidyProductionPackage {
  return {
    characterId: 'cassidy',
    packageVersion: 'phase-3a-v1',
    canonicalDesignVersion: 'master-bible-v1',
    productionSpecVersion: 'phase-2-v1',
    identityLocked: true,
    files: [],
    validatedViews: [],
    validatedExpressions: [],
    validatedAnimations: [],
    validatedMaterialSlots: [],
    controls: { facial: false, eyeGaze: false, hands: false, secondaryMotion: false },
    validationProfile: CASSIDY_IMPORT_VALIDATION_PROFILE,
  };
}

function includesAll<T>(actual: readonly T[], required: readonly T[]): boolean {
  return required.every(value => actual.includes(value));
}

function expectedFormat(role: CassidyAssetRole): readonly (Cassidy3DFileFormat | CassidyTextureFormat)[] {
  if (role === 'texture' || role === 'material') return ['png', 'jpg', 'webp', 'ktx2'];
  return ['glb', 'gltf'];
}

export function validateCassidyProductionPackage(
  pkg: CassidyProductionPackage,
): CassidyAssetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const profile = pkg.validationProfile;

  if (pkg.characterId !== 'cassidy') errors.push('Production package character id must remain cassidy.');
  if (!pkg.identityLocked) errors.push('Production package cannot unlock the canonical Cassidy identity.');
  if (!pkg.canonicalDesignVersion) errors.push('Canonical design version is required.');
  if (!pkg.productionSpecVersion) errors.push('Production specification version is required.');
  if (!includesAll(pkg.validatedViews, profile.requiredViews)) errors.push('Canonical model views are incomplete.');
  if (!includesAll(pkg.validatedExpressions, profile.requiredExpressions)) errors.push('Canonical facial expressions are incomplete.');
  if (!includesAll(pkg.validatedAnimations, profile.requiredAnimations)) errors.push('Canonical animation coverage is incomplete.');
  if (!includesAll(pkg.validatedMaterialSlots, profile.requiredMaterialSlots)) errors.push('Canonical material slots are incomplete.');
  if (profile.requiresFacialControls && !pkg.controls.facial) errors.push('Facial controls are required.');
  if (profile.requiresEyeGazeControls && !pkg.controls.eyeGaze) errors.push('Independent eye/gaze controls are required.');
  if (profile.requiresHandControls && !pkg.controls.hands) errors.push('Hand controls are required.');
  if (profile.requiresSecondaryMotion && !pkg.controls.secondaryMotion) errors.push('Secondary-motion controls are required.');

  const roles = new Set(pkg.files.map(file => file.role));
  for (const lod of profile.requiredLods) {
    if (!roles.has(lod)) errors.push(`Missing required Cassidy ${lod.toUpperCase()} asset.`);
  }
  if (!roles.has('model')) errors.push('Missing canonical Cassidy model asset.');
  if (!roles.has('rig')) errors.push('Missing canonical Cassidy rig asset.');
  if (!roles.has('animation')) errors.push('Missing canonical Cassidy animation package.');

  const seenIds = new Set<string>();
  for (const file of pkg.files) {
    if (seenIds.has(file.id)) errors.push(`Duplicate production file id: ${file.id}.`);
    seenIds.add(file.id);
    if (!file.uri.trim()) errors.push(`Missing URI for production file: ${file.id}.`);
    if (!file.version.trim()) errors.push(`Missing version for production file: ${file.id}.`);
    if (!expectedFormat(file.role).includes(file.format)) {
      errors.push(`Invalid format ${file.format} for ${file.role} asset ${file.id}.`);
    }
    if (file.byteSize !== undefined && file.byteSize <= 0) warnings.push(`Non-positive byte size supplied for ${file.id}.`);
    if (file.role === 'model' && !file.sha256) warnings.push(`Model checksum is not supplied for ${file.id}.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Converts a validated production package into the minimal model/rig/animation
 * metadata expected by the existing CassidyCharacterAssetSet.
 */
export function getCassidyRuntimeAssetUris(pkg: CassidyProductionPackage): {
  model3dUri?: string;
  rigVersion: string;
  animationVersion: string;
} {
  const model = pkg.files.find(file => file.role === 'model');
  const rig = pkg.files.find(file => file.role === 'rig');
  const animation = pkg.files.find(file => file.role === 'animation');

  return {
    model3dUri: model?.uri,
    rigVersion: rig?.version ?? 'pending',
    animationVersion: animation?.version ?? 'pending',
  };
}
