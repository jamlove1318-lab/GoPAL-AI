import type { WorldAnimationAction } from './worldAnimationContract';

export type ExternalAssetLicense = 'CC0' | 'clearly-commercial-safe';
export type ExternalAssetStatus = 'approved-source' | 'candidate' | 'validated-runtime';
export type ExternalAssetRepresentation = '2d' | '2.5d' | '3d';
export type ExternalAssetRole =
  | `environment:${string}`
  | `building:${string}`
  | `vehicle:${string}`
  | `furniture:${string}`
  | `character:${string}`
  | `animation:${string}`
  | `prop:${string}`
  | `map:${string}`
  | `vfx:${string}`;

export interface ExternalAssetVariant {
  representation: ExternalAssetRepresentation;
  runtimePath?: string;
  minDistance?: number;
  maxDistance?: number;
  interactive?: boolean;
  mobileTier?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ExternalWorldAsset {
  id: string;
  provider: 'polyhaven' | 'quaternius' | 'kenney';
  role: ExternalAssetRole;
  sourcePage: string;
  license: ExternalAssetLicense;
  status: ExternalAssetStatus;
  variants: readonly ExternalAssetVariant[];
  runtimePath?: string;
  animationActions?: WorldAnimationAction[];
  replaceable?: boolean;
  reusable?: boolean;
  notes: string;
}

/**
 * Curated external art sources for Emerald Valley.
 *
 * Heavy source files remain outside the TypeScript bundle. A source becomes a
 * runtime asset only after license, geometry, visual, mobile, and export gates.
 * One world concept may expose 2D, 2.5D and 3D variants without duplicating
 * world simulation state.
 */
export const EXTERNAL_WORLD_ASSETS: readonly ExternalWorldAsset[] = [
  {
    id: 'polyhaven:meadow', provider: 'polyhaven', role: 'environment:lighting',
    sourcePage: 'https://polyhaven.com/a/meadow', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', mobileTier: 'high' }, { representation: '2.5d', mobileTier: 'medium' }],
    notes: 'Daylight/HDRI source; keep source resolution separate from mobile runtime.',
  },
  {
    id: 'polyhaven:grass_medium_01', provider: 'polyhaven', role: 'environment:ground-cover',
    sourcePage: 'https://polyhaven.com/a/grass_medium_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', mobileTier: 'medium' }, { representation: '2.5d', mobileTier: 'low' }],
    notes: 'Ground cover; optimize aggressively before runtime.',
  },
  {
    id: 'polyhaven:tree_small_02', provider: 'polyhaven', role: 'environment:tree',
    sourcePage: 'https://polyhaven.com/a/tree_small_02', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [
      { representation: '3d', minDistance: 0, maxDistance: 35, mobileTier: 'high' },
      { representation: '2.5d', minDistance: 25, maxDistance: 100, mobileTier: 'medium' },
      { representation: '2d', minDistance: 80, mobileTier: 'low' },
    ],
    notes: 'Broadleaf tree source with representation-aware distance fallbacks.',
  },
  {
    id: 'polyhaven:pine_tree_01', provider: 'polyhaven', role: 'environment:tree',
    sourcePage: 'https://polyhaven.com/a/pine_tree_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [
      { representation: '3d', minDistance: 0, maxDistance: 40, mobileTier: 'high' },
      { representation: '2.5d', minDistance: 30, maxDistance: 120, mobileTier: 'medium' },
      { representation: '2d', minDistance: 100, mobileTier: 'low' },
    ],
    notes: 'Forest-edge silhouette with reusable distant representations.',
  },
  {
    id: 'polyhaven:tree_stump_01', provider: 'polyhaven', role: 'environment:prop',
    sourcePage: 'https://polyhaven.com/a/tree_stump_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 25, mobileTier: 'medium' }, { representation: '2.5d', minDistance: 20, mobileTier: 'low' }],
    notes: 'Forest-floor storytelling prop.',
  },
  {
    id: 'polyhaven:covered_car', provider: 'polyhaven', role: 'vehicle:car',
    sourcePage: 'https://polyhaven.com/a/covered_car', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 55, mobileTier: 'high' }, { representation: '2.5d', minDistance: 45, mobileTier: 'medium' }, { representation: '2d', minDistance: 100, mobileTier: 'low' }],
    notes: 'Vehicle/garage prop; validate runtime LODs before use.',
  },
  {
    id: 'polyhaven:sofa_02', provider: 'polyhaven', role: 'furniture:sofa',
    sourcePage: 'https://polyhaven.com/a/sofa_02', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 18, interactive: true, mobileTier: 'medium' }, { representation: '2.5d', minDistance: 15, mobileTier: 'low' }],
    notes: 'Interior furniture detail.',
  },
  {
    id: 'polyhaven:shelf_01', provider: 'polyhaven', role: 'furniture:shelf',
    sourcePage: 'https://polyhaven.com/a/Shelf_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 16, interactive: true, mobileTier: 'medium' }, { representation: '2d', minDistance: 12, mobileTier: 'low' }],
    notes: 'Interior prop candidate.',
  },
  {
    id: 'polyhaven:side_table_01', provider: 'polyhaven', role: 'furniture:table',
    sourcePage: 'https://polyhaven.com/a/side_table_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 12, interactive: true, mobileTier: 'medium' }, { representation: '2d', minDistance: 10, mobileTier: 'low' }],
    notes: 'Interior prop candidate.',
  },
  {
    id: 'polyhaven:woodentable_01', provider: 'polyhaven', role: 'furniture:table',
    sourcePage: 'https://polyhaven.com/a/WoodenTable_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 16, interactive: true, mobileTier: 'medium' }, { representation: '2.5d', minDistance: 12, mobileTier: 'low' }],
    notes: 'Table/desk candidate.',
  },
  {
    id: 'polyhaven:classicnightstand_01', provider: 'polyhaven', role: 'furniture:nightstand',
    sourcePage: 'https://polyhaven.com/a/ClassicNightstand_01', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 12, interactive: true, mobileTier: 'medium' }, { representation: '2d', minDistance: 10, mobileTier: 'low' }],
    notes: 'Bedroom/interior detail.',
  },
  {
    id: 'polyhaven:modular_urban_apartments_facade', provider: 'polyhaven', role: 'building:residential',
    sourcePage: 'https://polyhaven.com/a/modular_urban_apartments_facade', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 100, mobileTier: 'high' }, { representation: '2.5d', minDistance: 70, mobileTier: 'medium' }, { representation: '2d', minDistance: 180, mobileTier: 'low' }],
    notes: 'Reusable residential facade source; inspect material cost before runtime.',
  },
  {
    id: 'polyhaven:modular_factory_facade', provider: 'polyhaven', role: 'building:industrial',
    sourcePage: 'https://polyhaven.com/a/modular_factory_facade', license: 'CC0', status: 'approved-source', reusable: true,
    variants: [{ representation: '3d', maxDistance: 120, mobileTier: 'high' }, { representation: '2.5d', minDistance: 80, mobileTier: 'medium' }, { representation: '2d', minDistance: 200, mobileTier: 'low' }],
    notes: 'Reusable industrial source; source package is never shipped directly to mobile.',
  },
  {
    id: 'quaternius:universal-base-characters', provider: 'quaternius', role: 'character:temporary-cassidy-candidate',
    sourcePage: 'https://quaternius.com/packs/universalbasecharacters.html', license: 'CC0', status: 'candidate', reusable: true, replaceable: true,
    variants: [{ representation: '3d', maxDistance: 30, interactive: true, mobileTier: 'high' }, { representation: '2.5d', minDistance: 25, mobileTier: 'medium' }, { representation: '2d', minDistance: 70, mobileTier: 'low' }],
    animationActions: ['idle', 'walk', 'run', 'turn', 'greet', 'wave', 'talk', 'think', 'sit', 'stand'],
    notes: 'Temporary human base only. Never treat as Cassidy identity.',
  },
  {
    id: 'quaternius:universal-animation-library-2', provider: 'quaternius', role: 'animation:humanoid-retarget-source',
    sourcePage: 'https://quaternius.com/packs/universalanimationlibrary2.html', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', mobileTier: 'high' }],
    animationActions: ['idle', 'walk', 'run', 'turn', 'greet', 'wave', 'talk', 'think', 'interact', 'sit', 'stand'],
    notes: 'Retarget source; clips become runtime assets only after validation.',
  },
  {
    id: 'quaternius:downtown-city-megakit', provider: 'quaternius', role: 'building:city-environment',
    sourcePage: 'https://quaternius.com/packs/downtowncitymegakit.html', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 120, mobileTier: 'high' }, { representation: '2.5d', minDistance: 80, mobileTier: 'medium' }, { representation: '2d', minDistance: 180, mobileTier: 'low' }],
    notes: 'Modular city/street source for reusable districts.',
  },
  {
    id: 'quaternius:ultimate-buildings-pack', provider: 'quaternius', role: 'building:modular-houses',
    sourcePage: 'https://quaternius.com/packs/ultimatetexturedbuildings.html', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 90, mobileTier: 'high' }, { representation: '2.5d', minDistance: 60, mobileTier: 'medium' }, { representation: '2d', minDistance: 150, mobileTier: 'low' }],
    notes: 'Modular houses and town structures.',
  },
  {
    id: 'quaternius:modular-train-pack', provider: 'quaternius', role: 'vehicle:train',
    sourcePage: 'https://quaternius.com/packs/modulartrain.html', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 100, mobileTier: 'high' }, { representation: '2.5d', minDistance: 70, mobileTier: 'medium' }, { representation: '2d', minDistance: 180, mobileTier: 'low' }],
    notes: 'Train source for rail districts and stations.',
  },
  {
    id: 'quaternius:public-transport-pack', provider: 'quaternius', role: 'vehicle:public-transport',
    sourcePage: 'https://quaternius.com/packs/publictransport.html', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 70, mobileTier: 'high' }, { representation: '2.5d', minDistance: 50, mobileTier: 'medium' }, { representation: '2d', minDistance: 120, mobileTier: 'low' }],
    notes: 'Reusable public-transport source.',
  },
  {
    id: 'quaternius:cars-pack', provider: 'quaternius', role: 'vehicle:cars',
    sourcePage: 'https://quaternius.com/packs/cars.html', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 55, mobileTier: 'high' }, { representation: '2.5d', minDistance: 40, mobileTier: 'medium' }, { representation: '2d', minDistance: 100, mobileTier: 'low' }],
    notes: 'Reusable vehicle source.',
  },
  {
    id: 'kenney:city-kit-commercial', provider: 'kenney', role: 'building:commercial',
    sourcePage: 'https://kenney.nl/assets/city-kit-commercial', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 90, mobileTier: 'high' }, { representation: '2.5d', minDistance: 60, mobileTier: 'medium' }, { representation: '2d', minDistance: 150, mobileTier: 'low' }],
    notes: 'Reusable commercial city pieces.',
  },
  {
    id: 'kenney:city-kit-suburban', provider: 'kenney', role: 'building:suburban',
    sourcePage: 'https://kenney.nl/assets/city-kit-suburban', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 90, mobileTier: 'high' }, { representation: '2.5d', minDistance: 60, mobileTier: 'medium' }, { representation: '2d', minDistance: 150, mobileTier: 'low' }],
    notes: 'Reusable suburban pieces.',
  },
  {
    id: 'kenney:city-kit-industrial', provider: 'kenney', role: 'building:industrial',
    sourcePage: 'https://kenney.nl/assets/city-kit-industrial', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 100, mobileTier: 'high' }, { representation: '2.5d', minDistance: 70, mobileTier: 'medium' }, { representation: '2d', minDistance: 160, mobileTier: 'low' }],
    notes: 'Reusable industrial/factory pieces.',
  },
  {
    id: 'kenney:city-kit-roads', provider: 'kenney', role: 'environment:roads',
    sourcePage: 'https://kenney.nl/assets/city-kit-roads', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 140, mobileTier: 'high' }, { representation: '2.5d', minDistance: 100, mobileTier: 'medium' }, { representation: '2d', minDistance: 220, mobileTier: 'low' }],
    notes: 'Reusable roads, signs and traffic infrastructure.',
  },
  {
    id: 'kenney:nature-kit', provider: 'kenney', role: 'environment:nature',
    sourcePage: 'https://kenney.nl/assets/nature-kit', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 60, mobileTier: 'high' }, { representation: '2.5d', minDistance: 45, mobileTier: 'medium' }, { representation: '2d', minDistance: 100, mobileTier: 'low' }],
    notes: 'Reusable nature source.',
  },
  {
    id: 'kenney:train-kit', provider: 'kenney', role: 'vehicle:train-and-rail',
    sourcePage: 'https://kenney.nl/assets/train-kit', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 100, mobileTier: 'high' }, { representation: '2.5d', minDistance: 70, mobileTier: 'medium' }, { representation: '2d', minDistance: 180, mobileTier: 'low' }],
    notes: 'Reusable train, tram, trolley and rail pieces.',
  },
  {
    id: 'kenney:car-kit', provider: 'kenney', role: 'vehicle:cars',
    sourcePage: 'https://kenney.nl/assets/car-kit', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '3d', maxDistance: 55, mobileTier: 'high' }, { representation: '2.5d', minDistance: 40, mobileTier: 'medium' }, { representation: '2d', minDistance: 100, mobileTier: 'low' }],
    notes: 'Reusable road vehicle source.',
  },
  {
    id: 'kenney:generic-items', provider: 'kenney', role: 'prop:general',
    sourcePage: 'https://kenney.nl/assets/generic-items', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '2d', mobileTier: 'low' }, { representation: '2.5d', mobileTier: 'medium' }],
    notes: 'Lightweight household/tool/item source for inventory and decoration.',
  },
  {
    id: 'kenney:background-elements', provider: 'kenney', role: 'environment:background',
    sourcePage: 'https://kenney.nl/assets/background-elements', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '2d', mobileTier: 'low' }, { representation: '2.5d', mobileTier: 'medium' }],
    notes: 'Layered background source for parallax scenery.',
  },
  {
    id: 'kenney:map-pack', provider: 'kenney', role: 'map:world-layer',
    sourcePage: 'https://kenney.nl/assets/map-pack', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '2d', mobileTier: 'low' }, { representation: '2.5d', mobileTier: 'medium' }],
    notes: 'Map/tile source for discovery views and lightweight world previews.',
  },
  {
    id: 'kenney:flag-pack', provider: 'kenney', role: 'prop:flags',
    sourcePage: 'https://kenney.nl/assets/flag-pack', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '2d', mobileTier: 'low' }, { representation: '3d', mobileTier: 'medium' }],
    notes: 'Decorative flag source; animation belongs to the existing world motion system.',
  },
  {
    id: 'kenney:light-masks', provider: 'kenney', role: 'vfx:light-masks',
    sourcePage: 'https://kenney.nl/assets/light-masks', license: 'CC0', status: 'candidate', reusable: true,
    variants: [{ representation: '2d', mobileTier: 'low' }],
    notes: '2D VFX source for glows, light shaping and atmosphere.',
  },
];

export function getExternalWorldAsset(id: string): ExternalWorldAsset | undefined {
  return EXTERNAL_WORLD_ASSETS.find(asset => asset.id === id);
}

export function getApprovedExternalWorldAssets(): readonly ExternalWorldAsset[] {
  return EXTERNAL_WORLD_ASSETS.filter(asset => asset.status !== 'candidate');
}

export function getAssetVariants(id: string): readonly ExternalAssetVariant[] {
  return getExternalWorldAsset(id)?.variants ?? [];
}

export function chooseBestAssetVariant(
  asset: ExternalWorldAsset,
  distance: number,
  interactive: boolean,
  mobileTier: ExternalAssetVariant['mobileTier'] = 'medium',
): ExternalAssetVariant | undefined {
  const eligible = asset.variants.filter(variant => {
    if (variant.interactive && !interactive) return false;
    if (variant.minDistance !== undefined && distance < variant.minDistance) return false;
    if (variant.maxDistance !== undefined && distance > variant.maxDistance) return false;
    if (variant.mobileTier === 'high' && mobileTier !== 'high') return false;
    if (variant.mobileTier === 'medium' && mobileTier === 'low') return false;
    return true;
  });

  return eligible[0] ?? asset.variants[asset.variants.length - 1];
}
