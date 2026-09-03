import type { CassidyAnimation, CassidyExpression, CassidyOutfitVariant } from './cassidyCharacterDesign';
import { CASSIDY_IMPORT_VALIDATION_PROFILE } from './cassidyProductionAssetContract';

/** Phase 3F: one machine-readable handoff contract for the external art pipeline. */
export type CassidyProductionStage =
  | 'reference'
  | 'face'
  | 'body'
  | 'hair'
  | 'clothing'
  | 'accessory'
  | 'materials'
  | 'rig'
  | 'expressions'
  | 'animation'
  | 'lod'
  | 'export'
  | 'validation'
  | 'integration';

export type CassidyProductionGateStatus = 'pending' | 'in-progress' | 'approved' | 'rejected';

export interface CassidyProductionGate {
  stage: CassidyProductionStage;
  status: CassidyProductionGateStatus;
  required: boolean;
  evidence?: readonly string[];
  rejectionReasons?: readonly string[];
}

export interface CassidyReferencePackageManifest {
  version: 'phase-3f-v1';
  characterId: 'cassidy';
  identityLocked: true;
  canonicalConcept: 'docs/cassidy/assets/cassidy-canonical-concept-v1.png';
  requiredReferences: readonly string[];
}

export interface CassidyArtHandoffManifest {
  packageVersion: 'phase-3f-v1';
  characterId: 'cassidy';
  identityLocked: true;
  sourceOfTruth: 'canonical-reference';
  referencePackage: CassidyReferencePackageManifest;
  gates: readonly CassidyProductionGate[];
  requiredExpressions: readonly CassidyExpression[];
  requiredAnimations: readonly CassidyAnimation[];
  requiredOutfits: readonly CassidyOutfitVariant[];
  requiredLods: readonly ('lod0' | 'lod1' | 'lod2')[];
}

export const CASSIDY_REFERENCE_PACKAGE: CassidyReferencePackageManifest = {
  version: 'phase-3f-v1',
  characterId: 'cassidy',
  identityLocked: true,
  canonicalConcept: 'docs/cassidy/assets/cassidy-canonical-concept-v1.png',
  requiredReferences: [
    'hero-full-body',
    'front',
    'three-quarter-front',
    'side',
    'three-quarter-back',
    'back',
    'face-closeup',
    'eye-closeup',
    'hair',
    'base-outfit',
    'expression-sheet',
    'pose-sheet',
    'accessory',
    'material-sheet',
  ],
};

export const CASSIDY_ART_HANDOFF_MANIFEST: CassidyArtHandoffManifest = {
  packageVersion: 'phase-3f-v1',
  characterId: 'cassidy',
  identityLocked: true,
  sourceOfTruth: 'canonical-reference',
  referencePackage: CASSIDY_REFERENCE_PACKAGE,
  gates: [
    { stage: 'reference', status: 'approved', required: true },
    { stage: 'face', status: 'pending', required: true },
    { stage: 'body', status: 'pending', required: true },
    { stage: 'hair', status: 'pending', required: true },
    { stage: 'clothing', status: 'pending', required: true },
    { stage: 'accessory', status: 'pending', required: true },
    { stage: 'materials', status: 'pending', required: true },
    { stage: 'rig', status: 'pending', required: true },
    { stage: 'expressions', status: 'pending', required: true },
    { stage: 'animation', status: 'pending', required: true },
    { stage: 'lod', status: 'pending', required: true },
    { stage: 'export', status: 'pending', required: true },
    { stage: 'validation', status: 'pending', required: true },
    { stage: 'integration', status: 'pending', required: true },
  ],
  requiredExpressions: CASSIDY_IMPORT_VALIDATION_PROFILE.requiredExpressions,
  requiredAnimations: CASSIDY_IMPORT_VALIDATION_PROFILE.requiredAnimations,
  requiredOutfits: ['base', 'spring', 'summer', 'autumn', 'winter', 'emerald-valley', 'japanese-world', 'french-world', 'festival', 'adventure'],
  requiredLods: ['lod0', 'lod1', 'lod2'],
};

export function validateCassidyArtHandoffManifest(
  manifest: CassidyArtHandoffManifest = CASSIDY_ART_HANDOFF_MANIFEST,
): string[] {
  const errors: string[] = [];
  if (manifest.characterId !== 'cassidy') errors.push('Character id must remain cassidy.');
  if (!manifest.identityLocked) errors.push('Cassidy identity must remain locked.');
  if (manifest.sourceOfTruth !== 'canonical-reference') errors.push('Production source of truth must remain the approved canonical reference.');
  if (manifest.referencePackage.requiredReferences.length < 14) errors.push('Reference package is incomplete.');
  if (manifest.requiredExpressions.length !== 8) errors.push('Exactly eight canonical expressions are required.');
  if (manifest.requiredAnimations.length !== 11) errors.push('Exactly eleven canonical animations are required.');
  if (manifest.requiredLods.length !== 3) errors.push('LOD0, LOD1 and LOD2 are required.');
  const stages = new Set(manifest.gates.map(gate => gate.stage));
  if (stages.size !== 14) errors.push('Every required production stage must have exactly one gate.');
  return errors;
}
