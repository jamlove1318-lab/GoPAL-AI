import type { CassidyAction } from './cassidyActionEngine';

export type CassidyPresentation={
  mode:'quiet'|'hint'|'reaction'|'invitation'|'companion'|'life';
  text:string;
  interrupt:boolean;
  action:CassidyAction['action'];
  lifeActivity?:CassidyAction['lifeActivity'];
  visualAction:CassidyAction['visualAction'];
};

export function presentCassidyAction(action:CassidyAction):CassidyPresentation{
  const map:Record<CassidyAction['action'],CassidyPresentation['mode']>={observe:'quiet',help:'hint',celebrate:'reaction',suggest:'invitation',join:'companion',wander:'companion',live:'life'};
  return{mode:map[action.action],text:action.text,interrupt:action.canInterrupt,action:action.action,lifeActivity:action.lifeActivity,visualAction:action.visualAction};
}

export const cassidyPresentationEngine={present:presentCassidyAction};
