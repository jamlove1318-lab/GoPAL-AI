import type { CassidyProductionAssetManifest } from './cassidyProductionAssetRegistry';
import {
  CASSIDY_RUNTIME_ANIMATION_CLIPS,
  CASSIDY_RUNTIME_EXPRESSIONS,
  CASSIDY_RUNTIME_NODES,
  validateCassidyRuntimeModel,
} from './cassidyRuntimeModelContract';

export interface CassidyRuntimeProductionPackage {
  characterId: 'cassidy';
  packageVersion: string;
  modelUri: string;
  manifestUri: string;
  modelSha256: string;
  modelVersion: string;
  rigVersion: string;
  animationVersion: string;
  textureVersion: string;
}

export interface CassidyRuntimeProductionPackageValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validates the metadata boundary before runtime consumption. Rig, facial
 * controls, and animations are normally embedded in the same GLB, so they do
 * not require separate runtime URIs. Binary validation happens at GLB load.
 */
export function validateCassidyRuntimeProductionPackage(
  pkg: CassidyRuntimeProductionPackage,
  manifest: CassidyProductionAssetManifest,
): CassidyRuntimeProductionPackageValidation {
  const errors: string[] = [];
  if (pkg.characterId !== 'cassidy') errors.push('Package character id must be cassidy.');
  if (!pkg.packageVersion) errors.push('Package version is required.');
  if (!pkg.modelUri) errors.push('Runtime model URI is required.');
  if (!pkg.manifestUri) errors.push('Runtime manifest URI is required.');
  if (!/^[a-f0-9]{64}$/i.test(pkg.modelSha256)) errors.push('Model SHA-256 must be a 64-character hexadecimal digest.');
  if (!pkg.modelVersion || !pkg.rigVersion || !pkg.animationVersion || !pkg.textureVersion) {
    errors.push('Model, rig, animation, and texture versions are all required.');
  }

  const model = manifest.assets.find(asset => asset.id === 'cassidy-model-v1');
  const rig = manifest.assets.find(asset => asset.id === 'cassidy-rig-v1');
  const animation = manifest.assets.find(asset => asset.id === 'cassidy-animation-v1');
  if (!model?.runtimeUri) errors.push('Manifest model runtime URI is not integrated.');
  if (!rig) errors.push('Manifest rig asset record is missing.');
  if (!animation) errors.push('Manifest animation asset record is missing.');

  return { valid: errors.length === 0, errors };
}

/** Stable runtime contract snapshot for diagnostics and tests. */
export function getCassidyRuntimeContractSummary() {
  return {
    animations: [...CASSIDY_RUNTIME_ANIMATION_CLIPS],
    expressions: [...CASSIDY_RUNTIME_EXPRESSIONS],
    nodes: { ...CASSIDY_RUNTIME_NODES },
    validateModel: validateCassidyRuntimeModel,
  };
}
