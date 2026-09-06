/**
 * Runtime bridge for the canonical 2D Cassidy production pack.
 *
 * The pack contract describes what must exist; this registry describes how an
 * approved runtime export is rendered. No renderer is registered by default.
 * That keeps missing artwork fail-closed instead of silently substituting a
 * procedural Cassidy implementation.
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
