import { CASSIDY_CANONICAL_REFERENCE_URI } from './cassidyProductionAssetRegistry';
import type { CassidyReferenceKind } from './cassidyReferencePackage';

/** Phase 3H: machine-readable intake state for the real canonical artwork. */
export type CassidyReferenceInspectionStatus =
  | 'pending-visual-inspection'
  | 'inspected'
  | 'revision-required'
  | 'approved';

export interface CassidyReferenceIntegrity {
  sourceUri: typeof CASSIDY_CANONICAL_REFERENCE_URI;
  repositoryBranch: 'main';
  blobSha?: string;
  byteSize?: number;
  checksum?: string;
}

export interface CassidyCanonicalVisualAnalysis {
  status: CassidyReferenceInspectionStatus;
  inspectedBy?: string;
  inspectedAt?: string;
  confidence?: 'low' | 'medium' | 'high';
  observations: {
    face?: string;
    eyes?: string;
    hair?: string;
    body?: string;
    outfit?: string;
    accessory?: string;
    materials?: string;
    silhouette?: string;
    palette?: string;
    proportionNotes?: string;
  };
  referenceCoverage: Partial<Record<CassidyReferenceKind, 'available' | 'derived-needed'>>;
  reviewNotes: readonly string[];
}

export interface CassidyCanonicalReferenceIntake {
  intakeId: 'cassidy-canonical-reference-intake-v1';
  characterId: 'cassidy';
  identityLocked: true;
  canonicalReference: CassidyReferenceIntegrity;
  visualAnalysis: CassidyCanonicalVisualAnalysis;
}

/**
 * The exact repository PNG is known to exist, but pixel-level observations are
 * deliberately left empty until an image-capable inspection step is performed.
 */
export const CASSIDY_CANONICAL_REFERENCE_INTAKE_V1: CassidyCanonicalReferenceIntake = {
  intakeId: 'cassidy-canonical-reference-intake-v1',
  characterId: 'cassidy',
  identityLocked: true,
  canonicalReference: {
    sourceUri: CASSIDY_CANONICAL_REFERENCE_URI,
    repositoryBranch: 'main',
  },
  visualAnalysis: {
    status: 'pending-visual-inspection',
    observations: {},
    referenceCoverage: {
      'hero-full-body': 'available',
      front: 'derived-needed',
      'three-quarter-front': 'derived-needed',
      side: 'derived-needed',
      'three-quarter-back': 'derived-needed',
      back: 'derived-needed',
      'face-closeup': 'derived-needed',
      'eye-closeup': 'derived-needed',
      hair: 'derived-needed',
      'base-outfit': 'derived-needed',
      'expression-sheet': 'derived-needed',
      'pose-sheet': 'derived-needed',
      accessory: 'derived-needed',
      'material-sheet': 'derived-needed',
    },
    reviewNotes: [
      'The exact canonical PNG is committed at the repository root on main.',
      'Do not infer pixel-level visual properties from metadata alone.',
      'Do not replace the canonical image with a generated or generic character.',
      'Derivative references must preserve the locked Cassidy identity.',
    ],
  },
};

export function validateCassidyCanonicalReferenceIntake(
  intake: CassidyCanonicalReferenceIntake = CASSIDY_CANONICAL_REFERENCE_INTAKE_V1,
): string[] {
  const errors: string[] = [];
  if (intake.characterId !== 'cassidy') errors.push('Canonical intake character id must remain cassidy.');
  if (!intake.identityLocked) errors.push('Canonical intake identity must remain locked.');
  if (intake.canonicalReference.sourceUri !== CASSIDY_CANONICAL_REFERENCE_URI) {
    errors.push('Canonical intake must point to the exact approved repository PNG.');
  }
  if (intake.canonicalReference.repositoryBranch !== 'main') {
    errors.push('Canonical intake must record the approved main branch source.');
  }
  if (intake.visualAnalysis.status === 'approved') {
    if (!intake.visualAnalysis.inspectedAt) errors.push('Approved visual analysis requires inspectedAt.');
    if (!intake.visualAnalysis.inspectedBy) errors.push('Approved visual analysis requires inspectedBy.');
    if (!intake.visualAnalysis.confidence) errors.push('Approved visual analysis requires confidence.');
    if (Object.keys(intake.visualAnalysis.observations).length === 0) {
      errors.push('Approved visual analysis cannot contain zero observations.');
    }
  }
  return errors;
}

export function isCassidyCanonicalReferenceVisuallyApproved(
  intake: CassidyCanonicalReferenceIntake = CASSIDY_CANONICAL_REFERENCE_INTAKE_V1,
): boolean {
  return validateCassidyCanonicalReferenceIntake(intake).length === 0 && intake.visualAnalysis.status === 'approved';
}
