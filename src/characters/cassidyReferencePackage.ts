import { CASSIDY_REFERENCE_PACKAGE } from './cassidyCharacterProductionPipeline';
import { CASSIDY_CANONICAL_REFERENCE_URI, CASSIDY_PRODUCTION_ASSET_MANIFEST } from './cassidyProductionAssetRegistry';

/** Phase 3G: controlled reference intake and approval without creating a second asset registry. */
export type CassidyReferenceApprovalStatus = 'pending' | 'approved' | 'revision-required' | 'rejected';

export type CassidyReferenceKind =
  | 'hero-full-body' | 'front' | 'three-quarter-front' | 'side' | 'three-quarter-back' | 'back'
  | 'face-closeup' | 'eye-closeup' | 'hair' | 'base-outfit' | 'expression-sheet' | 'pose-sheet'
  | 'accessory' | 'material-sheet';

export interface CassidyReferenceApproval {
  referenceId: string;
  kind: CassidyReferenceKind;
  sourceAssetId: string;
  version: string;
  status: CassidyReferenceApprovalStatus;
  identityLocked: true;
  canonicalSource: 'cassidy-canonical-concept-v1';
  sourceUri?: string;
  evidence?: readonly string[];
  notes?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CassidyReferencePackage {
  packageId: 'cassidy-reference-package-v1';
  characterId: 'cassidy';
  packageVersion: 'phase-3g-v1';
  identityLocked: true;
  canonicalSource: 'cassidy-canonical-concept-v1';
  canonicalPath: typeof CASSIDY_CANONICAL_REFERENCE_URI;
  references: readonly CassidyReferenceApproval[];
}

export const CASSIDY_REQUIRED_REFERENCE_KINDS: readonly CassidyReferenceKind[] =
  CASSIDY_REFERENCE_PACKAGE.requiredReferences as readonly CassidyReferenceKind[];

const REFERENCE_ASSET_IDS: Readonly<Record<CassidyReferenceKind, string>> = {
  'hero-full-body': 'cassidy-canonical-concept-v1', front: 'cassidy-turnaround-v1', 'three-quarter-front': 'cassidy-turnaround-v1',
  side: 'cassidy-turnaround-v1', 'three-quarter-back': 'cassidy-turnaround-v1', back: 'cassidy-turnaround-v1',
  'face-closeup': 'cassidy-face-v1', 'eye-closeup': 'cassidy-face-v1', hair: 'cassidy-hair-v1',
  'base-outfit': 'cassidy-outfit-base-v1', 'expression-sheet': 'cassidy-expression-sheet-v1',
  'pose-sheet': 'cassidy-pose-sheet-v1', accessory: 'cassidy-accessory-v1', 'material-sheet': 'cassidy-material-sheet-v1',
};

export const CASSIDY_REFERENCE_PACKAGE_V1: CassidyReferencePackage = {
  packageId: 'cassidy-reference-package-v1', characterId: 'cassidy', packageVersion: 'phase-3g-v1', identityLocked: true,
  canonicalSource: 'cassidy-canonical-concept-v1', canonicalPath: CASSIDY_CANONICAL_REFERENCE_URI,
  references: CASSIDY_REQUIRED_REFERENCE_KINDS.map(kind => ({
    referenceId: `cassidy-reference-${kind}-v1`, kind, sourceAssetId: REFERENCE_ASSET_IDS[kind], version: 'v1',
    status: kind === 'hero-full-body' ? 'approved' : 'pending', identityLocked: true,
    canonicalSource: 'cassidy-canonical-concept-v1', sourceUri: kind === 'hero-full-body' ? CASSIDY_CANONICAL_REFERENCE_URI : undefined,
    notes: kind === 'hero-full-body'
      ? 'Exact uploaded repository image. It is the canonical visual source of truth.'
      : 'Awaiting the authored derivative reference asset. Never substitute a generic avatar or placeholder.',
  })),
};

export interface CassidyReferenceValidationOptions { requireAllApproved?: boolean; }

export function validateCassidyReferencePackage(
  packageData: CassidyReferencePackage = CASSIDY_REFERENCE_PACKAGE_V1,
  options: CassidyReferenceValidationOptions = {},
): string[] {
  const errors: string[] = [];
  const requireAllApproved = options.requireAllApproved ?? false;
  const seenIds = new Set<string>();
  const seenKinds = new Set<string>();

  if (packageData.characterId !== 'cassidy') errors.push('Reference package character id must remain cassidy.');
  if (!packageData.identityLocked) errors.push('Reference package cannot unlock Cassidy identity.');
  if (packageData.canonicalPath !== CASSIDY_CANONICAL_REFERENCE_URI) errors.push('Canonical reference path does not point to the uploaded repository image.');
  if (packageData.canonicalSource !== 'cassidy-canonical-concept-v1') errors.push('Every reference must trace to the canonical Cassidy concept.');

  for (const reference of packageData.references) {
    if (seenIds.has(reference.referenceId)) errors.push(`Duplicate reference id: ${reference.referenceId}.`);
    seenIds.add(reference.referenceId);
    if (seenKinds.has(reference.kind)) errors.push(`Duplicate reference kind: ${reference.kind}.`);
    seenKinds.add(reference.kind);
    if (!reference.identityLocked) errors.push(`Reference ${reference.referenceId} cannot unlock identity.`);
    if (reference.canonicalSource !== packageData.canonicalSource) errors.push(`Reference ${reference.referenceId} has an invalid canonical source.`);
    if (!reference.sourceAssetId) errors.push(`Reference ${reference.referenceId} is missing its source asset id.`);
    if (requireAllApproved && reference.status !== 'approved') errors.push(`Reference ${reference.referenceId} is not approved.`);
  }

  for (const kind of CASSIDY_REQUIRED_REFERENCE_KINDS) if (!seenKinds.has(kind)) errors.push(`Required reference is missing: ${kind}.`);
  if (packageData.references.length !== CASSIDY_REQUIRED_REFERENCE_KINDS.length) errors.push(`Reference package must contain exactly ${CASSIDY_REQUIRED_REFERENCE_KINDS.length} required references.`);

  const canonicalAsset = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-canonical-concept-v1');
  if (!canonicalAsset || canonicalAsset.status !== 'reference-approved' || canonicalAsset.sourceUri !== CASSIDY_CANONICAL_REFERENCE_URI) {
    errors.push('The production asset registry does not point to the uploaded canonical concept.');
  }
  return errors;
}

export function canCassidyProductionBegin(packageData: CassidyReferencePackage = CASSIDY_REFERENCE_PACKAGE_V1): boolean {
  return validateCassidyReferencePackage(packageData, { requireAllApproved: true }).length === 0;
}
