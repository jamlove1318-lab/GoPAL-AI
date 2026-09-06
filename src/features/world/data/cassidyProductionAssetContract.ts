/**
 * Cassidy production asset contract.
 *
 * This is the stable boundary between the authored Cassidy artwork/puppet and
 * the living-world systems. World code must depend on this contract rather
 * than knowing how the artwork was produced.
 *
 * Canonical visual identity remains locked by docs/cassidy-character-reference.md.
 */

export type CassidyExpression =
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'excited'
  | 'surprised'
  | 'thoughtful'
  | 'playful'
  | 'concerned'
  | 'gentle';

export type CassidyAction =
  | 'idle'
  | 'walking'
  | 'talking'
  | 'waving';

export type CassidyCharmGlowState =
  | 'normal'
  | 'curious'
  | 'learning'
  | 'discovery'
  | 'important'
  | 'celebration'
  | 'memory';

export type CassidyPuppetPart =
  | 'head'
  | 'eyes'
  | 'mouth'
  | 'hair-back'
  | 'hair-front'
  | 'braid'
  | 'torso'
  | 'left-arm'
  | 'right-arm'
  | 'left-hand'
  | 'right-hand'
  | 'belt'
  | 'pouches'
  | 'satchel'
  | 'left-leg'
  | 'right-leg'
  | 'left-boot'
  | 'right-boot'
  | 'charm';

export interface CassidyProductionAssetManifest {
  readonly id: 'cassidy-canonical';
  readonly version: string;
  readonly format: 'layered-2d-puppet';
  readonly identityLocked: true;
  readonly requiredParts: readonly CassidyPuppetPart[];
  readonly expressions: readonly CassidyExpression[];
  readonly actions: readonly CassidyAction[];
  readonly charmGlowStates: readonly CassidyCharmGlowState[];
}

export const CASSIDY_PRODUCTION_ASSET_MANIFEST: CassidyProductionAssetManifest = {
  id: 'cassidy-canonical',
  version: '1.0.0',
  format: 'layered-2d-puppet',
  identityLocked: true,
  requiredParts: [
    'head', 'eyes', 'mouth', 'hair-back', 'hair-front', 'braid',
    'torso', 'left-arm', 'right-arm', 'left-hand', 'right-hand',
    'belt', 'pouches', 'satchel', 'left-leg', 'right-leg',
    'left-boot', 'right-boot', 'charm',
  ],
  expressions: [
    'neutral', 'happy', 'curious', 'excited', 'surprised',
    'thoughtful', 'playful', 'concerned', 'gentle',
  ],
  actions: ['idle', 'walking', 'talking', 'waving'],
  charmGlowStates: [
    'normal', 'curious', 'learning', 'discovery',
    'important', 'celebration', 'memory',
  ],
};

export function isCassidyProductionAssetManifest(
  value: unknown,
): value is CassidyProductionAssetManifest {
  if (!value || typeof value !== 'object') return false;
  const manifest = value as Partial<CassidyProductionAssetManifest>;
  return manifest.id === 'cassidy-canonical'
    && manifest.identityLocked === true
    && manifest.format === 'layered-2d-puppet';
}
