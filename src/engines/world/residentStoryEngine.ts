import { worldStateEngine } from './worldStateEngine';

export type ResidentThreadStage = 'seeded' | 'waiting' | 'ready' | 'resolved';
export type ResidentStoryThread = { id:string; residentId:string; title:string; detail:string; stage:ResidentThreadStage; createdAt:string; updatedAt:string; followUpAfter?:string };
const indexKey='resident:threads:index';
const key=(id:string)=>`resident:thread:${id}`;
const THREADS:Record<string,Omit<ResidentStoryThread,'stage'|'createdAt'|'updatedAt'>>={
 'emi-lost-page':{id:'emi-lost-page',residentId:'emi',title:'The page that should not exist',detail:'Emi has found a page hidden inside a book that should have been empty.',followUpAfter:'resident:emi:investigated-page'},
 'ren-unusual-guest':{id:'ren-unusual-guest',residentId:'ren',title:'The quiet guest',detail:'Ren keeps glancing toward someone sitting alone by the café window.',followUpAfter:'resident:ren:asked-guest'},
 'kenji-last-lantern':{id:'kenji-last-lantern',residentId:'kenji',title:'One lantern left',detail:'Kenji has one lantern that does not seem to belong to any stall.',followUpAfter:'resident:kenji:helped-lantern'},
};
export class ResidentStoryEngine{
 private async index(userId='local-explorer-user'):Promise<string[]>{const stored=await worldStateEngine.get(userId,indexKey);if(typeof stored!=='string')return[];try{return JSON.parse(stored) as string[];}catch{return[];}}
 private async save(thread:ResidentStoryThread,userId='local-explorer-user'){await worldStateEngine.set(userId,key(thread.id),JSON.stringify(thread));const index=await this.index(userId);if(!index.includes(thread.id))await worldStateEngine.set(userId,indexKey,JSON.stringify([thread.id,...index]));return thread;}
 async begin(threadId:string,userId='local-explorer-user'):Promise<ResidentStoryThread|null>{const template=THREADS[threadId];if(!template)return null;const existing=await this.get(threadId,userId);if(existing)return existing;const now=new Date().toISOString();return this.save({...template,stage:'seeded',createdAt:now,updatedAt:now},userId);}
 async get(threadId:string,userId='local-explorer-user'):Promise<ResidentStoryThread|null>{const stored=await worldStateEngine.get(userId,key(threadId));if(typeof stored!=='string')return null;try{return JSON.parse(stored) as ResidentStoryThread;}catch{return null;}}
 async advance(threadId:string,stage:ResidentThreadStage,userId='local-explorer-user'){const thread=await this.get(threadId,userId);if(!thread)return null;return this.save({...thread,stage,updatedAt:new Date().toISOString()},userId);}
 async noteChoice(residentId:string,choice:string,userId='local-explorer-user'){for(const candidate of Object.values(THREADS).filter(t=>t.residentId===residentId)){if(choice==='ask'||choice==='help'){const thread=await this.begin(candidate.id,userId);if(thread)await this.advance(candidate.id,'waiting',userId);}}}
 async refresh(now=new Date(),userId='local-explorer-user'){const ids=await this.index(userId);const ready:ResidentStoryThread[]=[];for(const id of ids){const thread=await this.get(id,userId);if(!thread||thread.stage!=='waiting')continue;const elapsed=now.getTime()-new Date(thread.updatedAt).getTime();if(elapsed>=5*60*1000){const next=await this.advance(thread.id,'ready',userId);if(next)ready.push(next);}}return ready;}
 async readyForResident(residentId:string,userId='local-explorer-user'){const ready=await this.refresh(new Date(),userId);return ready.find(thread=>thread.residentId===residentId)??null;}
 async resolve(threadId:string,userId='local-explorer-user'){return this.advance(threadId,'resolved',userId);}
}
export const residentStoryEngine=new ResidentStoryEngine();