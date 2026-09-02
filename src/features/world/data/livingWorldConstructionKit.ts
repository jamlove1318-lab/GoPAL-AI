import type { WorldBuildingDefinition, WorldPropDefinition, WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureDefinition, WorldInfrastructureNetwork } from './livingWorldInfrastructure';
import { getWorldInfrastructure, getWorldInfrastructureNetworks } from './livingWorldInfrastructure';
import type { WorldTransportDefinition } from './livingWorldTransport';
import { getLivingWorldTransport } from './livingWorldTransport';
import type { WorldGameplayDefinition } from './livingWorldGameplay';
import { getLocationGameplay } from './livingWorldGameplay';
import type { WorldCharacterDefinition } from './livingWorldCharacters';
import { getWorldCharacters } from './livingWorldCharacters';
import type { WorldEntranceDefinition } from './livingWorldEntrances';
import { getWorldEntrances } from './livingWorldEntrances';
import { getLivingLocationTemplate } from './livingWorldCatalog';

export type WorldArchetype = 'village' | 'city' | 'campus' | 'forest' | 'mountain' | 'coastal' | 'fantasy' | 'scifi' | 'game-level';
export type WorldConstructionEnvironment = { dayNight?: boolean; weather?: boolean; seasons?: boolean; ambientAnimation?: boolean; atmosphere?: 'calm' | 'lively' | 'mysterious' | 'fantasy' | 'futuristic' };
export type WorldConstructionKit = { id:string; name:string; archetype:WorldArchetype; theme:WorldTheme; buildings:WorldBuildingDefinition[]; props:WorldPropDefinition[]; infrastructure:WorldInfrastructureDefinition[]; infrastructureNetworks:WorldInfrastructureNetwork[]; transport:WorldTransportDefinition[]; gameplay:WorldGameplayDefinition[]; characters:WorldCharacterDefinition[]; entrances:WorldEntranceDefinition[]; environment:WorldConstructionEnvironment; tags:string[] };
export type WorldConstructionOverrides = Partial<Omit<WorldConstructionKit,'id'|'archetype'>> & { id?:string };

export type WorldConstructionPreset = {
  archetype: WorldArchetype;
  theme: WorldTheme;
  atmosphere: WorldConstructionEnvironment['atmosphere'];
  tags: string[];
};

export const WORLD_CONSTRUCTION_PRESETS: Record<WorldArchetype, WorldConstructionPreset> = {
  village: { archetype:'village', theme:'emerald', atmosphere:'calm', tags:['settlement','community'] },
  city: { archetype:'city', theme:'festival', atmosphere:'lively', tags:['urban','dense','transport'] },
  campus: { archetype:'campus', theme:'coastal', atmosphere:'lively', tags:['education','learning'] },
  forest: { archetype:'forest', theme:'emerald', atmosphere:'mysterious', tags:['nature','exploration'] },
  mountain: { archetype:'mountain', theme:'mountain', atmosphere:'mysterious', tags:['nature','altitude'] },
  coastal: { archetype:'coastal', theme:'coastal', atmosphere:'calm', tags:['water','harbor','travel'] },
  fantasy: { archetype:'fantasy', theme:'festival', atmosphere:'fantasy', tags:['fantasy','magic','adventure'] },
  scifi: { archetype:'scifi', theme:'coastal', atmosphere:'futuristic', tags:['scifi','technology','space'] },
  'game-level': { archetype:'game-level', theme:'festival', atmosphere:'lively', tags:['game','challenge','replay'] },
};

export function constructionPreset(archetype:WorldArchetype):WorldConstructionPreset { return WORLD_CONSTRUCTION_PRESETS[archetype]; }

