/**
 * Representation-aware visual binding for the Living World.
 *
 * A world entity owns one identity and may expose several visual forms.
 * The world runtime chooses the form; the art asset never owns world state.
 */

export type WorldVisualRepresentation = '2d' | '2.5d' | '3d';
export type WorldVisualSource = 'blender' | 'spine' | 'rive' | 'godot' | 'native';
export type WorldVisualPurpose =
  | 'hero'
  | 'interactive'
  | 'near'
  | 'mid'
  | 'far'
  | 'background'
  | 'map'
  | 'portrait'
  | 'effect';
export type WorldVisualMobileTier = 'low' | 'medium' | 'high';

export interface WorldVisualVariant {
  id: string;
  representation: WorldVisualRepresentation;
  source: WorldVisualSource;
  purpose: WorldVisualPurpose;
  assetUri?: string;
  minDistance?: number;
  maxDistance?: number;
  maxScreenPixels?: number;
  interactive?: boolean;
  animated?: boolean;
  mobileTier?: WorldVisualMobileTier;
  validated?: boolean;
  notes?: string;
}

export interface WorldVisualSet {
  entityId: string;
  variants: readonly WorldVisualVariant[];
  /** Prefer the richer form when performance and distance are otherwise equal. */
  qualityBias?: 'quality' | 'balanced' | 'performance';
}

export interface WorldVisualSelectionContext {
  distance: number;
  interactive: boolean;
  screenPixels: number;
  performanceTier: 'high' | 'balanced' | 'low';
}

function mobileTierAllowed(
  variantTier: WorldVisualMobileTier | undefined,
  performanceTier: WorldVisualSelectionContext['performanceTier'],
): boolean {
  if (!variantTier) return true;
  if (performanceTier === 'low') return variantTier === 'low';
  if (performanceTier === 'balanced') return variantTier !== 'high';
  return true;
}

/**
 * Selects an already-validated visual variant. It never downloads, mutates,
 * schedules, or creates world state.
 *
 * Non-interactive scenes may still use an interactive-capable asset. We only
 * require interactivity when the current scene actually needs interaction;
 * otherwise a richer interactive asset remains a valid visual fallback.
 */
export function selectWorldVisual(
  set: WorldVisualSet,
  context: WorldVisualSelectionContext,
): WorldVisualVariant | undefined {
  const eligible = set.variants.filter(variant => {
    if (!variant.validated) return false;
    if (context.interactive && variant.interactive !== true) return false;
    if (variant.minDistance !== undefined && context.distance < variant.minDistance) return false;
    if (variant.maxDistance !== undefined && context.distance > variant.maxDistance) return false;
    if (variant.maxScreenPixels !== undefined && context.screenPixels > variant.maxScreenPixels) return false;
    if (!mobileTierAllowed(variant.mobileTier, context.performanceTier)) return false;

    if (context.performanceTier === 'low' && variant.representation === '3d' && variant.purpose !== 'hero') {
      return false;
    }
    return true;
  });

  if (!eligible.length) return undefined;

  const representationRank: Record<WorldVisualRepresentation, number> = {
    '3d': set.qualityBias === 'performance' ? 2 : 3,
    '2.5d': 2,
    '2d': set.qualityBias === 'quality' ? 1 : 2,
  };

  const sourceRank: Record<WorldVisualSource, number> = {
    blender: 3,
    godot: 2,
    spine: 2,
    rive: 2,
    native: 1,
  };

  const purposeRank: Record<WorldVisualPurpose, number> = {
    interactive: context.interactive ? 5 : 1,
    hero: 4,
    near: 4,
    mid: 3,
    far: 2,
    background: 2,
    map: 1,
    portrait: 1,
    effect: 1,
  };

  return [...eligible].sort((a, b) => {
    const purpose = purposeRank[b.purpose] - purposeRank[a.purpose];
    if (purpose) return purpose;
    const representation = representationRank[b.representation] - representationRank[a.representation];
    if (representation) return representation;
    const animation = Number(b.animated === true) - Number(a.animated === true);
    if (animation) return animation;
    return sourceRank[b.source] - sourceRank[a.source];
  })[0];
}
