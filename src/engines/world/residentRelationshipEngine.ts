import { worldStateEngine } from './worldStateEngine';

export type ResidentRelationship = { residentId:string; familiarity:number; trust:number; sharedMoments:number; helped:number; lastChoice?:string; tone:'new'|'familiar'|'warm'|'trusted' };
const key=(id:string)=>`resident:${id}:relationship`;
const empty=(residentId:string):ResidentRelationship=>({residentId,familiarity:0,trust:0,sharedMoments:0,helped:0,tone:'new'});
function toneFor(r:ResidentRelationship):ResidentRelationship['tone']{if(r.trust>=4||r.sharedMoments>=7)return'trusted';if(r.trust>=2||r.sharedMoments>=4)return'warm';if(r.familiarity>=2)return'familiar';return'new';}
export class ResidentRelationshipEngine{
 async get(residentId:string,userId='local-explorer-user'):Promise<ResidentRelationship>{const stored=await worldStateEngine.get(userId,key(residentId));if(!stored||typeof stored!=='string')return empty(residentId);try{return JSON.parse(stored) as ResidentRelationship;}catch{return empty(residentId);}}
 async recordEncounter(residentId:string,userId='local-explorer-user'):Promise<ResidentRelationship>{const r=await this.get(residentId,userId);r.familiarity+=1;r.tone=toneFor(r);await worldStateEngine.set(userId,key(residentId),JSON.stringify(r));return r;}
 async recordChoice(residentId:string,choice:string,userId='local-explorer-user'):Promise<ResidentRelationship>{const r=await this.get(residentId,userId);r.lastChoice=choice;if(choice!=='wander')r.sharedMoments+=1;if(choice==='help'){r.helped+=1;r.trust+=2;}else if(choice==='stay'||choice==='ask')r.trust+=1;r.tone=toneFor(r);await worldStateEngine.set(userId,key(residentId),JSON.stringify(r));return r;}
 async greeting(residentId:string,name:string,userId='local-explorer-user'):Promise<string>{const r=await this.get(residentId,userId);if(r.tone==='trusted')return `${name} lights up when they notice you. They seem genuinely glad you came back.`;if(r.tone==='warm')return `${name} recognizes you immediately and makes room for you in the moment.`;if(r.tone==='familiar')return `${name} gives you a small knowing smile. You have met here before.`;return `${name} notices you and waits to see what you will do.`;}
}
export const residentRelationshipEngine=new ResidentRelationshipEngine();