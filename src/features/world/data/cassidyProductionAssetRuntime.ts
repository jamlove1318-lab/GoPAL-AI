/**
 * Runtime contract for the artist-authored Cassidy 2D puppet.
 *
 * This module intentionally contains no fallback artwork and no remote loading.
 * A future asset pack can register here without changing world/autonomy code.
 * Missing or incomplete artwork is reported explicitly so a placeholder can
 * never silently become the production Cassidy asset.
 */

import {
  CASSIDY_PRODUCTION_ASSET_MANIFEST,
  type CassidyCharmGlowState,
  type CassidyExpression,
  type CassidyPuppetPart,
  type CassidyAction,
} from './cassidyProductionAssetContract';

export interface CassidyPuppetLayerSource {
  readonly part: CassidyPuppetPart;
  readonly source: string;
}

export interface CassidyProductionAssetPack {
  readonly manifestVersion: string;
  readonly layers: readonly CassidyPuppetLayerSource[];
  readonly expressions: readonly CassidyExpression[];
  readonly actions: readonly CassidyAction[];
  readonly charmGlowStates: readonly CassidyCharmGlowState[];
}

export interface CassidyProductionAssetStatus {
  readonly available: boolean;
  readonly complete: boolean;
  readonly missingParts: readonly CassidyPuppetPart[];
  readonly missingExpressions: readonly CassidyExpression[];
  readonly missingActions: readonly CassidyAction[];
  readonly missingCharmGlowStates: readonly CassidyCharmGlowState[];
  readonly reason: 'ready' | 'asset-not-registered' | 'asset-incomplete';
}

/**
 * The authored pack is intentionally absent until a real reviewed asset is
 * checked into the production asset pipeline. Do not replace this with the
 * procedural SVG renderer; that remains an explicit renderer fallback.
 */
let registeredAssetPack: CassidyProductionAssetPack | undefined;

export function registerCassidyProductionAssetPack(
  pack: CassidyProductionAssetPack,
): CassidyProductionAssetStatus {
  registeredAssetPack = pack;
  return getCassidyProductionAssetStatus();
}

export function getCassidyProductionAssetPack(): CassidyProductionAssetPack | undefined {
  return registeredAssetPack;
}

export function getCassidyProductionAssetStatus(): CassidyProductionAssetStatus {
  if (!registeredAssetPack) {
    return {
      available: false,
      complete: false,
      missingParts: CASSIDY_PRODUCTION_ASSET_MANIFEST.requiredParts,
      missingExpressions: CASSIDY_PRODUCTION_ASSET_MANIFEST.expressions,
      missingActions: CASSIDY_PRODUCTION_ASSET_MANIFEST.actions,
      missingCharmGlowStates: CASSIDY_PRODUCTION_ASSET_MANIFEST.charmGlowStates,
      reason: 'asset-not-registered',
    };
  }

  const layerParts = new Set(registeredAssetPack.layers.map(layer => layer.part));
  const missingParts = CASSIDY_PRODUCTION_ASSET_MANIFEST.requiredParts.filter(
    part => !layerParts.has(part),
  );
  const missingExpressions = CASSIDY_PRODUCTION_ASSET_MANIFEST.expressions.filter(
    expression => !registeredAssetPack.expressions.includes(expression),
  );
  const missingActions = CASSIDY_PRODUCTION_ASSET_MANIFEST.actions.filter(
    action => !registeredAssetPack.actions.includes(action),
  );
  const missingCharmGlowStates = CASSIDY_PRODUCTION_ASSET_MANIFEST.charmGlowStates.filter(
    state => !registeredAssetPack.charmGlowStates.includes(state),
  );

  const complete = missingParts.length === 0
    && missingExpressions.length === 0
    && missingActions.length === 0
    && missingCharmGlowStates.length === 0
    && registeredAssetPack.manifestVersion === CASSIDY_PRODUCTION_ASSET_MANIFEST.version;

  return {
    available: true,
    complete,
    missingParts,
    missingExpressions,
    missingActions,
    missingCharmGlowStates,
    reason: complete ? 'ready' : 'asset-incomplete',
  };
}
