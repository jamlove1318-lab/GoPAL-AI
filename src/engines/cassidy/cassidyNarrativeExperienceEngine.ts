import { LocalStore } from '../../lib/localStore';
import { normalizeCassidyUserId, cassidyUserKey } from './cassidyUserStateKeys';

export type CassidyNarrativeKind = 'dream' | 'story' | 'adventure';
export type CassidyNarrative = { id:string; userId:string; kind:CassidyNarrativeKind; title:string; premise:string; worldId:string; destinationId?:string; createdAt:string; completedAt?:string; steps:string[]; };

type NarrativeState={items:CassidyNarrative[]};
const key=(userId:string)=>cassidyUserKey('narratives',normalizeCassidyUserId(userId));
const seed=(text:string)=>Array.from(text).reduce((n,c)=>((n*31+c.charCodeAt(0))>>>0),17);
const templates={
 dream:[['The Valley That Remembered','A quiet dream where familiar places rearrange themselves into a gentle mystery.'],['A Sky Full of Doors','Cassidy dreams that every constellation opens into a different possibility.']],
 story:[['A Story Cassidy Kept','Cassidy shares a story she has been carrying until the right moment.'],['The Little Place Between Journeys','A story about finding warmth in an unexpected place.']],
 adventure:[['The Curious Path','Cassidy notices a path that was not there before and invites the learner to choose whether to follow it.'],['The Hidden Lantern','A strange light becomes the beginning of a small shared adventure.']],
} as const;
export async function createCassidyNarrative(userId:string,kind:CassidyNarrativeKind,worldId:string,destinationId?:string,seedValue=Date.now()):Promise<CassidyNarrative>{const safe=normalizeCassidyUserId(userId);const [title,premise]=templates[kind][seedValue%templates[kind].length]!;const id=`${kind}:${seed(`${safe}:${worldId}:${destinationId??''}:${seedValue}`)}`;const item:CassidyNarrative={id,userId:safe,kind,title,premise,worldId,destinationId,createdAt:new Date().toISOString(),steps:kind==='adventure'?['notice','choose','explore','resolve']:kind==='dream'?['enter','wonder','remember','wake']:['begin','share','reflect','close']};const state=await LocalStore.get<NarrativeState>(key(safe),{items:[]});const existing=state.items.find(x=>x.id===id);if(existing)return existing;state.items=[...state.items,item].slice(-100);await LocalStore.set(key(safe),state);return item;}
export async function completeCassidyNarrative(userId:string,id:string):Promise<CassidyNarrative|null>{const safe=normalizeCassidyUserId(userId);const state=await LocalStore.get<NarrativeState>(key(safe),{items:[]});const index=state.items.findIndex(x=>x.id===id);if(index<0)return null;const item={...state.items[index],completedAt:state.items[index]!.completedAt??new Date().toISOString()};state.items[index]=item;await LocalStore.set(key(safe),state);return item;}
export async function listCassidyNarratives(userId:string,kind?:CassidyNarrativeKind):Promise<CassidyNarrative[]>{const safe=normalizeCassidyUserId(userId);const state=await LocalStore.get<NarrativeState>(key(safe),{items:[]});return kind?state.items.filter(x=>x.kind===kind):state.items;}
export const cassidyNarrativeExperienceEngine={create:createCassidyNarrative,complete:completeCassidyNarrative,list:listCassidyNarratives};
