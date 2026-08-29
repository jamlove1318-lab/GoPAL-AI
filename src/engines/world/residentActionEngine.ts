export type ResidentActionPhase='approach'|'prepare'|'interact'|'recover'|'idle';
export interface ResidentActionSequence{residentId:string;activity:string;phase:ResidentActionPhase;cycleMs:number;progress:number;}
const CYCLES:Record<string,number>={ren:7600,emi:8200,kenji:7000};
export function residentActionSequence(residentId:string,activity:string,now=Date.now()):ResidentActionSequence{
 const cycleMs=CYCLES[residentId]??7600;const t=now%cycleMs;const progress=t/cycleMs;
 const phase:ResidentActionPhase=progress<0.12?'approach':progress<0.28?'prepare':progress<0.68?'interact':progress<0.84?'recover':'idle';
 return{residentId,activity,phase,cycleMs,progress};
}
export function propStateForAction(phase:ResidentActionPhase):'hidden'|'arriving'|'active'|'settling'{return phase==='approach'||phase==='idle'?'hidden':phase==='prepare'?'arriving':phase==='interact'?'active':'settling';}
export function phaseMotionForAction(phase:ResidentActionPhase,activity:string):'walking'|'looking'|'serving'|'reading'|'arranging'|'talking'|'idle'{
 if(phase==='approach')return'walking';if(phase==='prepare')return'looking';if(phase==='recover')return'looking';if(phase==='idle')return'idle';
 if(activity.includes('tea')||activity.includes('café'))return'serving';
 if(activity.includes('book')||activity.includes('reading')||activity.includes('story'))return'reading';
 if(activity.includes('talking')||activity.includes('calling'))return'talking';
 return'arranging';
}
