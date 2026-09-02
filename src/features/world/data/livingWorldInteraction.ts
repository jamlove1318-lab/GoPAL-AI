import { distanceToWorldPoint } from '../geometry/livingWorldGeometry';
import type { WorldObjectDefinition } from './livingWorldObjects';
import type { WorldActionId } from './livingWorldActionSystem';
import { getAvailableWorldActions } from './livingWorldActionSystem';
export type WorldInteractionTargetKind='building'|'prop'|'infrastructure'|'transport'|'vehicle'|'gameplay'|'character'|'entrance';
export type WorldInteractionAction=WorldActionId;
export type WorldInteractionDefinition={id:string;targetId:string;targetKind:WorldInteractionTargetKind;label:string;actions:WorldInteractionAction[];radius:number};
const targetKind=(object:WorldObjectDefinition):WorldInteractionTargetKind=>object.category==='custom'?'gameplay':object.category as WorldInteractionTargetKind;
export function objectInteraction(object:WorldObjectDefinition):WorldInteractionDefinition|null{if(object.interaction?.enabled===false)return null;const actions=getAvailableWorldActions({object,distance:0,unlocked:object.state?.unlocked!==false}).map(action=>action.id);if(!actions.length)return null;return{id:`interaction:${object.id}`,targetId:object.id,targetKind:targetKind(object),label:String(object.metadata?.label??object.id),actions,radius:object.interaction?.radius??8};}
export function getObjectInteractions(objects:WorldObjectDefinition[]){return objects.map(objectInteraction).filter((item):item is WorldInteractionDefinition=>Boolean(item));}
export function findNearestObjectInteraction(point:{x:number;y:number},objects:WorldObjectDefinition[]){let nearest:{interaction:WorldInteractionDefinition;distance:number}|null=null;for(const object of objects){const base=objectInteraction(object);if(!base)continue;const distance=distanceToWorldPoint(point,object.transform);const radius=object.interaction?.radius??base.radius;if(distance>radius)continue;const actions=getAvailableWorldActions({object,distance,unlocked:object.state?.unlocked!==false}).map(action=>action.id);if(!actions.length)continue;const interaction={...base,actions,radius};if(!nearest||distance<nearest.distance)nearest={interaction,distance};}return nearest;}
