import React from 'react';
import { CassidyCharacter } from './CassidyCharacter';
import {
  getCassidy2DProductionStatus,
} from '../features/world/data/cassidy2dProductionContract';
import {
  getCassidy2DProductionRenderer,
} from '../features/world/data/cassidy2dProductionRuntime';
import type {
  Cassidy2DAnimation,
  Cassidy2DCharmState,
  Cassidy2DExpression,
} from '../features/world/data/cassidy2dProductionContract';

interface Props {
  height?: number;
  animation: Cassidy2DAnimation;
  expression: Cassidy2DExpression;
  charmState: Cassidy2DCharmState;
  speaking?: boolean;
}

/**
 * Single visual boundary for Cassidy.
 *
 * Production builds never fall back to the legacy SVG approximation. During
 * local development only, the approximation remains visible so the rest of
 * the living-world systems can still be exercised before the authored pack is
 * delivered.
 */
export function Cassidy2DProductionRenderer({
  height = 150,
  animation,
  expression,
  charmState,
  speaking = false,
}: Props) {
  const status = getCassidy2DProductionStatus();
  const productionRenderer = getCassidy2DProductionRenderer();

  if (status.complete && productionRenderer) {
    return <>{productionRenderer({ height, animation, expression, charmState, speaking })}</>;
  }

  if (__DEV__) {
    const legacyAction =
      animation === 'walk' ? 'walking' :
      animation === 'greeting' ? 'waving' :
      animation === 'talk' || animation === 'explaining' ? 'talking' :
      'idle';
    const legacyExpression =
      expression === 'thoughtful' ? 'thinking' :
      expression === 'curious' || expression === 'excited' || expression === 'happy' ? 'happy' :
      'warm';

    return (
      <CassidyCharacter
        height={height}
        action={legacyAction}
        speaking={speaking}
        expression={legacyExpression}
      />
    );
  }

  return null;
}
