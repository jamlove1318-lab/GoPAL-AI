import React, { ReactNode, useMemo } from 'react';
import { View } from 'react-native';
import { LivingWorldActorMotion, LivingWorldActorPath } from './LivingWorldActorMotion';
import { LivingCharacter, CharacterVisual } from './LivingCharacter';

export type LivingActivityActor = {
  id: string;
  character: CharacterVisual;
  path: LivingWorldActorPath[];
  speed?: number;
  visible?: boolean;
};

const DEFAULT_PATHS: LivingWorldActor[] = [
  { id: 'valley-walker-1', character: 'ren', path: [{ x: 12, y: 72 }, { x: 38, y: 68 }, { x: 62, y: 73 }, { x: 86, y: 66 }], speed: 0.75 },
  { id: 'valley-walker-2', character: 'emi', path: [{ x: 86, y: 58 }, { x: 68, y: 63 }, { x: 46, y: 58 }, { x: 22, y: 64 }], speed: 0.55 },
  { id: 'valley-walker-3', character: 'kenji', path: [{ x: 24, y: 78 }, { x: 42, y: 75 }, { x: 70, y: 79 }], speed: 0.45 },
];

export function LivingWorldActivityActors({ actors = DEFAULT_PATHS, renderActor }: { actors?: LivingActivityActor[]; renderActor?: (actor: LivingActivityActor) => ReactNode }) {
  const visible = useMemo(() => actors.filter(actor => actor.visible !== false), [actors]);
  return <View pointerEvents="none" className="absolute inset-0 z-20">{visible.map(actor => <LivingWorldActorMotion key={actor.id} path={actor.path} speed={actor.speed}>
    {renderActor?.(actor) ?? <View className="h-14 w-12 items-center justify-center"><LivingCharacter character={actor.character} size={44} motion="walking" /></View>}
  </LivingWorldActorMotion>)}</View>;
}
