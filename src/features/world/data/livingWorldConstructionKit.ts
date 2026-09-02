import type { WorldBuildingDefinition, WorldPropDefinition, WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureDefinition, WorldInfrastructureNetwork } from './livingWorldInfrastructure';
import type { WorldTransportDefinition } from './livingWorldTransport';
import type { WorldGameplayDefinition } from './livingWorldGameplay';
import type { WorldCharacterDefinition } from './livingWorldCharacters';
import type { WorldEntranceDefinition } from './livingWorldEntrances';

export type WorldArchetype = 'village' | 'city' | 'campus' | 'forest' | 'mountain' | 'coastal' | 'fantasy' | 'scifi' | 'game-level';

export type WorldConstructionEnvironment = {
  dayNight?: boolean;
  weather?: boolean;
  seasons?: boolean;
  ambientAnimation?: boolean;
  atmosphere?: 'calm' | 'lively' | 'mysterious' | 'fantasy' | 'futuristic';
};

export type WorldConstructionKit = {
  id: string;
  name: string;
  archetype: WorldArchetype;
  theme: WorldTheme;
  buildings: WorldBuildingDefinition[];
  props: WorldPropDefinition[];
  infrastructure: WorldInfrastructureDefinition[];
  infrastructureNetworks: WorldInfrastructureNetwork[];
  transport: WorldTransportDefinition[];
  gameplay: WorldGameplayDefinition[];
  characters: WorldCharacterDefinition[];
  entrances: WorldEntranceDefinition[];
  environment: WorldConstructionEnvironment;
  tags: string[];
};

export type WorldConstructionOverrides = Partial<Omit<WorldConstructionKit, 'id' | 'archetype'>> & { id?: string };

export function createWorldConstructionKit(base: Omit<WorldConstructionKit, 'id'> & { id?: string }): WorldConstructionKit {
  return {
    id: base.id ?? `${base.archetype}-${base.theme}`,
    name: base.name,
    archetype: base.archetype,
    theme: base.theme,
    buildings: [...base.buildings],
    props: [...base.props],
    infrastructure: [...base.infrastructure],
    infrastructureNetworks: [...base.infrastructureNetworks],
    transport: [...base.transport],
    gameplay: [...base.gameplay],
    characters: [...base.characters],
    entrances: [...base.entrances],
    environment: { ...base.environment },
    tags: [...base.tags],
  };
}

export function composeWorldConstructionKit(base: WorldConstructionKit, overrides: WorldConstructionOverrides): WorldConstructionKit {
  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id,
    buildings: overrides.buildings ? [...overrides.buildings] : [...base.buildings],
    props: overrides.props ? [...overrides.props] : [...base.props],
    infrastructure: overrides.infrastructure ? [...overrides.infrastructure] : [...base.infrastructure],
    infrastructureNetworks: overrides.infrastructureNetworks ? [...overrides.infrastructureNetworks] : [...base.infrastructureNetworks],
    transport: overrides.transport ? [...overrides.transport] : [...base.transport],
    gameplay: overrides.gameplay ? [...overrides.gameplay] : [...base.gameplay],
    characters: overrides.characters ? [...overrides.characters] : [...base.characters],
    entrances: overrides.entrances ? [...overrides.entrances] : [...base.entrances],
    environment: { ...base.environment, ...(overrides.environment ?? {}) },
    tags: overrides.tags ? [...overrides.tags] : [...base.tags],
  };
}

export function cloneConstructionKit(kit: WorldConstructionKit, id = `${kit.id}-copy`): WorldConstructionKit {
  return composeWorldConstructionKit(kit, { id });
}

export function constructionKitSummary(kit: WorldConstructionKit) {
  return {
    id: kit.id,
    archetype: kit.archetype,
    theme: kit.theme,
    buildings: kit.buildings.length,
    props: kit.props.length,
    infrastructure: kit.infrastructure.length,
    networks: kit.infrastructureNetworks.length,
    transportNetworks: kit.transport.length,
    gameplay: kit.gameplay.length,
    characters: kit.characters.length,
    entrances: kit.entrances.length,
  };
}
