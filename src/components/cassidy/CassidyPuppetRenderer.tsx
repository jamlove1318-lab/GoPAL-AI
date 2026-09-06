import React from 'react';
import { CassidyCharacter } from '../CassidyCharacter';
import type { CassidyMood } from '../../characters/cassidy';
import type { CassidyPuppetState } from '../../features/world/data/cassidyPuppetState';

/**
 * Renderer boundary for the canonical Cassidy puppet state.
 *
 * The living-world layer owns no visual mapping. It supplies production
 * semantics here and this boundary decides which authored renderer consumes
 * them. Until the artist-authored layered asset is accepted, the existing SVG
 * renderer remains an explicit fallback rather than being promoted to the
 * canonical asset.
 */
export interface CassidyPuppetRendererProps {
  state: CassidyPuppetState;
  height?: number;
}

function fallbackExpression(expression: CassidyPuppetState['expression']): CassidyMood {
  switch (expression) {
    case 'happy':
      return 'happy';
    case 'excited':
    case 'surprised':
      return 'excited';
    case 'curious':
    case 'thoughtful':
    case 'concerned':
      return 'thinking';
    case 'gentle':
      return 'warm';
    case 'playful':
      return 'happy';
    case 'neutral':
    default:
      return 'calm';
  }
}

export function CassidyPuppetRenderer({ state, height = 150 }: CassidyPuppetRendererProps) {
  // Deliberately isolated fallback. When the canonical layered asset is
  // accepted, only this renderer changes; world/autonomy code does not.
  return (
    <CassidyCharacter
      height={height}
      action={state.action}
      speaking={state.speaking}
      expression={fallbackExpression(state.expression)}
    />
  );
}
