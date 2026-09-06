import type { WorldBuildingDefinition } from '../components/LivingWorldPrimitives';
import { getPhysicalLocationProfile } from './livingPhysicalLocationProfiles';

/**
 * Reusable spatial composition rules. These shape existing building primitives
 * from the canonical physical profile; they do not introduce location-specific
 * renderer branches or new building types.
 */
const COMPOSITIONS: Record<string, Array<{ x: number; y: number; type: WorldBuildingDefinition['type']; scale?: number }>> = {
  'urban-crossing': [
    { x: 18, y: 35, type: 'market', scale: 1.0 },
    { x: 40, y: 27, type: 'cafe', scale: 0.9 },
    { x: 72, y: 34, type: 'library', scale: 0.95 },
    { x: 86, y: 65, type: 'house', scale: 0.8 },
  ],
  'neighborhood-cafe': [
    { x: 28, y: 43, type: 'cafe', scale: 1.08 },
    { x: 58, y: 31, type: 'house', scale: 0.82 },
    { x: 79, y: 52, type: 'workshop', scale: 0.86 },
    { x: 48, y: 72, type: 'house', scale: 0.76 },
  ],
  'historic-district': [
    { x: 19, y: 39, type: 'house', scale: 0.82 },
    { x: 40, y: 27, type: 'sanctuary', scale: 1.08 },
    { x: 66, y: 38, type: 'library', scale: 0.94 },
    { x: 84, y: 61, type: 'house', scale: 0.8 },
  ],
  'bamboo-garden': [
    { x: 50, y: 28, type: 'sanctuary', scale: 1.02 },
    { x: 27, y: 52, type: 'house', scale: 0.72 },
    { x: 72, y: 57, type: 'cafe', scale: 0.78 },
  ],
  'neon-canal': [
    { x: 20, y: 38, type: 'market', scale: 0.98 },
    { x: 45, y: 29, type: 'cafe', scale: 0.92 },
    { x: 70, y: 42, type: 'market', scale: 0.9 },
    { x: 84, y: 64, type: 'workshop', scale: 0.8 },
  ],
  'market-alley': [
    { x: 18, y: 39, type: 'market', scale: 0.9 },
    { x: 39, y: 30, type: 'market', scale: 0.86 },
    { x: 61, y: 38, type: 'cafe', scale: 0.84 },
    { x: 82, y: 50, type: 'market', scale: 0.88 },
  ],
  'craft-district': [
    { x: 24, y: 42, type: 'workshop', scale: 0.98 },
    { x: 49, y: 28, type: 'house', scale: 0.78 },
    { x: 74, y: 43, type: 'workshop', scale: 0.92 },
    { x: 52, y: 70, type: 'cafe', scale: 0.82 },
  ],
  'transit-hub': [
    { x: 50, y: 25, type: 'railway-station', scale: 1.12 },
    { x: 21, y: 43, type: 'market', scale: 0.88 },
    { x: 77, y: 42, type: 'cafe', scale: 0.86 },
    { x: 50, y: 72, type: 'library', scale: 0.86 },
  ],
  'mediterranean-promenade': [
    { x: 25, y: 45, type: 'cafe', scale: 0.96 },
    { x: 53, y: 34, type: 'house', scale: 0.78 },
    { x: 78, y: 48, type: 'workshop', scale: 0.82 },
  ],
  'story-square': [
    { x: 50, y: 27, type: 'library', scale: 1.02 },
    { x: 23, y: 49, type: 'cafe', scale: 0.82 },
    { x: 77, y: 49, type: 'house', scale: 0.8 },
    { x: 50, y: 74, type: 'workshop', scale: 0.78 },
  ],
};

export function composePhysicalLocationBuildings(
  locationId: string,
  buildings: WorldBuildingDefinition[],
): WorldBuildingDefinition[] {
  const profile = getPhysicalLocationProfile(locationId);
  const composition = profile ? COMPOSITIONS[profile.id] : undefined;
  if (!composition || buildings.length === 0) return buildings;

  return buildings.map((building, index) => {
    const slot = composition[index % composition.length];
    return {
      ...building,
      type: slot.type,
      x: slot.x,
      y: slot.y,
      scale: slot.scale ?? building.scale,
    };
  });
}
