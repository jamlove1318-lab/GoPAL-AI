import {
  CASSIDY_IMPORT_VALIDATION_PROFILE,
  type CassidyProductionPackage,
  validateCassidyProductionPackage,
} from './cassidyProductionAssetContract';
import {
  CASSIDY_PRODUCTION_ASSET_MANIFEST,
  type CassidyProductionAssetManifest,
} from './cassidyProductionAssetRegistry';
import {
  isCassidyProductionRuntimeReady,
} from './cassidyVisualResolver';
import {
  isCassidyCanonicalReferenceVisuallyApproved,
} from './cassidyCanonicalReferenceIntake';
import { canCassidyProductionBegin } from './cassidyReferencePackage';

export interface CassidyProductionIntegrationGateResult {
  ready: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Final safety gate between authored Cassidy production data and runtime.
 *
 * The runtime readiness predicate is deliberately kept low-level in the
 * visual resolver. This gate composes it with the canonical reference,
 * reference package, and production package contracts without creating a
 * second readiness authority or an import cycle.
 */
export function validateCassidyProductionIntegrationGate(
  productionPackage: CassidyProductionPackage,
  assetManifest: CassidyProductionAssetManifest = CASSIDY_PRODUCTION_ASSET_MANIFEST,
): CassidyProductionIntegrationGateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isCassidyCanonicalReferenceVisuallyApproved()) {
    errors.push('Canonical Cassidy reference has not passed real visual inspection approval.');
  }

  const referenceErrors = canCassidyProductionBegin();
  errors.push(...referenceErrors);

  const packageResult = validateCassidyProductionPackage(productionPackage);
  errors.push(...packageResult.errors);
  warnings.push(...packageResult.warnings);

  const requiredRoles = new Set(productionPackage.files.map(file => file.role));
  for (const role of CASSIDY_IMPORT_VALIDATION_PROFILE.requiredLods) {
    if (!requiredRoles.has(role)) errors.push(`Production package is missing ${role}.`);
  }

  const runtimeReady = isCassidyProductionRuntimeReady();
  if (!runtimeReady) {
    errors.push(
      assetManifest === CASSIDY_PRODUCTION_ASSET_MANIFEST
        ? 'Cassidy model, rig, and animation assets are not all explicitly integrated.'
        : 'The supplied Cassidy asset manifest is not the active runtime manifest; runtime integration cannot be proven for it.',
    );
  }

  return {
    ready: errors.length === 0 && packageResult.valid && runtimeReady,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
  };
}

export function canIntegrateCassidyProduction(
  productionPackage: CassidyProductionPackage,
  assetManifest: CassidyProductionAssetManifest = CASSIDY_PRODUCTION_ASSET_MANIFEST,
): boolean {
  return validateCassidyProductionIntegrationGate(productionPackage, assetManifest).ready;
}
