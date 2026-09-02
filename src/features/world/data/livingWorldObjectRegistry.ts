import type { WorldBuildingType, WorldPropType, WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureKind } from './livingWorldInfrastructure';
import type { WorldGameplayKind } from './livingWorldGameplay';
import type { WorldVehicleKind } from './livingWorldVehicles';
import type { WorldCharacterRole } from './livingWorldCharacters';

export type WorldObjectCategory =
  | 'building' | 'prop' | 'infrastructure' | 'transport' | 'vehicle' | 'nature'
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

const THEMES: WorldTheme[] = ['emerald', 'sakura', 'mountain', 'coastal', 'festival'];
const ALL: WorldTheme[] = [...THEMES];

/** Canonical reusable object vocabulary shared by locations, stories and games. */
export const WORLD_OBJECT_ARCHETYPES: WorldObjectArchetype[] = [
  ...(['house','cafe','library','market','school','sanctuary','workshop','railway-station','airport'] as WorldBuildingType[]).map(type => ({ id:`building.${type}`, category:'building' as const, type, label:type.replace(/-/g,' '), tags:['building'], themes:ALL, reusable:true as const, collision:true, interactive:true })),
  ...(['tree','rock','lamp','bench','fence','flower','sign'] as WorldPropType[]).map(type => ({ id:`prop.${type}`, category:'prop' as const, type, label:type, tags:['prop'], themes:ALL, reusable:true as const, collision:['tree','rock','fence'].includes(type), interactive:['bench','flower','sign'].includes(type) })),
  ...(['road','sidewalk','intersection','bridge','tunnel','railway-crossing','traffic-signal','street-light','bus-stop','parking','dock','harbor','pier','runway','taxiway','helipad','power-line','utility'] as WorldInfrastructureKind[]).map(type => ({ id:`infrastructure.${type}`, category:'infrastructure' as const, type, label:type.replace(/-/g,' '), tags:['infrastructure'], themes:ALL, reusable:true as const, collision:false, interactive:['railway-crossing','traffic-signal','bus-stop'].includes(type) })),
  ...(['train','bus','car','bicycle','boat','airplane'] as WorldVehicleKind[]).map(type => ({ id:`vehicle.${type}`, category:'vehicle' as const, type, label:type, tags:['vehicle'], themes:ALL, reusable:true as const, collision:false, interactive:true })),
  ...(['player','companion','resident','teacher','merchant','guide','traveler','quest-giver','enemy','custom'] as WorldCharacterRole[]).map(role => ({ id:`character.${role}`, category:'character' as const, type:role, label:role.replace(/-/g,' '), tags:['character', role], themes:ALL, reusable:true as const, collision:false, interactive:role !== 'player' })),
  ...(['spawn','checkpoint','collectible','trigger','portal','door','switch','pressure-plate','quest-marker','save-point','shop','loot-container','puzzle','moving-platform','hazard'] as WorldGameplayKind[]).map(type => ({ id:`gameplay.${type}`, category:'gameplay' as const, type, label:type.replace(/-/g,' '), tags:['gameplay'], themes:ALL, reusable:true as const, collision:['door','moving-platform','hazard'].includes(type), interactive:!['spawn','trigger'].includes(type) })),
  { id:'nature.water', category:'nature', type:'water', label:'Water', tags:['nature','terrain'], themes:ALL, reusable:true },
  { id:'nature.grass', category:'nature', type:'grass', label:'Grass', tags:['nature','terrain'], themes:ALL, reusable:true },
  { id:'nature.snow', category:'nature', type:'snow', label:'Snow', tags:['nature','terrain'], themes:['mountain','festival'], reusable:true },
  { id:'nature.sand', category:'nature', type:'sand', label:'Sand', tags:['nature','terrain'], themes:['coastal','festival'], reusable:true },
  { id:'nature.mountain', category:'nature', type:'mountain', label:'Mountain', tags:['nature','landform'], themes:['mountain'], reusable:true, collision:true },
  { id:'nature.cliff', category:'nature', type:'cliff', label:'Cliff', tags:['nature','landform'], themes:['mountain','coastal'], reusable:true, collision:true },
  { id:'fantasy.portal', category:'fantasy', type:'portal', label:'Fantasy Portal', tags:['fantasy','world-transition'], themes:['festival','mountain'], reusable:true, interactive:true },
  { id:'fantasy.castle', category:'fantasy', type:'castle', label:'Castle', tags:['fantasy','building'], themes:['mountain','festival'], reusable:true, collision:true, interactive:true },
  { id:'fantasy.magic-tree', category:'fantasy', type:'magic-tree', label:'Magic Tree', tags:['fantasy','nature'], themes:['emerald','festival'], reusable:true, collision:true, interactive:true },
  { id:'fantasy.dungeon', category:'fantasy', type:'dungeon', label:'Dungeon', tags:['fantasy','building','game'], themes:['mountain','festival'], reusable:true, collision:true, interactive:true },
  { id:'fantasy.village', category:'fantasy', type:'village', label:'Fantasy Village', tags:['fantasy','location'], themes:['emerald','mountain','festival'], reusable:true },
  { id:'sci-fi.spaceport', category:'sci-fi', type:'spaceport', label:'Spaceport', tags:['sci-fi','transport'], themes:['mountain','coastal'], reusable:true, collision:true, interactive:true },
  { id:'sci-fi.spaceship', category:'sci-fi', type:'spaceship', label:'Spaceship', tags:['sci-fi','vehicle'], themes:['mountain','coastal'], reusable:true, interactive:true },
  { id:'sci-fi.robot', category:'sci-fi', type:'robot', label:'Robot', tags:['sci-fi','character'], themes:ALL, reusable:true, interactive:true },
  { id:'sci-fi.station', category:'sci-fi', type:'station', label:'Space Station', tags:['sci-fi','building','transport'], themes:['mountain','coastal'], reusable:true, collision:true, interactive:true },
];

export function getWorldObjectArchetype(id: string) {
  return WORLD_OBJECT_ARCHETYPES.find(object => object.id === id);
}

export function findWorldObjectArchetypes(category: WorldObjectCategory) {
  return WORLD_OBJECT_ARCHETYPES.filter(object => object.category === category);
}

export function findWorldObjectArchetypesByTag(tag: string) {
  return WORLD_OBJECT_ARCHETYPES.filter(object => object.tags.includes(tag));
}
