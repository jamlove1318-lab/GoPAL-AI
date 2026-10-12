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
 * Priority order:
 * 1. Explicit authored Cassidy video clips.
 * 2. Complete human-approved layered 2D production pack.
 * 3. Polished interim vector Cassidy while the final production pack is
 *    being prepared.
 *
 * The interim visual is intentionally based on the canonical reference and
 * is not registered as the final production pack, so it can be replaced
 * later without changing the rest of the app architecture.
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

  // Temporary app-completion visual. This is deliberately inside the same
  // Cassidy renderer boundary so the eventual approved layered puppet can
  // replace it without creating a second character system.
  const legacyAction =
    animation === 'walk' ? 'walking' :
    animation === 'greeting' ? 'waving' :
    animation === 'talk' || animation === 'explaining' || animation === 'listening' || animation === 'encouraging'
      ? 'talking'
      : 'idle';
  const legacyExpression =
    expression === 'thoughtful' ? 'thinking' :
    expression === 'curious' || expression === 'excited' || expression === 'happy' || expression === 'playful'
      ? 'happy'
      : expression === 'concerned'
        ? 'warm'
        : 'warm';

  return (
    <CassidyCharacter
      height={height}
      action={legacyAction}
      speaking={speaking}
      expression={legacyExpression}
    />
  );
}
