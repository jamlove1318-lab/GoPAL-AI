import type { CassidyCharacterAssetSet } from './cassidyCharacterDesign';
import { CASSIDY_PRODUCTION_SPEC, validateCassidyProductionSpec } from './cassidyProductionSpec';

/**
 * Phase 3 asset registry foundation.
 *
 * This registry deliberately contains asset metadata, not Cassidy intelligence.
 * Actual model/texture/rig URIs are filled only after external production assets
 * are approved and imported. The existing CassidyCharacterAssetSet remains the
 * runtime-facing compatibility contract.
 */
export type CassidyProductionAssetStatus = 'reference-approved' | 'pending-production' | 'in-production' | 'validated' | 'integrated';

/** The exact canonical PNG currently committed at the repository root. */
export const CASSIDY_CANONICAL_REFERENCE_URI = 'file_00000000642c821198cbd141ddc7e8d7.png' as const;

export interface CassidyProductionAssetRecord {
  id: string;
  version: string;
  status: CassidyProductionAssetStatus;
  canonicalReference: string;
  sourceUri?: string;
  runtimeUri?: string;
  notes: string;
}

export interface CassidyProductionAssetManifest {
  characterId: 'cassidy';
  manifestVersion: string;
  canonicalReferenceVersion: string;
  identityLocked: true;
  assets: readonly CassidyProductionAssetRecord[];
}

export const CASSIDY_PRODUCTION_ASSET_MANIFEST: CassidyProductionAssetManifest = {
  characterId: 'cassidy',
  manifestVersion: 'phase-3-v1',
  canonicalReferenceVersion: 'phase-1-approved-v1',
  identityLocked: true,
  assets: [
    { id: 'cassidy-canonical-concept-v1', version: 'v1', status: 'reference-approved', canonicalReference: CASSIDY_CANONICAL_REFERENCE_URI, sourceUri: CASSIDY_CANONICAL_REFERENCE_URI, notes: 'Approved Phase 1 visual identity reference. Exact repository binary is now present at the canonical source URI.' },
    { id: 'cassidy-turnaround-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-turnaround-v1', notes: 'Production front/three-quarter/side/rear reference.' },
    { id: 'cassidy-face-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-face-v1', notes: 'Canonical face and eye construction reference.' },
    { id: 'cassidy-hair-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-hair-v1', notes: 'Canonical dark-brown hair silhouette and motion reference.' },
    { id: 'cassidy-outfit-base-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-outfit-base-v1', notes: 'Emerald Valley base outfit production reference.' },
    { id: 'cassidy-expression-sheet-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-expression-sheet-v1', notes: 'Canonical facial expression reference.' },
    { id: 'cassidy-pose-sheet-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-pose-sheet-v1', notes: 'Interaction and locomotion reference.' },
    { id: 'cassidy-accessory-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-accessory-v1', notes: 'Leaf-star-compass charm reference.' },
    { id: 'cassidy-material-sheet-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-material-sheet-v1', notes: 'Approved material and color reference.' },
    { id: 'cassidy-model-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-turnaround-v1', notes: '3D model begins only after the canonical reference set is available.' },
    { id: 'cassidy-rig-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-model-v1', notes: 'Full-body plus facial/eye/hand controls.' },
    { id: 'cassidy-animation-v1', version: 'v1', status: 'pending-production', canonicalReference: 'cassidy-model-v1', notes: 'Canonical locomotion and emotional animation library.' },
  ],
};

/** Runtime compatibility projection; no second character-state owner is created. */
export function getCassidyRuntimeAssetSet(): CassidyCharacterAssetSet {
  const model = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-model-v1');
  const rig = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-rig-v1');
  const animation = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-animation-v1');
  return {
    model3dUri: model?.runtimeUri,
    previewUri: CASSIDY_CANONICAL_REFERENCE_URI,
    thumbnailUri: CASSIDY_CANONICAL_REFERENCE_URI,
    rigVersion: rig?.version ?? 'pending',
    textureVersion: 'v1-pending',
    animationVersion: animation?.version ?? 'pending',
    validatedAngles: CASSIDY_PRODUCTION_SPEC.canonicalReferenceViews,
    validatedExpressions: [...CASSIDY_PRODUCTION_SPEC.expressions],
    validatedAnimations: [...CASSIDY_PRODUCTION_SPEC.animations],
  };
}

export function validateCassidyAssetManifest(manifest: CassidyProductionAssetManifest = CASSIDY_PRODUCTION_ASSET_MANIFEST): string[] {
  const errors = validateCassidyProductionSpec();
  if (manifest.characterId !== 'cassidy') errors.push('Asset manifest character id must remain cassidy.');
  if (!manifest.identityLocked) errors.push('Asset manifest cannot unlock the canonical identity.');
  if (!manifest.assets.some(asset => asset.id === 'cassidy-canonical-concept-v1' && asset.status === 'reference-approved')) {
    errors.push('Approved Cassidy canonical concept reference is missing.');
  }
  if (!manifest.assets.some(asset => asset.id === 'cassidy-model-v1')) errors.push('Cassidy model asset record is missing.');
  if (!manifest.assets.some(asset => asset.id === 'cassidy-rig-v1')) errors.push('Cassidy rig asset record is missing.');
  if (!manifest.assets.some(asset => asset.id === 'cassidy-animation-v1')) errors.push('Cassidy animation asset record is missing.');
  return errors;
}
