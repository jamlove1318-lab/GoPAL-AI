import { MemoryEngine, type MemoryLayer } from '../memory/memoryEngine';
import { eventBus } from '../../lib/events';
import { resolveWorldLearningOutcome, type WorldLearningOutcome } from './worldLearningOutcomeEngine';

export type WorldLearningIntegrationResult={
  outcome:WorldLearningOutcome;
  memoryRecorded:boolean;
};

const memoryLayer:MemoryLayer='learning';

export async function integrateWorldLearningOutcome(
  userId:string,
  scenarioId:string,
  success:boolean,
):Promise<WorldLearningIntegrationResult|null>{
  const outcome=resolveWorldLearningOutcome(scenarioId,success);
  if(!outcome)return null;
  const memory=new MemoryEngine();
  const memoryFact=outcome.success
    ? `Successfully used ${outcome.language} for ${outcome.goal} in ${outcome.placeId}.`
    : `Practised ${outcome.language} for ${outcome.goal} in ${outcome.placeId}.`;
  const recorded=await memory.record(userId,memoryLayer,memoryFact,`world-learning:${scenarioId}:${outcome.success?'success':'practice'}`);
  eventBus.emit('memory:recorded',{memoryId:recorded.id,layer:memoryLayer,userId},'learning');
  eventBus.emit('world:learningOutcomeResolved',{worldId:outcome.worldId,placeId:outcome.placeId,scenarioId:outcome.scenarioId,success:outcome.success,worldChange:outcome.worldChange},'world');
  return {outcome,memoryRecorded:!!recorded};
}

export const worldLearningIntegrationEngine={integrate:integrateWorldLearningOutcome};
