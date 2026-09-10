import type { WorldAnimationAction } from './worldAnimationContract';

export type ExternalAssetLicense = 'CC0' | 'clearly-commercial-safe';
export type ExternalAssetStatus = 'approved-source' | 'candidate' | 'validated-runtime';
export type ExternalAssetRole =
  | 'environment:lighting'
  | 'environment:ground-cover'
  | 'environment:tree'
  | 'environment:prop'
  | 'character:temporary-cassidy-candidate'
  | 'animation:humanoid-retarget-source';

export interface ExternalWorldAsset {
  id: string;
  provider: 'polyhaven' | 'quaternius';
  role: ExternalAssetRole;
  sourcePage: string;
  license: ExternalAssetLicense;
  status: ExternalAssetStatus;
  runtimePath?: string;
  animationActions?: WorldAnimationAction[];
  replaceable?: boolean;
  notes: string;
}

/**
 * Curated external art sources for Emerald Valley.
 *
 * This registry is deliberately metadata-only: heavyweight source files are
 * acquired and optimized outside the TypeScript bundle. Runtime code should
 * consume only validated exports, never scrape provider pages.
 */
export const EXTERNAL_WORLD_ASSETS: readonly ExternalWorldAsset[] = [
  {
    id: 'polyhaven:meadow',
    provider: 'polyhaven',
    role: 'environment:lighting',
    sourcePage: 'https://polyhaven.com/a/meadow',
    license: 'CC0',
    status: 'approved-source',
    notes: 'Emerald Valley daylight/HDRI source.',
  },
  {
    id: 'polyhaven:grass_medium_01',
    provider: 'polyhaven',
    role: 'environment:ground-cover',
    sourcePage: 'https://polyhaven.com/a/grass_medium_01',
    license: 'CC0',
    status: 'approved-source',
    notes: 'Natural meadow ground cover; reduce aggressively for mobile LODs.',
  },
  {
    id: 'polyhaven:tree_small_02',
    provider: 'polyhaven',
    role: 'environment:tree',
    sourcePage: 'https://polyhaven.com/a/tree_small_02',
    license: 'CC0',
    status: 'approved-source',
    notes: 'Primary broadleaf tree candidate.',
  },
  {
    id: 'polyhaven:pine_tree_01',
    provider: 'polyhaven',
    role: 'environment:tree',
    sourcePage: 'https://polyhaven.com/a/pine_tree_01',
    license: 'CC0',
    status: 'approved-source',
    notes: 'Secondary forest-edge silhouette.',
  },
  {
    id: 'polyhaven:tree_stump_01',
    provider: 'polyhaven',
    role: 'environment:prop',
    sourcePage: 'https://polyhaven.com/a/tree_stump_01',
    license: 'CC0',
    status: 'approved-source',
    notes: 'Forest-floor storytelling prop.',
  },
  {
    id: 'quaternius:universal-base-characters',
    provider: 'quaternius',
    role: 'character:temporary-cassidy-candidate',
    sourcePage: 'https://quaternius.com/packs/universalbasecharacters.html',
    license: 'CC0',
    status: 'candidate',
    replaceable: true,
    animationActions: ['idle', 'walk', 'run', 'turn', 'greet', 'wave', 'talk', 'think', 'sit', 'stand'],
    notes: 'Temporary human base only; Cassidy identity remains replaceable through the existing visual resolver.',
  },
  {
    id: 'quaternius:universal-animation-library-2',
    provider: 'quaternius',
    role: 'animation:humanoid-retarget-source',
    sourcePage: 'https://quaternius.com/',
    license: 'CC0',
    status: 'candidate',
    animationActions: ['idle', 'walk', 'run', 'turn', 'greet', 'wave', 'talk', 'think', 'interact', 'sit', 'stand'],
    notes: 'Retarget source; clips become runtime assets only after validation.',
  },
] as const;

export function getExternalWorldAsset(id: string): ExternalWorldAsset | undefined {
  return EXTERNAL_WORLD_ASSETS.find(asset => asset.id === id);
}

export function getApprovedExternalWorldAssets(): readonly ExternalWorldAsset[] {
  return EXTERNAL_WORLD_ASSETS.filter(asset => asset.status !== 'candidate');
}
