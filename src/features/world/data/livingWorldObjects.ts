import type { WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldBuildingType, WorldPropType } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureKind } from './livingWorldInfrastructure';
import type { WorldTransportKind } from './livingWorldTransport';
import type { WorldGameplayKind } from './livingWorldGameplay';
import type { WorldVehicleKind } from './livingWorldVehicles';
import type { WorldCinematicAnchors } from './livingWorldLocationSchema';

export type WorldObjectCategory = 'building' | 'prop' | 'infrastructure' | 'transport' | 'vehicle' | 'gameplay' | 'character' | 'nature' | 'custom';
export type WorldObjectType = WorldBuildingType | WorldPropType | WorldInfrastructureKind | WorldTransportKind | WorldVehicleKind | WorldGameplayKind | string;
export type WorldObjectTransform = { x: number; y: number; scale?: number; rotation?: number; layer?: number };
export type WorldObjectVisual = { theme?: WorldTheme; variant?: string; visible?: boolean; opacity?: number };
export type WorldObjectCollision = { enabled: boolean; width?: number; height?: number; radius?: number; padding?: number; solid?: boolean };
export type WorldObjectInteraction = { enabled: boolean; actions?: string[]; radius?: number; targetId?: string };
export type WorldObjectBehavior = { enabled: boolean; behaviorId?: string; routeId?: string; speed?: number; loop?: boolean };
export type WorldObjectState = { active?: boolean; unlocked?: boolean; collected?: boolean; discovered?: boolean; [key: string]: unknown };

export type WorldObjectDefinition = { id: string; category: WorldObjectCategory; type: WorldObjectType; transform: WorldObjectTransform; visual?: WorldObjectVisual; collision?: WorldObjectCollision; interaction?: WorldObjectInteraction; behavior?: WorldObjectBehavior; state?: WorldObjectState; tags?: string[]; metadata?: Record<string, unknown> };
export type WorldCinematicTarget = { x: number; y: number; scale?: number; rotation?: number; objectId?: string; reason: string };

export function createWorldObject(input: WorldObjectDefinition): WorldObjectDefinition { return { ...input, tags: input.tags ? [...input.tags] : [] }; }
export function objectIsInteractive(object: WorldObjectDefinition): boolean { return object.interaction?.enabled === true; }
export function objectBlocksMovement(object: WorldObjectDefinition): boolean { return object.collision?.enabled === true && object.collision.solid !== false; }
export function objectsByCategory(objects: WorldObjectDefinition[], category: WorldObjectCategory) { return objects.filter(object => object.category === category); }
export function objectsByTag(objects: WorldObjectDefinition[], tag: string) { return objects.filter(object => object.tags?.includes(tag)); }

export function resolveCinematicTarget(objects: WorldObjectDefinition[], focus: 'landmark' | 'resident' | 'transport' | 'environment' | 'departure' | 'establishing', anchors?: WorldCinematicAnchors): WorldCinematicTarget {
 const candidates = objects.filter(object => object.visual?.visible !== false);
 const anchorId = focus === 'landmark' ? anchors?.landmarkObjectId : focus === 'resident' ? anchors?.residentObjectId : focus === 'transport' ? anchors?.transportObjectId : focus === 'environment' ? anchors?.environmentObjectId : focus === 'departure' ? anchors?.departureObjectId : anchors?.landmarkObjectId;
 const anchored = anchorId ? candidates.find(object => object.id === anchorId) : undefined;
 const find = (predicate: (object: WorldObjectDefinition) => boolean) => candidates.find(predicate);
 const landmark = find(object => object.category === 'building' && (object.tags?.includes('landmark') || object.tags?.includes('signature'))) ?? find(object => object.category === 'building') ?? find(object => object.category === 'infrastructure');
 const resident = find(object => object.category === 'character');
 const transport = find(object => object.category === 'vehicle') ?? find(object => object.category === 'transport');
 const environment = find(object => object.category === 'nature' && (object.tags?.includes('signature') || object.tags?.includes('landmark'))) ?? find(object => object.category === 'nature') ?? find(object => object.type === 'water');
 const fallback = focus === 'landmark' ? landmark : focus === 'resident' ? resident : focus === 'transport' ? transport : focus === 'environment' ? environment : focus === 'departure' ? transport ?? landmark : landmark ?? environment ?? resident;
 const target = anchored ?? fallback;
 if (!target) return { x: 50, y: 50, scale: 1, reason: 'location-center-fallback' };
 return { x: target.transform.x, y: target.transform.y, scale: Math.max(.9, Math.min(1.35, target.transform.scale ?? 1)), rotation: target.transform.rotation, objectId: target.id, reason: anchored ? `anchor:${focus}:${target.id}` : `${focus}:${target.id}` };
}