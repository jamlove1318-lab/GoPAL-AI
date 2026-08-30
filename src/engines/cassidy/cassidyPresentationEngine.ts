import type { CassidyAction } from './cassidyActionEngine';

export type CassidyPresentation={
  mode:'quiet'|'hint'|'reaction'|'invitation'|'companion';
  text:string;
  interrupt:boolean;
  action:CassidyAction['action'];
};

export function presentCassidyAction(action:CassidyAction):CassidyPresentation{
  const map:Record<CassidyAction['action'],CassidyPresentation['mode']>={observe:'quiet',help:'hint',celebrate:'reaction',suggest:'invitation',join:'companion',wander:'companion'};
  const mode=map[action.action];
  return {mode,text:action.text,interrupt:action.canInterrupt,action:action.action};
}

export const cassidyPresentationEngine={present:presentCassidyAction};
