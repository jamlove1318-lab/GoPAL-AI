import { distanceToWorldPoint } from '../geometry/livingWorldGeometry';
import type { WorldObjectDefinition } from './livingWorldObjects';
import type { WorldActionId } from './livingWorldActionSystem';
import { getAvailableWorldActions } from './livingWorldActionSystem';

export type WorldInteractionTargetKind = 'building' | 'prop' | 'infrastructure' | 'transport' | 'vehicle' | 'gameplay' | 'character' | 'entrance';
export type WorldInteractionAction = WorldActionId;
export type WorldInteractionDefinition = {
  id: string;
  targetId: string;
  targetKind: WorldInteractionTargetKind;
  label: string;
  actions: WorldInteractionAction[];
  radius: number;
};

export function objectInteraction(object: WorldObjectDefinition): WorldInteractionDefinition | null {
  if (object.interaction?.enabled === false) return null;
  const actions = getAvailableWorldActions({ object, distance: 0 }).map(action => action.id);
  if (!actions.length) return null;
  return {
    id: `interaction:${object.id}`,
    targetId: object.id,
    targetKind: object.category === 'custom' ? 'gameplay' : object.category,
    label: String(object.metadata?.label ?? object.id),
    actions,
    radius: object.interaction?.radius ?? 8,
  };
}

export function getObjectInteractions(objects: WorldObjectDefinition[]) {
  return objects.map(objectInteraction).filter((item): item is WorldInteractionDefinition => item !== null);
}

export function findNearestObjectInteraction(point: { x: number; y: number }, objects: WorldObjectDefinition[]) {
  let nearest: { interaction: WorldInteractionDefinition; distance: number } | null = null;
  for (const object of objects) {
    const interaction = objectInteraction(object);
    if (!interaction) continue;
    const distance = distanceToWorldPoint(point, object.transform);
    if (distance <= interaction.radius && (!nearest || distance < nearest.distance)) nearest = { interaction, distance };
  }
  return nearest;
}

/** Legacy building/prop adapter retained while screens migrate to canonical objects. */
import type { WorldBuildingDefinition, WorldPropDefinition } from '../components/LivingWorldPrimitives';
const BUILDING_ACTIONS: Record<WorldBuildingDefinition['type'], WorldInteractionAction[]> = {
  cafe:['enter','learn','discover'], library:['enter','learn','discover'], market:['enter','collect','discover'], sanctuary:['enter','talk','learn'],
  garden:['inspect','collect','discover'], school:['enter','learn','discover'], workshop:['enter','learn','inspect'], house:['enter','discover'],
  'railway-station':['enter','discover','learn'], airport:['enter','discover','learn'],
};
const PROP_ACTIONS: Partial<Record<WorldPropDefinition['type'],WorldInteractionAction[]>> = {tree:['inspect','discover'],rock:['inspect','discover'],bench:['inspect','talk'],flower:['inspect','collect'],lamp:['inspect'],sign:['inspect','discover']};
export function buildingInteractions(building:WorldBuildingDefinition):WorldInteractionDefinition{return{id:`interaction:${building.id}`,targetId:building.id,targetKind:'building',label:building.label??building.id,actions:BUILDING_ACTIONS[building.type],radius:building.interactionRadius??10.5};}
export function propInteractions(prop:WorldPropDefinition):WorldInteractionDefinition|null{const actions=PROP_ACTIONS[prop.type];if(!actions)return null;return{id:`interaction:${prop.id}`,targetId:prop.id,targetKind:'prop',label:prop.id,actions,radius:prop.type==='flower'?5:6};}
export function getLocationInteractions(buildings:WorldBuildingDefinition[],props:WorldPropDefinition[]):WorldInteractionDefinition[]{return[...buildings.map(buildingInteractions),...props.map(propInteractions).filter((item):item is WorldInteractionDefinition=>item!==null)];}
export function findNearestInteraction(point:{x:number;y:number},interactions:WorldInteractionDefinition[],buildings:WorldBuildingDefinition[],props:WorldPropDefinition[]):WorldInteractionDefinition|null{let nearest:null|WorldInteractionDefinition=null;let best=Number.POSITIVE_INFINITY;for(const interaction of interactions){const target=interaction.targetKind==='building'?buildings.find(item=>item.id===interaction.targetId):props.find(item=>item.id===interaction.targetId);if(!target)continue;const distance=distanceToWorldPoint(point,target);if(distance<=interaction.radius&&distance<best){best=distance;nearest=interaction;}}return nearest;}
