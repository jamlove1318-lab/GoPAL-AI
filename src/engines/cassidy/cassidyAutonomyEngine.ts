import type { CassidyMood } from '../../characters/cassidy';
import type { DestinationOpportunity } from '../world/destinationOpportunityEngine';
import { perceiveCassidyContext, type CassidyPerceptionSnapshot } from './cassidyPerceptionEngine';
import { decideCassidyLife, type CassidyLifeActivity, type CassidyLifeInput } from './cassidyLifeEngine';

export type CassidyAutonomyInput = CassidyPerceptionSnapshot & {
 opportunity?: DestinationOpportunity|null; learnerNeedsHelp:boolean; learnerRecentlySucceeded:boolean;
 learnerIsExploring:boolean; minutesSinceCassidySpoke:number; hour?:number;
 weather?:CassidyLifeInput['weather']; seed?:number; destinationId?:string;
};
export type CassidyAutonomyDecision={
 action:'observe'|'join'|'suggest'|'help'|'celebrate'|'wander'|'live'; mood:CassidyMood;
 priority:number; reason:string; cue?:string; lifeActivity?:CassidyLifeActivity; invitation?:boolean;
 worldId?:string; destinationId?:string;
};

export function decideCassidyAction(input:CassidyAutonomyInput):CassidyAutonomyDecision{
 const cues=perceiveCassidyContext(input); const cue=cues[0]?.text;
 const worldId=input.worldMode==='home'?'emerald-valley':input.worldId;
 const destinationId=input.destinationId;
 const meta={worldId,destinationId};
 if(input.learnerRecentlySucceeded)return{...meta,action:'celebrate',mood:'excited',priority:100,reason:'The learner just succeeded; Cassidy acknowledges the moment without interrupting progress.',cue};
 if(input.learnerNeedsHelp)return{...meta,action:'help',mood:'thinking',priority:95,reason:'The learner needs support, so Cassidy can offer a small contextual hint.',cue};
 if(input.opportunity?.kind==='resident'&&input.worldMode==='journey')return{...meta,action:'join',mood:'warm',priority:80,reason:'A person is nearby and the interaction can create a natural language opportunity.',cue};
 if(input.opportunity?.kind==='discovery')return{...meta,action:'suggest',mood:'thinking',priority:65,reason:'A discovery is available, but Cassidy leaves the decision to the learner.',cue};
 const life=decideCassidyLife({worldId:worldId as CassidyLifeInput['worldId'],destinationId,hour:input.hour??12,weather:input.weather,learnerExploring:input.learnerIsExploring,learnerNeedsHelp:input.learnerNeedsHelp,minutesSinceInteraction:input.minutesSinceCassidySpoke,recentSuccess:input.learnerRecentlySucceeded},input.seed);
 if(life.activity!=='helping'&&life.activity!=='storytelling'&&input.learnerIsExploring&&input.minutesSinceCassidySpoke<5)return{...meta,action:'observe',mood:'calm',priority:30,reason:'Cassidy recently spoke, so she gives the learner space.',cue,lifeActivity:life.activity,invitation:life.invitation};
 return{...meta,action:'live',mood:life.mood,priority:life.invitation?45:20,reason:life.reason,cue,lifeActivity:life.activity,invitation:life.invitation};
}
export const cassidyAutonomyEngine={decide:decideCassidyAction};
