import type { CassidyMood } from '../../characters/cassidy';
import type { DestinationOpportunity } from '../world/destinationOpportunityEngine';
import { perceiveCassidyContext, type CassidyPerceptionSnapshot } from './cassidyPerceptionEngine';
import { decideCassidyLife, type CassidyLifeActivity, type CassidyLifeInput } from './cassidyLifeEngine';

export type CassidyAutonomyInput = CassidyPerceptionSnapshot & {
  opportunity?: DestinationOpportunity | null;
  learnerNeedsHelp: boolean;
  learnerRecentlySucceeded: boolean;
  learnerIsExploring: boolean;
  minutesSinceCassidySpoke: number;
  hour?: number;
  weather?: CassidyLifeInput['weather'];
  seed?: number;
};

export type CassidyAutonomyDecision = {
  action:'observe'|'join'|'suggest'|'help'|'celebrate'|'wander'|'live';
  mood:CassidyMood;
  priority:number;
  reason:string;
  cue?:string;
  lifeActivity?:CassidyLifeActivity;
  invitation?:boolean;
};

export function decideCassidyAction(input:CassidyAutonomyInput):CassidyAutonomyDecision{
  const snapshot: CassidyPerceptionSnapshot = input;
  const cues=perceiveCassidyContext(snapshot);
  const topCue=cues[0];
  if(input.learnerRecentlySucceeded)return{action:'celebrate',mood:'excited',priority:100,reason:'The learner just succeeded; Cassidy acknowledges the moment without interrupting progress.',cue:topCue?.text};
  if(input.learnerNeedsHelp)return{action:'help',mood:'thinking',priority:95,reason:'The learner needs support, so Cassidy can offer a small contextual hint.',cue:topCue?.text};
  if(input.opportunity?.kind==='resident'&&input.worldMode==='journey')return{action:'join',mood:'warm',priority:80,reason:'A person is nearby and the interaction can create a natural language opportunity.',cue:topCue?.text};
  if(input.opportunity?.kind==='discovery')return{action:'suggest',mood:'thinking',priority:65,reason:'A discovery is available, but Cassidy leaves the decision to the learner.',cue:topCue?.text};
  const life=decideCassidyLife({worldId:(input.worldMode==='home'?'emerald-valley':input.worldId as CassidyLifeInput['worldId']),hour:input.hour??12,weather:input.weather,learnerExploring:input.learnerIsExploring,learnerNeedsHelp:input.learnerNeedsHelp,minutesSinceInteraction:input.minutesSinceCassidySpoke,recentSuccess:input.learnerRecentlySucceeded},input.seed);
  if(life.activity!=='helping'&&life.activity!=='storytelling'&&input.learnerIsExploring&&input.minutesSinceCassidySpoke<5)return{action:'observe',mood:'calm',priority:30,reason:'Cassidy recently spoke, so she gives the learner space.',cue:topCue?.text,lifeActivity:life.activity,invitation:life.invitation};
  return{action:'live',mood:life.mood,priority:life.invitation?45:20,reason:life.reason,cue:topCue?.text,lifeActivity:life.activity,invitation:life.invitation};
}

export const cassidyAutonomyEngine={decide:decideCassidyAction};
