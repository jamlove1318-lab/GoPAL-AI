/**
 * Unified hand-off from world visual selection to an existing renderer.
 *
 * This is intentionally a contract, not a renderer. The Living World keeps
 * one simulation/animation brain while Blender/Spine/Rive/Godot/native
 * adapters remain responsible for presenting the selected representation.
 */

import type { WorldVisualVariant } from './worldVisualRepresentation';

export type WorldVisualRuntimeChannel =
  | '3d'
  | '2.5d'
  | '2d'
  | 'native-motion';

export interface WorldVisualRuntimeBinding {
  assetId: string;
  representation: WorldVisualVariant['representation'];
  source: WorldVisualVariant['source'];
  channel: WorldVisualRuntimeChannel;
  assetUri: string;
  animated: boolean;
  interactive: boolean;
}

/**
 * Convert a selected, validated visual into a renderer-neutral binding.
 *
 * No downloading, rendering, animation scheduling, or world mutation occurs
 * here. Missing/unvalidated assets fail closed so the existing world visual
 * fallback remains authoritative.
 */
export function createWorldVisualRuntimeBinding(
  variant: WorldVisualVariant | undefined,
): WorldVisualRuntimeBinding | undefined {
  if (!variant?.validated || !variant.assetUri) return undefined;

  const channel: WorldVisualRuntimeChannel =
    variant.representation === '3d'
      ? '3d'
      : variant.representation === '2.5d'
        ? '2.5d'
        : variant.source === 'native'
          ? 'native-motion'
          : '2d';

  return {
    assetId: variant.id,
    representation: variant.representation,
    source: variant.source,
    channel,
    assetUri: variant.assetUri,
    animated: variant.animated === true,
    interactive: variant.interactive === true,
  };
}
