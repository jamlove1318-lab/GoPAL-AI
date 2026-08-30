import type { CassidyMood } from '../../characters/cassidy';
import type { DestinationOpportunity } from '../world/destinationOpportunityEngine';

export type CassidyAutonomyInput={
  worldMode:'home'|'journey';
  opportunity?:DestinationOpportunity|null;
  learnerNeedsHelp:boolean;
  learnerRecentlySucceeded:boolean;
  learnerIsExploring:boolean;
  minutesSinceCassidySpoke:number;
};

export type CassidyAutonomyDecision={
  action:'observe'|'join'|'suggest'|'help'|'celebrate'|'wander';
  mood:CassidyMood;
  priority:number;
  reason:string;
};

export function decideCassidyAction(input:CassidyAutonomyInput):CassidyAutonomyDecision{
  if(input.learnerRecentlySucceeded)return{action:'celebrate',mood:'excited',priority:100,reason:'The learner just succeeded; Cassidy acknowledges the moment without interrupting progress.'};
  if(input.learnerNeedsHelp)return{action:'help',mood:'thinking',priority:95,reason:'The learner needs support, so Cassidy can offer a small contextual hint.'};
  if(input.opportunity?.kind==='resident'&&input.worldMode==='journey')return{action:'join',mood:'warm',priority:80,reason:'A person is nearby and the interaction can create a natural language opportunity.'};
  if(input.opportunity?.kind==='discovery')return{action:'suggest',mood:'thinking',priority:65,reason:'A discovery is available, but Cassidy leaves the decision to the learner.'};
  if(input.learnerIsExploring&&input.minutesSinceCassidySpoke<5)return{action:'observe',mood:'calm',priority:30,reason:'Cassidy recently spoke, so she gives the learner space.'};
  if(input.learnerIsExploring)return{action:'wander',mood:'warm',priority:25,reason:'Cassidy can move with the learner without turning exploration into a lesson.'};
  return{action:'observe',mood:'calm',priority:10,reason:'Nothing currently requires Cassidy to intervene.'};
}

export const cassidyAutonomyEngine={decide:decideCassidyAction};
