import { WorldEngine } from './worldEngine';
import { learnerWorldConsequenceStore } from './learnerWorldConsequenceStore';
import type { WorldLearningOutcome } from '../learning/worldLearningOutcomeEngine';

export type WorldLearningConsequence={
  locationKey:string;
  storyLayer:{ locationKey:string; layer1_identity:string; layer2_history:string; layer3_activeStory:string; layer4_learnerHistory:string };
  revisitNote:string;
  worldEchoId?:string;
};

function appendHistory(current:string, addition:string):string{
  const trimmed=addition.trim();
  if(!trimmed)return current;
  if(current.includes(trimmed))return current;
  return current ? `${current} ${trimmed}` : trimmed;
}

/** Applies a learner's learning outcome to that learner's persistent World state. */
export async function applyWorldLearningConsequence(
  userId:string,
  outcome:WorldLearningOutcome,
):Promise<WorldLearningConsequence>{
  if(!userId.trim()) throw new Error('Applying a World learning consequence requires a userId');
  const locationKey=outcome.placeId;
  const historyAddition=outcome.success
    ? outcome.worldChange
    : `You practised ${outcome.goal} here; the moment remains open.`;
  const existing=await learnerWorldConsequenceStore.list(userId);
  const prior=existing.filter(item=>item.placeId===locationKey);
  const previousHistory=prior.map(item=>item.worldChange).filter(Boolean).join(' ');
  const layer={
    locationKey,
    layer1_identity:outcome.placeId,
    layer2_history:previousHistory,
    layer3_activeStory:outcome.success ? outcome.worldChange : '',
    layer4_learnerHistory:appendHistory(previousHistory,historyAddition),
  };

  const stored=await learnerWorldConsequenceStore.record(userId,{
    worldId:outcome.worldId,
    placeId:outcome.placeId,
    scenarioId:outcome.scenarioId,
    success:outcome.success,
    worldChange:historyAddition,
  });

  const world=new WorldEngine();
  const revisit=await world.getRevisitDifference(locationKey,userId);
  const revisitNote=revisit.note ?? (outcome.success
    ? 'This place now carries a little of your learning history.'
    : 'The moment is still waiting for you.');
  return {locationKey,storyLayer:layer,revisitNote,worldEchoId:stored.id};
}

export const worldLearningConsequenceEngine={apply:applyWorldLearningConsequence};