export function building(type:WorldBuildingDefinition['type'], id:string, x:number, y:number, options:Omit<WorldBuildingDefinition,'id'|'type'|'x'|'y'>={}):WorldBuildingDefinition { return {id,type,x,y,...options}; }
export function prop(type:WorldPropDefinition['type'], id:string, x:number, y:number, options:Omit<WorldPropDefinition,'id'|'type'|'x'|'y'>={}):WorldPropDefinition { return {id,type,x,y,...options}; }
export function gameplay(kind:WorldGameplayDefinition['kind'], id:string, x:number, y:number, options:Omit<WorldGameplayDefinition,'id'|'kind'|'x'|'y'>={}):WorldGameplayDefinition { return {id,kind,x,y,...options}; }
export function character(role:WorldCharacterDefinition['role'], id:string, x:number, y:number, options:Omit<WorldCharacterDefinition,'id'|'role'|'x'|'y'>={}):WorldCharacterDefinition { return {id,role,x,y,...options}; }
export function entrance(kind:WorldEntranceDefinition['kind'], id:string, x:number, y:number, options:Omit<WorldEntranceDefinition,'id'|'kind'|'x'|'y'>={}):WorldEntranceDefinition { return {id,kind,x,y,...options}; }
export function infrastructure(kind:WorldInfrastructureDefinition['kind'], id:string, x:number, y:number, options:Omit<WorldInfrastructureDefinition,'id'|'kind'|'x'|'y'>={}):WorldInfrastructureDefinition { return {id,kind,x,y,...options}; }
export function infrastructureNetwork(kind:WorldInfrastructureNetwork['kind'], id:string, points:WorldInfrastructureNetwork['points'], width:number, options:Omit<WorldInfrastructureNetwork,'id'|'kind'|'points'|'width'>={}):WorldInfrastructureNetwork { return {id,kind,points,width,...options}; }

export function createWorldConstructionKit(base:Omit<WorldConstructionKit,'id'>&{id?:string}):WorldConstructionKit {
  return { id:base.id??`${base.archetype}-${base.theme}`, name:base.name, archetype:base.archetype, theme:base.theme, buildings:[...base.buildings], props:[...base.props], infrastructure:[...base.infrastructure], infrastructureNetworks:[...base.infrastructureNetworks], transport:[...base.transport], gameplay:[...base.gameplay], characters:[...base.characters], entrances:[...base.entrances], environment:{...base.environment}, tags:[...base.tags] };
}

export function composeWorldConstructionKit(base:WorldConstructionKit,overrides:WorldConstructionOverrides):WorldConstructionKit { return {...base,...overrides,id:overrides.id??base.id,buildings:overrides.buildings?[...overrides.buildings]:[...base.buildings],props:overrides.props?[...overrides.props]:[...base.props],infrastructure:overrides.infrastructure?[...overrides.infrastructure]:[...base.infrastructure],infrastructureNetworks:overrides.infrastructureNetworks?[...overrides.infrastructureNetworks]:[...base.infrastructureNetworks],transport:overrides.transport?[...overrides.transport]:[...base.transport],gameplay:overrides.gameplay?[...overrides.gameplay]:[...base.gameplay],characters:overrides.characters?[...overrides.characters]:[...base.characters],entrances:overrides.entrances?[...overrides.entrances]:[...base.entrances],environment:{...base.environment,...(overrides.environment??{})},tags:overrides.tags?[...overrides.tags]:[...base.tags]}; }
export function cloneConstructionKit(kit:WorldConstructionKit,id=`${kit.id}-copy`):WorldConstructionKit{return composeWorldConstructionKit(kit,{id});}

export function buildWorldConstructionKit(locationId:string):WorldConstructionKit {
  const location=getLivingLocationTemplate(locationId);
  const archetype=inferArchetype(location.id);
  const preset=constructionPreset(archetype);
  return createWorldConstructionKit({id:location.id,name:location.name,archetype,theme:location.theme,buildings:location.buildings,props:location.props,infrastructure:getWorldInfrastructure(location.id),infrastructureNetworks:getWorldInfrastructureNetworks(location.id),transport:getLivingWorldTransport(location.id),gameplay:getLocationGameplay(location.id),characters:getWorldCharacters(location.id),entrances:getWorldEntrances(location.id),environment:{dayNight:true,weather:true,seasons:true,ambientAnimation:true,atmosphere:preset.atmosphere},tags:[...preset.tags,'living-world',location.theme,archetype]});
}

function inferArchetype(locationId:string):WorldArchetype {
  if(locationId.includes('campus')) return 'campus'; if(locationId.includes('city')) return 'city'; if(locationId.includes('forest')) return 'forest'; if(locationId.includes('mountain')) return 'mountain'; if(locationId.includes('coast')||locationId.includes('beach')) return 'coastal'; if(locationId.includes('fantasy')) return 'fantasy'; if(locationId.includes('scifi')||locationId.includes('space')) return 'scifi'; if(locationId.includes('game')) return 'game-level'; return 'village';
}

export function constructionKitSummary(kit:WorldConstructionKit){return {id:kit.id,archetype:kit.archetype,theme:kit.theme,buildings:kit.buildings.length,props:kit.props.length,infrastructure:kit.infrastructure.length,networks:kit.infrastructureNetworks.length,transportNetworks:kit.transport.length,gameplay:kit.gameplay.length,characters:kit.characters.length,entrances:kit.entrances.length};}
