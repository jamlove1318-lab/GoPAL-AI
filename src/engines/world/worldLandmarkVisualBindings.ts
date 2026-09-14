/**
 * Reusable visual assignments for living-world landmarks.
 *
 * This module deliberately stores asset identity + selection intent, not
 * rendering. A landmark can later receive a validated 2D, 2.5D, or 3D
 * representation without changing its world identity or interaction logic.
 * Until an external asset has a runtime path and validation gate, resolution
 * fails closed and the existing landmark renderer remains authoritative.
 */

import { resolveExternalWorldVisual } from './worldExternalVisualBinding';
import {
  createWorldVisualRuntimeBinding,
  type WorldVisualRuntimeBinding,
} from './worldVisualRuntimeContract';
import type { WorldVisualSelectionContext } from './worldVisualRepresentation';

export type WorldLandmarkVisualId =
  | 'sanctuary'
  | 'cafe'
  | 'library'
  | 'market'
  | 'garden';

/**
 * Asset candidates are intentionally replaceable. These are not hard-coded
 * renderers and do not change the landmark's canonical identity.
 */
export const WORLD_LANDMARK_ASSET_CANDIDATES: Readonly<Record<WorldLandmarkVisualId, readonly string[]>> = {
  sanctuary: [
    'quaternius:ultimate-buildings-pack',
    'kenney:city-kit-suburban',
    'polyhaven:modular_urban_apartments_facade',
  ],
  cafe: [
    'kenney:city-kit-commercial',
    'quaternius:downtown-city-megakit',
    'polyhaven:modular_urban_apartments_facade',
  ],
  library: [
    'kenney:city-kit-commercial',
    'quaternius:downtown-city-megakit',
    'polyhaven:modular_urban_apartments_facade',
  ],
  market: [
    'kenney:city-kit-commercial',
    'quaternius:downtown-city-megakit',
    'kenney:city-kit-suburban',
  ],
  garden: [
    'polyhaven:tree_small_02',
    'polyhaven:pine_tree_01',
    'polyhaven:grass_medium_01',
  ],
};

export interface WorldLandmarkVisualContext extends WorldVisualSelectionContext {
  landmarkId: WorldLandmarkVisualId;
}

/**
 * Resolve the first validated candidate that fits the current world context.
 * No unvalidated source asset can enter the runtime through this API.
 */
export function resolveWorldLandmarkVisual(
  context: WorldLandmarkVisualContext,
): WorldVisualRuntimeBinding | undefined {
  for (const assetId of WORLD_LANDMARK_ASSET_CANDIDATES[context.landmarkId]) {
    const variant = resolveExternalWorldVisual(assetId, context);
    const binding = createWorldVisualRuntimeBinding(variant);
    if (binding) return binding;
  }
  return undefined;
}
