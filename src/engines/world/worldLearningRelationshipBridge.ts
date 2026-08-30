import { residentRelationshipEngine, type ResidentRelationship } from './residentRelationshipEngine';
import { eventBus } from '../../lib/events';
import type { WorldLearningOutcome } from '../learning/worldLearningOutcomeEngine';

export type WorldLearningRelationshipResult={residentId:string;relationship:ResidentRelationship}|null;

export async function applyLearningRelationshipOutcome(
  outcome:WorldLearningOutcome,
  residentId?:string,
):Promise<WorldLearningRelationshipResult>{
  if(!residentId)return null;
  const relationship=await residentRelationshipEngine.recordEncounter(residentId);
  const choice=outcome.success?'stay':'ask';
  const updated=await residentRelationshipEngine.recordChoice(residentId,choice);
  eventBus.emit('world:learningRelationshipChanged',{residentId,worldId:outcome.worldId,placeId:outcome.placeId,success:outcome.success,tone:updated.tone,familiarity:updated.familiarity,trust:updated.trust},'world');
  return {residentId,relationship:updated};
}

export const worldLearningRelationshipBridge={apply:applyLearningRelationshipOutcome};
