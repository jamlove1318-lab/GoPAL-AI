export type ResidentActionPhase='approach'|'prepare'|'interact'|'recover'|'idle';
export interface ResidentActionSequence{residentId:string;activity:string;phase:ResidentActionPhase;cycleMs:number;progress:number;}
const CYCLES:Record<string,number>={ren:7600,emi:8200,kenji:7000};
export function residentActionSequence(residentId:string,activity:string,now=Date.now()):ResidentActionSequence{
 const cycleMs=CYCLES[residentId]??7600; const t=now%cycleMs; const progress=t/cycleMs;
 let phase:ResidentActionPhase='idle';
 if(progress<0.12)phase='approach'; else if(progress<0.28)phase='prepare'; else if(progress<0.68)phase='interact'; else if(progress<0.84)phase='recover';
 return{residentId,activity,phase,cycleMs,progress};
}
export function propStateForAction(phase:ResidentActionPhase):'hidden'|'arriving'|'active'|'settling'{if(phase==='approach')return'hidden';if(phase==='prepare')return'arriving';if(phase==='interact')return'active';if(phase==='recover')return'settling';return'hidden';}
