import { getLanguageWorld, getLanguageWorldForLocation } from './livingLanguageWorlds';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';

export type WorldTravelMode = 'walk' | 'car' | 'bus' | 'train' | 'plane' | 'magic';
export type WorldTravelScope = 'local' | 'cross-world';

export type WorldTravelDefinition = {
  mode: WorldTravelMode;
  scope: WorldTravelScope;
  durationSeconds: number;
  cinematicRequired: true;
  reason: string;
};

function worldId(location: WorldLocationDefinition): string | null {
  return getLanguageWorldForLocation(location)?.id ?? location.languageWorldId ?? null;
}

function isFictionalWorld(location: WorldLocationDefinition): boolean {
  const world = getLanguageWorldForLocation(location);
  return !!world && world.tags?.includes('fictional') === true;
}

export function resolveWorldTravel(source: WorldLocationDefinition, target: WorldLocationDefinition): WorldTravelDefinition {
  const sourceWorldId = worldId(source);
  const targetWorldId = worldId(target);
  const crossWorld = sourceWorldId !== targetWorldId;

  if (!crossWorld) {
    const tags = new Set([...(source.tags ?? []), ...(target.tags ?? [])]);
    const mode: WorldTravelMode = tags.has('rail') ? 'train' : tags.has('bus') ? 'bus' : tags.has('road') ? 'car' : 'train';
    return { mode, scope: 'local', durationSeconds: mode === 'train' ? 7 : 5, cinematicRequired: true, reason: 'Locations in the same world use physical ground travel.' };
  }

  if (isFictionalWorld(target)) {
    return { mode: 'magic', scope: 'cross-world', durationSeconds: 6, cinematicRequired: true, reason: 'Fictional destinations use a world-specific magical transition.' };
  }

  return { mode: 'plane', scope: 'cross-world', durationSeconds: 8, cinematicRequired: true, reason: 'Cross-world travel to a real-world language destination uses air travel.' };
}

export function resolveWorldTravelByIds(source: WorldLocationDefinition, target: WorldLocationDefinition) {
  const sourceWorld = getLanguageWorld(source.languageWorldId ?? '') ?? getLanguageWorldForLocation(source);
  const targetWorld = getLanguageWorld(target.languageWorldId ?? '') ?? getLanguageWorldForLocation(target);
  return resolveWorldTravel(
    sourceWorld ? { ...source, languageWorldId: sourceWorld.id } : source,
    targetWorld ? { ...target, languageWorldId: targetWorld.id } : target,
  );
}
