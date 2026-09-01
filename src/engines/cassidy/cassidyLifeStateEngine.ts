import { LocalStore } from '../../lib/localStore';
import type { CassidyMood } from '../../characters/cassidy';
import type { CassidyLifeActivity } from './cassidyLifeEngine';

const KEY='cassidy:life-state:v1';
export type CassidyLifeState={activity:CassidyLifeActivity;mood:CassidyMood;worldId:string;destinationId?:string;anchorId?:string;startedAt:string;updatedAt:string;visits:number;lastInvitationAt?:string;lastInteractionAt?:string;dreamSeed:number;storySeed:number;adventureSeed:number;};
const DEFAULT_STATE:CassidyLifeState={activity:'resting',mood:'warm',worldId:'emerald-valley',startedAt:new Date(0).toISOString(),updatedAt:new Date(0).toISOString(),visits:0,dreamSeed:17,storySeed:29,adventureSeed:43};
export async function getCassidyLifeState():Promise<CassidyLifeState>{return LocalStore.get<CassidyLifeState>(KEY,DEFAULT_STATE);}
export async function saveCassidyLifeState(input:Partial<CassidyLifeState>&Pick<CassidyLifeState,'activity'|'mood'|'worldId'>):Promise<CassidyLifeState>{const previous=await getCassidyLifeState();const next:CassidyLifeState={...previous,...input,updatedAt:new Date().toISOString()};await LocalStore.set(KEY,next);return next;}
export async function beginCassidyLifeMoment(input:{activity:CassidyLifeActivity;mood:CassidyMood;worldId:string;destinationId?:string;anchorId?:string;invitation?:boolean}):Promise<CassidyLifeState>{const previous=await getCassidyLifeState();const now=new Date().toISOString();const changed=previous.activity!==input.activity||previous.worldId!==input.worldId||previous.destinationId!==input.destinationId;return saveCassidyLifeState({activity:input.activity,mood:input.mood,worldId:input.worldId,destinationId:input.destinationId,anchorId:input.anchorId,startedAt:changed?now:previous.startedAt,visits:previous.visits+(changed?1:0),...(input.invitation?{lastInvitationAt:now}: {})});}
export async function markCassidyInteraction():Promise<CassidyLifeState>{return saveCassidyLifeState({activity:(await getCassidyLifeState()).activity,mood:(await getCassidyLifeState()).mood,worldId:(await getCassidyLifeState()).worldId,lastInteractionAt:new Date().toISOString()});}
export async function clearCassidyLifeState():Promise<void>{await LocalStore.set(KEY,DEFAULT_STATE);}
export const cassidyLifeStateEngine={get:getCassidyLifeState,save:saveCassidyLifeState,begin:beginCassidyLifeMoment,markInteraction:markCassidyInteraction,clear:cassidyLifeStateEngineClear};
async function cassidyLifeStateEngineClear(){await clearCassidyLifeState();}
