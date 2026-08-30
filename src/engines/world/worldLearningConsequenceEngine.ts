import { WaveStore, type StoryLayerState } from '../../lib/waveStore';
import { WorldEngine } from './worldEngine';
import type { WorldLearningOutcome } from '../learning/worldLearningOutcomeEngine';

export type WorldLearningConsequence={
  locationKey:string;
  storyLayer:StoryLayerState;
  revisitNote:string;
};

function appendHistory(current:string, addition:string):string{
  const trimmed=addition.trim();
  if(!trimmed)return current;
  if(current.includes(trimmed))return current;
  return current ? `${current} ${trimmed}` : trimmed;
}

export async function applyWorldLearningConsequence(outcome:WorldLearningOutcome):Promise<WorldLearningConsequence>{
  const locationKey=outcome.placeId;
  const existing=await WaveStore.getStoryLayer(locationKey);
  const now=new Date().toISOString();
  const base:StoryLayerState=existing ?? {
    locationKey,
    layer1_identity:outcome.placeId,
    layer2_history:'',
    layer3_activeStory:'',
    layer4_learnerHistory:'',
  };
  const history=appendHistory(base.layer4_learnerHistory, outcome.success ? outcome.worldChange : `You practised ${outcome.goal} here; the moment remains open.`);
  const layer:StoryLayerState={
    ...base,
    layer3_activeStory:outcome.success ? outcome.worldChange : base.layer3_activeStory,
    layer4_learnerHistory:history,
  };
  await WaveStore.saveStoryLayer(layer);

  const world=new WorldEngine();
  const revisit=await world.getRevisitDifference(locationKey);
  const revisitNote=revisit.note ?? (outcome.success ? 'This place now carries a little of your learning history.' : 'The moment is still waiting for you.');
  void now;
  return {locationKey,storyLayer:layer,revisitNote};
}

export const worldLearningConsequenceEngine={apply:applyWorldLearningConsequence};
