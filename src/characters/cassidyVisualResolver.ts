import type {
  CassidyAnimation,
  CassidyCharacterAssetSet,
  CassidyCharacterState,
  CassidyExpression,
  CassidyOutfitVariant,
} from './cassidyCharacterDesign';
import { CASSIDY_PRODUCTION_ASSET_MANIFEST, getCassidyRuntimeAssetSet } from './cassidyProductionAssetRegistry';

export type CassidyRenderAssetTier = 'lod0' | 'lod1' | 'lod2' | 'fallback';
export type CassidyVisualOutfit = CassidyOutfitVariant;

export interface CassidyVisualCommand {
  characterId: 'cassidy';
  visible: boolean;
  interactionLocked: boolean;
  assetTier: CassidyRenderAssetTier;
  model3dUri?: string;
  previewUri?: string;
  outfit: CassidyVisualOutfit;
  expression: CassidyExpression;
  animation: CassidyAnimation;
  rigVersion: string;
  textureVersion: string;
  animationVersion: string;
  gaze: {
    enabled: boolean;
    mode: 'natural' | 'disabled';
  };
  secondaryMotion: {
    enabled: boolean;
    hair: boolean;
    accessory: boolean;
  };
}

export interface CassidyVisualResolverOptions {
  assetSet?: CassidyCharacterAssetSet;
  requestedTier?: Exclude<CassidyRenderAssetTier, 'fallback'>;
}

function normalizeOutfit(state: CassidyCharacterState): CassidyVisualOutfit {
  if (state.outfit !== 'base') return state.outfit;
  if (state.worldId === 'japanese' || state.worldId === 'ja' || state.worldId === 'japanese-world') return 'japanese-world';
  if (state.worldId === 'french' || state.worldId === 'fr' || state.worldId === 'french-world') return 'french-world';
  if (state.worldId === 'emerald-valley') return 'emerald-valley';
  return 'base';
}

/**
 * Low-level manifest check used by the renderer path.
 *
 * This intentionally does not import the integration gate. The integration gate
 * is allowed to depend on this primitive, while the resolver remains free of a
 * circular dependency. A production model is eligible only when its model,
 * rig, and animation records are explicitly integrated and the model has a
 * runtime URI.
 */
export function isCassidyProductionRuntimeReady(): boolean {
  const model = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-model-v1');
  const rig = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-rig-v1');
  const animation = CASSIDY_PRODUCTION_ASSET_MANIFEST.assets.find(asset => asset.id === 'cassidy-animation-v1');
  return model?.status === 'integrated'
    && Boolean(model.runtimeUri)
    && rig?.status === 'integrated'
    && animation?.status === 'integrated';
}

function hasProductionModel(assetSet: CassidyCharacterAssetSet): boolean {
  return Boolean(
    assetSet.model3dUri
      && assetSet.rigVersion !== 'pending'
      && assetSet.animationVersion !== 'pending'
      && isCassidyProductionRuntimeReady(),
  );
}

export function resolveCassidyVisual(
  state: CassidyCharacterState,
  options: CassidyVisualResolverOptions = {},
): CassidyVisualCommand {
  const assetSet = options.assetSet ?? getCassidyRuntimeAssetSet();
  const productionReady = hasProductionModel(assetSet);
  const requestedTier = options.requestedTier ?? 'lod0';
  const tier: CassidyRenderAssetTier = productionReady ? requestedTier : 'fallback';

  return {
    characterId: 'cassidy',
    visible: state.visible,
    interactionLocked: state.interactionLocked,
    assetTier: tier,
    model3dUri: productionReady ? assetSet.model3dUri : undefined,
    previewUri: assetSet.previewUri,
    outfit: normalizeOutfit(state),
    expression: state.expression,
    animation: state.animation,
    rigVersion: assetSet.rigVersion,
    textureVersion: assetSet.textureVersion,
    animationVersion: assetSet.animationVersion,
    gaze: {
      enabled: productionReady,
      mode: productionReady ? 'natural' : 'disabled',
    },
    secondaryMotion: {
      enabled: productionReady,
      hair: productionReady,
      accessory: productionReady,
    },
  };
}
