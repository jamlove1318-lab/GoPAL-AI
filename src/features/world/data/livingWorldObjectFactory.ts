import { getLocationGameplay } from './livingWorldGameplay';
import { getWorldInfrastructure } from './livingWorldInfrastructure';
import { getWorldVehicles } from './livingWorldVehicles';
import { getLivingWorldTransport } from './livingWorldTransport';
import { getLivingLocationTemplate } from './livingWorldCatalog';
import { WorldObjectDefinition } from './livingWorldObjects';

/** Converts existing catalogs into one canonical object stream without duplicating their source data. */
export function getLocationWorldObjects(locationId: string): WorldObjectDefinition[] {
  const location = getLivingLocationTemplate(locationId);
  const objects: WorldObjectDefinition[] = [];

  for (const building of location.buildings) objects.push({
    id: building.id, category: 'building', type: building.type,
    transform: { x: building.x, y: building.y, scale: building.scale },
    visual: { theme: location.theme },
    collision: { enabled: true, width: building.collisionWidth, height: building.collisionHeight, solid: true },
    interaction: { enabled: true, radius: building.interactionRadius },
  });
  for (const prop of location.props) objects.push({
    id: prop.id, category: prop.type === 'tree' || prop.type === 'flower' ? 'nature' : 'prop', type: prop.type,
    transform: { x: prop.x, y: prop.y, scale: prop.scale }, visual: { theme: location.theme },
    collision: { enabled: prop.type === 'tree' || prop.type === 'rock' || prop.type === 'fence', solid: true },
  });
  for (const item of getWorldInfrastructure(locationId)) objects.push({
    id: item.id, category: 'infrastructure', type: item.kind,
    transform: { x: item.x, y: item.y, scale: item.scale, rotation: item.rotation, layer: item.zIndex },
    visual: { theme: item.theme ?? location.theme, variant: item.variant }, interaction: { enabled: item.interactive === true },
  });
  for (const network of getLivingWorldTransport(locationId)) for (const feature of network.features) objects.push({
    id: feature.id, category: 'transport', type: network.kind,
    transform: { x: 0, y: 0, layer: feature.zIndex }, visual: { theme: network.theme, opacity: feature.opacity },
    metadata: { featureKind: feature.kind, path: feature.path, width: feature.width },
  });
  for (const vehicle of getWorldVehicles(locationId)) objects.push({
    id: vehicle.id, category: 'vehicle', type: vehicle.kind,
    transform: { x: vehicle.x, y: vehicle.y, scale: vehicle.scale, rotation: vehicle.rotation },
    visual: { theme: vehicle.theme }, interaction: { enabled: vehicle.interactive === true },
    behavior: { enabled: vehicle.moving === true, routeId: vehicle.routeId, speed: vehicle.speed },
  });
  for (const item of getLocationGameplay(locationId)) objects.push({
    id: item.id, category: 'gameplay', type: item.kind,
    transform: { x: item.x, y: item.y, scale: item.scale }, visual: { theme: item.theme },
    interaction: { enabled: item.interactive === true, radius: item.radius, targetId: item.targetId },
    state: { active: true }, tags: item.tags,
  });
  return objects;
}

export function getWorldObject(locationId: string, objectId: string): WorldObjectDefinition | null {
  return getLocationWorldObjects(locationId).find(object => object.id === objectId) ?? null;
}
