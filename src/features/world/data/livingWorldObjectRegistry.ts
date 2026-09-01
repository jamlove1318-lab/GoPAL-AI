import type { WorldBuildingType, WorldPropType, WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureKind } from './livingWorldInfrastructure';

export type WorldObjectCategory =
  | 'building' | 'prop' | 'infrastructure' | 'transport' | 'nature'
  | 'character' | 'gameplay' | 'fantasy' | 'sci-fi';

export type WorldObjectArchetype = {
  id: string;
  category: WorldObjectCategory;
  type: string;
  label: string;
  tags: string[];
  themes: WorldTheme[];
  reusable: true;
  collision?: boolean;
  interactive?: boolean;
};

/** Canonical reusable object vocabulary shared by locations and games. */
export const WORLD_OBJECT_ARCHETYPES: WorldObjectArchetype[] = [
  ...(['house','cafe','library','market','school','sanctuary','workshop','railway-station','airport'] as WorldBuildingType[]).map(type => ({ id:`building.${type}`, category:'building' as const, type, label:type.replace(/-/g,' '), tags:['building'], themes:['emerald','sakura','mountain','coastal','festival'] as WorldTheme[], reusable:true as const, collision:true, interactive:true })),
  ...(['tree','rock','lamp','bench','fence','flower','sign'] as WorldPropType[]).map(type => ({ id:`prop.${type}`, category:'prop' as const, type, label:type, tags:['prop'], themes:['emerald','sakura','mountain','coastal','festival'] as WorldTheme[], reusable:true as const, collision:['tree','rock','fence'].includes(type), interactive:['bench','flower','sign'].includes(type) })),
  ...(['road','sidewalk','intersection','bridge','tunnel','railway-crossing','traffic-signal','street-light','bus-stop','parking','dock','harbor','pier','runway','taxiway','helipad','power-line','utility'] as WorldInfrastructureKind[]).map(type => ({ id:`infrastructure.${type}`, category:'infrastructure' as const, type, label:type.replace(/-/g,' '), tags:['infrastructure'], themes:['emerald','sakura','mountain','coastal','festival'] as WorldTheme[], reusable:true as const, collision:false, interactive:['railway-crossing','bus-stop'].includes(type) })),
  { id:'transport.train', category:'transport', type:'train', label:'Train', tags:['vehicle','rail'], themes:['emerald','mountain','coastal'], reusable:true },
  { id:'transport.bus', category:'transport', type:'bus', label:'Bus', tags:['vehicle','road'], themes:['emerald','coastal'], reusable:true },
  { id:'transport.car', category:'transport', type:'car', label:'Car', tags:['vehicle','road'], themes:['emerald','coastal','mountain'], reusable:true },
  { id:'transport.bicycle', category:'transport', type:'bicycle', label:'Bicycle', tags:['vehicle','road'], themes:['emerald','sakura','coastal'], reusable:true },
  { id:'transport.boat', category:'transport', type:'boat', label:'Boat', tags:['vehicle','water'], themes:['coastal'], reusable:true },
  { id:'transport.airplane', category:'transport', type:'airplane', label:'Airplane', tags:['vehicle','air'], themes:['coastal','mountain'], reusable:true },
  { id:'gameplay.spawn', category:'gameplay', type:'spawn', label:'Spawn Point', tags:['gameplay'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true },
  { id:'gameplay.checkpoint', category:'gameplay', type:'checkpoint', label:'Checkpoint', tags:['gameplay'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true },
  { id:'gameplay.collectible', category:'gameplay', type:'collectible', label:'Collectible', tags:['gameplay'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true },
  { id:'gameplay.trigger', category:'gameplay', type:'trigger', label:'Trigger Zone', tags:['gameplay'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true },
  { id:'gameplay.portal', category:'gameplay', type:'portal', label:'Portal', tags:['gameplay','world-transition'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true },
  { id:'gameplay.door', category:'gameplay', type:'door', label:'Door', tags:['gameplay','entrance'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true, interactive:true },
  { id:'gameplay.switch', category:'gameplay', type:'switch', label:'Switch', tags:['gameplay','puzzle'], themes:['emerald','sakura','mountain','coastal','festival'], reusable:true, interactive:true },
  { id:'fantasy.portal', category:'fantasy', type:'portal', label:'Fantasy Portal', tags:['fantasy','world-transition'], themes:['festival','mountain'], reusable:true, interactive:true },
  { id:'fantasy.castle', category:'fantasy', type:'castle', label:'Castle', tags:['fantasy','building'], themes:['mountain','festival'], reusable:true, collision:true },
  { id:'fantasy.magic-tree', category:'fantasy', type:'magic-tree', label:'Magic Tree', tags:['fantasy','nature'], themes:['emerald','festival'], reusable:true, collision:true },
  { id:'sci-fi.spaceport', category:'sci-fi', type:'spaceport', label:'Spaceport', tags:['sci-fi','transport'], themes:['mountain','coastal'], reusable:true, collision:true, interactive:true },
];

export function getWorldObjectArchetype(id: string) {
  return WORLD_OBJECT_ARCHETYPES.find(object => object.id === id);
}

export function findWorldObjectArchetypes(category: WorldObjectCategory) {
  return WORLD_OBJECT_ARCHETYPES.filter(object => object.category === category);
}
