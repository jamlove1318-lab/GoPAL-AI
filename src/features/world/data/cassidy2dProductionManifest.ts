/**
 * Deterministic metadata boundary for an approved Cassidy 2D runtime pack.
 *
 * This file intentionally contains no asset paths or placeholder registration.
 * A future asset importer/renderer adapter should produce this manifest from
 * the delivered runtime export and then register the validated production pack.
 */

import {
  CASSIDY_2D_CONTRACT_VERSION,
  CASSIDY_2D_IDENTITY_VERSION,
  CASSIDY_2D_REQUIRED_ANIMATIONS,
  CASSIDY_2D_REQUIRED_CHARM_STATES,
  CASSIDY_2D_REQUIRED_EXPRESSIONS,
  CASSIDY_2D_REQUIRED_LAYERS,
  type Cassidy2DAnimation,
  type Cassidy2DCharmState,
  type Cassidy2DExpression,
  type Cassidy2DLayerId,
  type Cassidy2DProductionPack,
  validateCassidy2DProductionPack,
} from './cassidy2dProductionContract';

export type Cassidy2DRuntimeFormat = 'spine' | 'live2d' | 'rive' | 'custom';

export interface Cassidy2DProductionManifest {
  packId: 'cassidy-canonical-2d';
  contractVersion: typeof CASSIDY_2D_CONTRACT_VERSION;
  identityVersion: typeof CASSIDY_2D_IDENTITY_VERSION;
  sourceReference: 'cassidy-character-reference.md';
  runtimeFormat: Cassidy2DRuntimeFormat;
  runtimeAssetVersion: string;
  masterResolution: { width: number; height: number };
  layers: readonly Cassidy2DLayerId[];
  expressions: readonly Cassidy2DExpression[];
  animations: readonly Cassidy2DAnimation[];
  charmStates: readonly Cassidy2DCharmState[];
  provenance: Cassidy2DProductionPack['sourceProvenance'];
  humanApproved: boolean;
  sourceLicenseRecord: string;
  rendererAdapterVersion: string;
}

const exactSet = <T extends string>(required: readonly T[], actual: readonly T[]) =>
  required.length === actual.length && required.every((value) => actual.includes(value));

export function validateCassidy2DProductionManifest(
  manifest: Cassidy2DProductionManifest,
): boolean {
  if (
    manifest.packId !== 'cassidy-canonical-2d' ||
    manifest.contractVersion !== CASSIDY_2D_CONTRACT_VERSION ||
    manifest.identityVersion !== CASSIDY_2D_IDENTITY_VERSION ||
    manifest.sourceReference !== 'cassidy-character-reference.md' ||
    manifest.runtimeAssetVersion.trim().length === 0 ||
    manifest.rendererAdapterVersion.trim().length === 0 ||
    manifest.sourceLicenseRecord.trim().length === 0 ||
    manifest.masterResolution.width < 2000 ||
    manifest.masterResolution.height < 3000 ||
    !exactSet(CASSIDY_2D_REQUIRED_LAYERS, manifest.layers) ||
    !exactSet(CASSIDY_2D_REQUIRED_EXPRESSIONS, manifest.expressions) ||
    !exactSet(CASSIDY_2D_REQUIRED_ANIMATIONS, manifest.animations) ||
    !exactSet(CASSIDY_2D_REQUIRED_CHARM_STATES, manifest.charmStates)
  ) {
    return false;
  }

  return manifest.humanApproved;
}

/**
 * Converts an approved manifest into the runtime contract.
 *
 * It is deliberately impossible to produce a production pack from an
 * unapproved or incomplete manifest through this helper.
 */
export function manifestToCassidy2DProductionPack(
  manifest: Cassidy2DProductionManifest,
): Cassidy2DProductionPack {
  if (!validateCassidy2DProductionManifest(manifest)) {
    throw new Error('Cassidy 2D manifest rejected: production gates are incomplete.');
  }

  const pack: Cassidy2DProductionPack = {
    id: manifest.packId,
    contractVersion: manifest.contractVersion,
    identityVersion: manifest.identityVersion,
    sourceReference: manifest.sourceReference,
    format: 'layered-2d-puppet',
    renderer: 'artist-authored-runtime',
    sourceProvenance: manifest.provenance,
    masterResolution: manifest.masterResolution,
    layers: manifest.layers,
    expressions: manifest.expressions,
    animations: manifest.animations,
    charmStates: manifest.charmStates,
    runtimeAssetVersion: manifest.runtimeAssetVersion,
    humanApproved: manifest.humanApproved,
  };

  if (!validateCassidy2DProductionPack(pack)) {
    throw new Error('Cassidy 2D manifest conversion failed canonical validation.');
  }

  return pack;
}
