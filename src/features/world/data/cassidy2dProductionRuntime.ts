/**
 * Runtime bridge for the canonical 2D Cassidy production pack.
 *
 * The registry supports both the eventual layered-puppet renderer and
 * artist-authored/generated video clips. Video clips are approved runtime
 * assets, not a procedural fallback: the production renderer may play them
 * directly while the full layered puppet pack is still being assembled.
 */

import type React from 'react';
import type {
  Cassidy2DAnimation,
  Cassidy2DCharmState,
  Cassidy2DExpression,
} from './cassidy2dProductionContract';

export interface Cassidy2DProductionRenderProps {
  height: number;
  animation: Cassidy2DAnimation;
  expression: Cassidy2DExpression;
  charmState: Cassidy2DCharmState;
  speaking: boolean;
}

export type Cassidy2DProductionRenderer = (
  props: Cassidy2DProductionRenderProps,
) => React.ReactNode;

let renderer: Cassidy2DProductionRenderer | null = null;

export function registerCassidy2DProductionRenderer(
  nextRenderer: Cassidy2DProductionRenderer,
): void {
  renderer = nextRenderer;
}

export function getCassidy2DProductionRenderer(): Cassidy2DProductionRenderer | null {
  return renderer;
}

export function clearCassidy2DProductionRenderer(): void {
  renderer = null;
}

/**
 * Video clips authored for Cassidy's canonical visual identity.
 *
 * Keep these as explicit animation IDs so every future clip can be added to
 * the same runtime boundary without creating another animation system.
 */
const CASSIDY_VIDEO_ASSETS: Partial<Record<Cassidy2DAnimation, number>> = {
  'idle-breath': require('../../../../gemini_generated_video_6f4bd0a8.mp4'),
};

export function getCassidy2DVideoAsset(
  animation: Cassidy2DAnimation,
): number | null {
  return CASSIDY_VIDEO_ASSETS[animation] ?? CASSIDY_VIDEO_ASSETS['idle-breath'] ?? null;
}
