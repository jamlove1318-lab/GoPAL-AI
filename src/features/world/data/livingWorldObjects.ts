import type { WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldBuildingType, WorldPropType } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureKind } from './livingWorldInfrastructure';
import type { WorldTransportKind } from './livingWorldTransport';
import type { WorldGameplayKind } from './livingWorldGameplay';
import type { WorldVehicleKind } from './livingWorldVehicles';

export type WorldObjectCategory = 'building' | 'prop' | 'infrastructure' | 'transport' | 'vehicle' | 'gameplay' | 'character' | 'nature' | 'custom';
export type WorldObjectType = WorldBuildingType | WorldPropType | WorldInfrastructureKind | WorldTransportKind | WorldVehicleKind | WorldGameplayKind | string;

export type WorldObjectTransform = { x: number; y: number; scale?: number; rotation?: number; layer?: number };
export type WorldObjectVisual = { theme?: WorldTheme; variant?: string; visible?: boolean; opacity?: number };
export type WorldObjectCollision = { enabled: boolean; width?: number; height?: number; radius?: number; padding?: number; solid?: boolean };
export type WorldObjectInteraction = { enabled: boolean; actions?: string[]; radius?: number; targetId?: string };
export type WorldObjectBehavior = { enabled: boolean; behaviorId?: string; routeId?: string; speed?: number; loop?: boolean };
export type WorldObjectState = { active?: boolean; unlocked?: boolean; collected?: boolean; discovered?: boolean; [key: string]: unknown };

/** Canonical instance contract shared by locations, stories, learning spaces and games. */
export type WorldObjectDefinition = {
  id: string;
  category: WorldObjectCategory;
  type: WorldObjectType;
  transform: WorldObjectTransform;
  visual?: WorldObjectVisual;
  collision?: WorldObjectCollision;
  interaction?: WorldObjectInteraction;
  behavior?: WorldObjectBehavior;
  state?: WorldObjectState;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export function createWorldObject(input: WorldObjectDefinition): WorldObjectDefinition { return { ...input, tags: input.tags ? [...input.tags] : [] }; }
export function objectIsInteractive(object: WorldObjectDefinition): boolean { return object.interaction?.enabled === true; }
export function objectBlocksMovement(object: WorldObjectDefinition): boolean { return object.collision?.enabled === true && object.collision.solid !== false; }
export function objectsByCategory(objects: WorldObjectDefinition[], category: WorldObjectCategory) { return objects.filter(object => object.category === category); }
export function objectsByTag(objects: WorldObjectDefinition[], tag: string) { return objects.filter(object => object.tags?.includes(tag)); }
