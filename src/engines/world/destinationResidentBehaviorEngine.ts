import type { LanguageWorldId } from './languageWorldEngine';
import { getDestinationResident } from './destinationResidentEngine';

export type ResidentBehaviorState='idle'|'notice'|'listen'|'think'|'happy'|'confused'|'talk'|'goodbye';
export type ResidentBehaviorResult={state:ResidentBehaviorState;mood:string;gesture:'idle'|'look_at_learner'|'listen'|'think'|'smile'|'gentle_correction'|'speak'|'wave';gaze:'learner'|'environment'|'away';durationMs:number;reason:string};
export type ResidentMoment='encounter'|'listening'|'correct'|'close'|'incorrect'|'guidance'|'complete'|'leave';

export function chooseResidentBehavior(moment:ResidentMoment,residentMood='calm'):ResidentBehaviorResult{
 switch(moment){
  case 'encounter':return{state:'notice',mood:residentMood,gesture:'look_at_learner',gaze:'learner',durationMs:900,reason:'Resident notices the learner.'};
  case 'listening':return{state:'listen',mood:residentMood,gesture:'listen',gaze:'learner',durationMs:900,reason:'Resident is listening to the learner.'};
  case 'correct':return{state:'think',mood:'patient',gesture:'gentle_correction',gaze:'learner',durationMs:1100,reason:'The answer is close; resident gives the learner room to adjust.'};
  case 'close':return{state:'think',mood:'encouraging',gesture:'think',gaze:'away',durationMs:1000,reason:'Resident considers a nearly correct answer.'};
  case 'incorrect':return{state:'confused',mood:'gentle',gesture:'gentle_correction',gaze:'learner',durationMs:1000,reason:'Resident signals that another attempt may help.'};
  case 'guidance':return{state:'listen',mood:'patient',gesture:'listen',gaze:'learner',durationMs:700,reason:'Resident waits while the learner receives guidance.'};
  case 'complete':return{state:'happy',mood:'warm',gesture:'smile',gaze:'learner',durationMs:1200,reason:'Resident celebrates the completed learning moment.'};
  case 'leave':return{state:'goodbye',mood:'warm',gesture:'wave',gaze:'learner',durationMs:1300,reason:'Resident gives a brief goodbye before returning to the world.'};
 }
}

export function getDestinationResidentBehavior(worldId:LanguageWorldId,placeId:string,residentId:string,moment:ResidentMoment):ResidentBehaviorResult|null{
 const resident=getDestinationResident(worldId,placeId,residentId);if(!resident)return null;
 return chooseResidentBehavior(moment,resident.mood);
}

export const destinationResidentBehaviorEngine={choose:chooseResidentBehavior,get:getDestinationResidentBehavior};
