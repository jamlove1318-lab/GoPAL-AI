import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { LivingWorldAtmosphere, LivingWorldCanvas, LivingWorldHud, LivingWorldLayer, LivingWorldVisualState } from './LivingWorldUI';
import { LivingWorldViewport } from './LivingWorldViewport';

export function LivingWorldScene({
  state,
  children,
  hud,
  interactive = true,
  style,
}: {
  state?: LivingWorldVisualState;
  children?: ReactNode;
  hud?: ReactNode;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const world = <LivingWorldLayer pointerEvents={interactive ? 'auto' : 'none'}>{children}</LivingWorldLayer>;

  return <LivingWorldCanvas style={style}>
    <LivingWorldAtmosphere state={state} />
    {interactive ? <LivingWorldViewport>{world}</LivingWorldViewport> : world}
    {hud && <LivingWorldHud>{hud}</LivingWorldHud>}
  </LivingWorldCanvas>;
}
