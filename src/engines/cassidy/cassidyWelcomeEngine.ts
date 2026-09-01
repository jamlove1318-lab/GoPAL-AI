import { LocalStore } from '../../lib/localStore';
import { MemoryEngine } from '../memory/memoryEngine';

const KEY='cassidy_first_welcome_v1';
const INTRODUCTION_VERSION=1;
const FIRST_MEETING_MEMORY='Met Cassidy for the first time in the GoPAL-AI universe.';
export type CassidyWelcomeState={introduced:boolean;introducedAt?:number;introductionVersion:number;};
export const CASSIDY_INTRODUCTION=[
  'Oh! You\'re here.',
  'I\'ve been waiting to meet you.',
  'I\'m Cassidy.',
  'This place is a little hard to explain...',
  'It\'s a world. A whole universe, actually. And you\'re going to be learning languages here.',
  'But don\'t worry. You don\'t have to walk through it alone.',
  'I\'ll be around.',
  'Sometimes I\'ll come with you. Sometimes I\'ll find something interesting and drag you into an adventure.',
  'And sometimes... I\'ll probably just be sitting somewhere, watching the rain.',
  'That\'s just how I am.',
  'Anyway... welcome.',
  'Let\'s see what\'s waiting for you.'
] as const;
const DEFAULT_STATE:CassidyWelcomeState={introduced:false,introductionVersion:INTRODUCTION_VERSION};
export async function getCassidyWelcomeState(){const stored=await LocalStore.get<Partial<CassidyWelcomeState>>(KEY,{});return{...DEFAULT_STATE,...stored,introductionVersion:typeof stored.introductionVersion==='number'&&stored.introductionVersion>0?stored.introductionVersion:INTRODUCTION_VERSION};}
export async function shouldShowCassidyIntroduction(){const state=await getCassidyWelcomeState();return !state.introduced;}
export async function completeCassidyIntroduction(userId='local-explorer-user'){const current=await getCassidyWelcomeState();if(current.introduced)return current;const now=Date.now();const next:CassidyWelcomeState={introduced:true,introducedAt:now,introductionVersion:INTRODUCTION_VERSION};await LocalStore.set(KEY,next);await new MemoryEngine().record(userId,'character',FIRST_MEETING_MEMORY,`cassidy:first-meeting:v${INTRODUCTION_VERSION}`);return next;}
export const cassidyWelcomeEngine={get:getCassidyWelcomeState,shouldShow:shouldShowCassidyIntroduction,complete:completeCassidyIntroduction,script:CASSIDY_INTRODUCTION};
