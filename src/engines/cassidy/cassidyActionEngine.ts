import type { CassidyAutonomyDecision } from './cassidyAutonomyEngine';
import { eventBus } from '../events/eventBus';

export type CassidyAction={
 action:CassidyAutonomyDecision['action'];
 mood:CassidyAutonomyDecision['mood'];
 text:string;
 canInterrupt:boolean;
 priority:number;
};

export function executeCassidyDecision(decision:CassidyAutonomyDecision):CassidyAction{
 const canInterrupt=decision.action==='help'||decision.action==='celebrate'||decision.priority>=90;
 const text={
  observe:'Cassidy stays close and lets the moment breathe.',
  join:'Cassidy notices the person nearby and joins you without taking over.',
  suggest:'Cassidy notices something interesting and leaves the choice to you.',
  help:'Cassidy gives you a small clue, then lets you try.',
  celebrate:'Cassidy shares the moment with you. You did it.',
  wander:'Cassidy wanders alongside you, curious about what you might find.'
 }[decision.action];
 const action={action:decision.action,mood:decision.mood,text,canInterrupt,priority:decision.priority};
 eventBus.emit('cassidy:autonomyActed',{action:action.action,mood:action.mood,priority:action.priority,canInterrupt:action.canInterrupt},'cassidy');
 return action;
}

export const cassidyActionEngine={execute:executeCassidyDecision};
