/**
 * Adapter between the curated external asset registry and the single world
 * visual selector. This is metadata binding only: it never owns simulation,
 * animation scheduling, downloading, or rendering.
 */

import { getExternalWorldAsset, type ExternalWorldAsset, type ExternalAssetVariant } from './worldExternalAssetRegistry';
import {
  selectWorldVisual,
  type WorldVisualPurpose,
  type WorldVisualSet,
  type WorldVisualSource,
  type WorldVisualVariant,
  type WorldVisualSelectionContext,
} from './worldVisualRepresentation';

const SOURCE_BY_PROVIDER: Record<ExternalWorldAsset['provider'], WorldVisualSource> = {
  polyhaven: 'blender',
  quaternius: 'blender',
  kenney: 'blender',
};

function purposeFor(variant: ExternalAssetVariant): WorldVisualPurpose {
  if (variant.interactive) return 'interactive';
  if (variant.maxDistance !== undefined && variant.maxDistance <= 40) return 'near';
  if (variant.minDistance !== undefined && variant.minDistance >= 100) return 'far';
  if (variant.representation === '2d' && variant.minDistance === undefined) return 'background';
  return variant.representation === '3d' ? 'near' : 'mid';
}

function toVisualVariant(asset: ExternalWorldAsset, variant: ExternalAssetVariant, index: number): WorldVisualVariant {
  const runtimeValidated = asset.status === 'validated-runtime' && Boolean(variant.runtimePath ?? asset.runtimePath);
  return {
    id: `${asset.id}:${variant.representation}:${index}`,
    representation: variant.representation,
    source: SOURCE_BY_PROVIDER[asset.provider],
    purpose: purposeFor(variant),
    assetUri: variant.runtimePath ?? asset.runtimePath,
    minDistance: variant.minDistance,
    maxDistance: variant.maxDistance,
    interactive: variant.interactive,
    animated: Boolean(asset.animationActions?.length),
    mobileTier: variant.mobileTier,
    validated: runtimeValidated,
    notes: variant.notes ?? asset.notes,
  };
}

/** Convert a curated registry entry into the selector's common visual set. */
export function toWorldVisualSet(assetId: string): WorldVisualSet | undefined {
  const asset = getExternalWorldAsset(assetId);
  if (!asset || asset.variants.length === 0) return undefined;
  return {
    entityId: asset.id,
    variants: asset.variants.map((variant, index) => toVisualVariant(asset, variant, index)),
    qualityBias: 'quality',
  };
}

/**
 * Resolve only a validated runtime representation. Candidate/source entries
 * intentionally return undefined, leaving the existing visual fallback intact.
 */
export function resolveExternalWorldVisual(
  assetId: string,
  context: WorldVisualSelectionContext,
): WorldVisualVariant | undefined {
  const set = toWorldVisualSet(assetId);
  return set ? selectWorldVisual(set, context) : undefined;
}

/** Stable lookup useful to render adapters without exposing registry internals. */
export function getExternalVisualSource(assetId: string): ExternalWorldAsset['provider'] | undefined {
  return getExternalWorldAsset(assetId)?.provider;
}
