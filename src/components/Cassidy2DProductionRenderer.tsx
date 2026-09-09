import React from 'react';
import { View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { CassidyCharacter } from './CassidyCharacter';
import {
  getCassidy2DProductionStatus,
} from '../features/world/data/cassidy2dProductionContract';
import {
  getCassidy2DProductionRenderer,
  getCassidy2DVideoAsset,
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

function CassidyAuthoredVideo({
  source,
  height,
}: {
  source: number;
  height: number;
}) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <View style={{ height, aspectRatio: 9 / 16, overflow: 'hidden' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        nativeControls={false}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * Single visual boundary for Cassidy.
 *
 * Production builds never fall back to the legacy SVG approximation.
 * Approved authored/generated Cassidy video clips are treated as production
 * assets and are played directly while the complete layered 2D puppet pack
 * is being assembled.
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
  const videoAsset = getCassidy2DVideoAsset(animation);

  if (videoAsset) {
    return <CassidyAuthoredVideo source={videoAsset} height={height} />;
  }

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
