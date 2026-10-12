/**
 * Cassidy 2D production contract.
 *
 * This is deliberately asset-format agnostic. The runtime must not invent a
 * visual Cassidy when the artist-authored production pack is unavailable.
 */

export const CASSIDY_2D_CONTRACT_VERSION = '1.0.0';
export const CASSIDY_2D_IDENTITY_VERSION = 'canonical-v1';

export const CASSIDY_2D_REQUIRED_LAYERS = ['head','ears','neck','eyes','eyelids','eyebrows','nose','mouth','hair-back','hair-side','hair-front','braid','torso','blouse','vest','hood','left-arm','right-arm','left-hand','right-hand','belt','pouches','satchel','left-leg','right-leg','left-boot','right-boot','charm-chain','charm','charm-glow'] as const;
export const CASSIDY_2D_REQUIRED_EXPRESSIONS = ['neutral','happy','curious','excited','surprised','thoughtful','playful','concerned','gentle'] as const;
export const CASSIDY_2D_REQUIRED_ANIMATIONS = ['idle-breath','walk','run','talk','think','celebrate','greeting','explaining','listening','encouraging'] as const;
export const CASSIDY_2D_REQUIRED_CHARM_STATES = ['normal','curious','learning','discovery','important','celebration','memory'] as const;

export type Cassidy2DLayerId = (typeof CASSIDY_2D_REQUIRED_LAYERS)[number];
export type Cassidy2DExpression = (typeof CASSIDY_2D_REQUIRED_EXPRESSIONS)[number];
export type Cassidy2DAnimation = (typeof CASSIDY_2D_REQUIRED_ANIMATIONS)[number];
export type Cassidy2DCharmState = (typeof CASSIDY_2D_REQUIRED_CHARM_STATES)[number];

export interface Cassidy2DProductionPack {
  id: 'cassidy-canonical-2d';
  contractVersion: string;
  identityVersion: string;
  sourceReference: 'cassidy-character-reference.md';
  format: 'layered-2d-puppet';
  renderer: 'artist-authored-runtime';
  sourceProvenance: 'custom-authored' | 'licensed-adapted' | 'ai-assisted-human-refined';
  masterResolution: { width: number; height: number };
  layers: readonly Cassidy2DLayerId[];
  expressions: readonly Cassidy2DExpression[];
  animations: readonly Cassidy2DAnimation[];
  charmStates: readonly Cassidy2DCharmState[];
  runtimeAssetVersion: string;
  humanApproved: boolean;
}

export type Cassidy2DProductionStatus =
  | { available: false; complete: false; reason: 'asset-not-registered' | 'asset-invalid' }
  | { available: true; complete: false; reason: 'awaiting-human-approval' }
  | { available: true; complete: true; reason: 'ready' };

let registeredPack: Cassidy2DProductionPack | null = null;
const includesAll = <T extends string>(required: readonly T[], actual: readonly T[]) => required.every((value) => actual.includes(value));

export function validateCassidy2DProductionPack(pack: Cassidy2DProductionPack): boolean {
  return pack.id === 'cassidy-canonical-2d' && pack.contractVersion === CASSIDY_2D_CONTRACT_VERSION && pack.identityVersion === CASSIDY_2D_IDENTITY_VERSION && pack.sourceReference === 'cassidy-character-reference.md' && pack.format === 'layered-2d-puppet' && pack.masterResolution.width >= 2000 && pack.masterResolution.height >= 3000 && includesAll(CASSIDY_2D_REQUIRED_LAYERS, pack.layers) && includesAll(CASSIDY_2D_REQUIRED_EXPRESSIONS, pack.expressions) && includesAll(CASSIDY_2D_REQUIRED_ANIMATIONS, pack.animations) && includesAll(CASSIDY_2D_REQUIRED_CHARM_STATES, pack.charmStates) && pack.runtimeAssetVersion.trim().length > 0;
}

export function registerCassidy2DProductionPack(pack: Cassidy2DProductionPack): void {
  if (!validateCassidy2DProductionPack(pack)) throw new Error('Cassidy 2D production pack rejected: canonical requirements are incomplete.');
  registeredPack = pack;
}

export function getCassidy2DProductionPack(): Cassidy2DProductionPack | null { return registeredPack; }

export function getCassidy2DProductionStatus(): Cassidy2DProductionStatus {
  if (!registeredPack) return { available: false, complete: false, reason: 'asset-not-registered' };
  if (!validateCassidy2DProductionPack(registeredPack)) return { available: false, complete: false, reason: 'asset-invalid' };
  if (!registeredPack.humanApproved) return { available: true, complete: false, reason: 'awaiting-human-approval' };
  return { available: true, complete: true, reason: 'ready' };
}
