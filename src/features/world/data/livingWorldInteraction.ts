import type { WorldBuildingDefinition, WorldPropDefinition } from '../components/LivingWorldPrimitives';
import { distanceToWorldPoint } from '../geometry/livingWorldGeometry';

export type WorldInteractionAction = 'talk' | 'learn' | 'enter' | 'discover' | 'collect' | 'inspect';
export type WorldInteractionDefinition = {
  id: string;
  targetId: string;
  targetKind: 'building' | 'prop';
  label: string;
  actions: WorldInteractionAction[];
  radius: number;
};

const BUILDING_ACTIONS: Record<WorldBuildingDefinition['type'], WorldInteractionAction[]> = {
  cafe: ['enter', 'learn', 'discover'],
  library: ['enter', 'learn', 'discover'],
  market: ['enter', 'collect', 'discover'],
  sanctuary: ['enter', 'talk', 'learn'],
  garden: ['inspect', 'collect', 'discover'],
  school: ['enter', 'learn', 'discover'],
  workshop: ['enter', 'learn', 'inspect'],
  house: ['enter', 'discover'],
};

const PROP_ACTIONS: Partial<Record<WorldPropDefinition['type'], WorldInteractionAction[]>> = {
  tree: ['inspect', 'discover'],
  rock: ['inspect', 'discover'],
  bench: ['inspect', 'talk'],
  flower: ['inspect', 'collect'],
  lamp: ['inspect'],
  sign: ['inspect', 'discover'],
};

export function buildingInteractions(building: WorldBuildingDefinition): WorldInteractionDefinition {
  return {
    id: `interaction:${building.id}`,
    targetId: building.id,
    targetKind: 'building',
    label: building.label ?? building.id,
    actions: BUILDING_ACTIONS[building.type],
    radius: building.interactionRadius ?? 10.5,
  };
}

export function propInteractions(prop: WorldPropDefinition): WorldInteractionDefinition | null {
  const actions = PROP_ACTIONS[prop.type];
  if (!actions) return null;
  return {
    id: `interaction:${prop.id}`,
    targetId: prop.id,
    targetKind: 'prop',
    label: prop.id,
    actions,
    radius: prop.type === 'flower' ? 5 : 6,
  };
}

export function getLocationInteractions(
  buildings: WorldBuildingDefinition[],
  props: WorldPropDefinition[],
): WorldInteractionDefinition[] {
  return [
    ...buildings.map(buildingInteractions),
    ...props
      .map(propInteractions)
      .filter((item): item is WorldInteractionDefinition => item !== null),
  ];
}

export function findNearestInteraction(
  point: { x: number; y: number },
  interactions: WorldInteractionDefinition[],
  buildings: WorldBuildingDefinition[],
  props: WorldPropDefinition[],
): WorldInteractionDefinition | null {
  let nearest: WorldInteractionDefinition | null = null;
  let best = Number.POSITIVE_INFINITY;

  for (const interaction of interactions) {
    const target = interaction.targetKind === 'building'
      ? buildings.find(item => item.id === interaction.targetId)
      : props.find(item => item.id === interaction.targetId);
    if (!target) continue;

    const distance = distanceToWorldPoint(point, target);
    if (distance <= interaction.radius && distance < best) {
      best = distance;
      nearest = interaction;
    }
  }

  return nearest;
}
