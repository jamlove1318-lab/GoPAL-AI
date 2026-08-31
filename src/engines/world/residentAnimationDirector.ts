import type { ResidentMotion } from './livingResidentEncounterEngine';

export type ResidentAnimationStep={motion:ResidentMotion;expression:string;attention:'learner'|'environment'|'task';durationMs:number};
export type ResidentAnimationSequence={trigger:string;steps:ResidentAnimationStep[]};

const step=(motion:ResidentMotion,expression:string,attention:ResidentAnimationStep['attention'],durationMs:number):ResidentAnimationStep=>({motion,expression,attention,durationMs});

export function createResidentAnimationSequence(trigger:'enter'|'learner-typed'|'learner-spoke'|'success'|'confusion'|'goodbye'):ResidentAnimationSequence {
 const sequences:Record<string,ResidentAnimationStep[]>={
  enter:[step('working','focused','task',1100),step('idle','neutral','task',450),step('warm','welcoming','learner',900)],
  'learner-typed':[step('listening','attentive','learner',900),step('thinking','thoughtful','learner',850),step('speaking','warm','learner',1400)],
  'learner-spoke':[step('listening','attentive','learner',900),step('thinking','thoughtful','learner',700),step('speaking','warm','learner',1400)],
  success:[step('warm','pleased','learner',650),step('laughing','delighted','learner',900),step('gesturing','encouraging','learner',1000)],
  confusion:[step('surprised','curious','learner',650),step('thinking','thoughtful','learner',900),step('gesturing','clarifying','learner',1000)],
  goodbye:[step('warm','friendly','learner',700),step('gesturing','farewell','learner',800),step('working','focused','task',1200)],
 };
 return {trigger,steps:sequences[trigger]??sequences.enter};
}

export const residentAnimationDirector={create:createResidentAnimationSequence};
