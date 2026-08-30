import type { CassidyMood } from '../../characters/cassidy';
import type { DestinationOpportunity } from '../world/destinationOpportunityEngine';

export type CassidyPerceptionSnapshot={
  worldMode:'home'|'journey';
  worldId?:string;
  placeId?:string;
  placeName?:string;
  opportunity?:Pick<DestinationOpportunity,'id'|'kind'|'title'|'detail'|'residentId'|'scenarioId'>;
  learner:{isExploring:boolean;needsHelp:boolean;recentlySucceeded:boolean;recentTopic?:string};
  relationship?:{residentId:string;familiarity:number;trust:number};
  time:{minutesSinceCassidySpoke:number;minutesSinceDestinationVisit?:number};
  atmosphere?:string;
};

export type CassidyPerceptionCue={type:'location'|'opportunity'|'learning'|'relationship'|'time'|'silence';text:string;priority:number;mood:CassidyMood};

export function perceiveCassidyContext(snapshot:CassidyPerceptionSnapshot):CassidyPerceptionCue[]{
  const cues:CassidyPerceptionCue[]=[];
  if(snapshot.placeName)cues.push({type:'location',text:`You are in ${snapshot.placeName}.`,priority:20,mood:'calm'});
  if(snapshot.opportunity)cues.push({type:'opportunity',text:snapshot.opportunity.title,priority:70,mood:snapshot.opportunity.kind==='discovery'?'curious':'warm'});
  if(snapshot.learner.needsHelp)cues.push({type:'learning',text:'The learner may need a small amount of contextual help.',priority:90,mood:'thinking'});
  if(snapshot.learner.recentlySucceeded)cues.push({type:'learning',text:'The learner just succeeded.',priority:100,mood:'excited'});
  if(snapshot.relationship&&snapshot.relationship.familiarity>0)cues.push({type:'relationship',text:`There is an existing connection with ${snapshot.relationship.residentId}.`,priority:60,mood:'warm'});
  if(snapshot.time.minutesSinceCassidySpoke<5)cues.push({type:'silence',text:'Cassidy spoke recently; give the learner room.',priority:50,mood:'calm'});
  if(snapshot.time.minutesSinceCassidySpoke>=5)cues.push({type:'time',text:'Enough time has passed for Cassidy to naturally reappear if there is a reason.',priority:30,mood:'warm'});
  return cues.sort((a,b)=>b.priority-a.priority);
}

export const cassidyPerceptionEngine={perceive:perceiveCassidyContext};
