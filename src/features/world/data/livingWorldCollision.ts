import type { WorldBuildingDefinition, WorldPropDefinition } from '../components/LivingWorldPrimitives';
import type { WorldObstacle } from '../geometry/livingWorldGeometry';

export type WorldCollisionDefinition = WorldObstacle & { id: string; kind: 'building' | 'prop' };

/** Convert reusable scene objects into world-space collision volumes. */
export function buildingObstacle(building: WorldBuildingDefinition): WorldCollisionDefinition {
  return {
    id: building.id,
    kind: 'building',
    x: building.x,
    y: building.y,
    width: building.type === 'house' ? 11 : 14,
    height: building.type === 'house' ? 8 : 10,
    padding: 2,
  };
}

export function propObstacle(prop: WorldPropDefinition): WorldCollisionDefinition | null {
  if (prop.type !== 'tree' && prop.type !== 'rock' && prop.type !== 'fence') return null;
  const scale = prop.scale ?? 1;
  const size = prop.type === 'tree' ? 5.5 : prop.type === 'fence' ? 4 : 3;
  return {
    id: prop.id,
    kind: 'prop',
    x: prop.x,
    y: prop.y,
    width: size * scale,
    height: (size * 0.72) * scale,
    padding: prop.type === 'tree' ? 1.5 : 0.8,
  };
}

export function locationCollisions(
  buildings: WorldBuildingDefinition[],
  props: WorldPropDefinition[],
): WorldCollisionDefinition[] {
  return [
    ...buildings.map(buildingObstacle),
    ...props.map(propObstacle).filter((item): item is WorldCollisionDefinition => item !== null),
  ];
}
