import { LocalStore } from '../../lib/localStore';

const KEY='cassidy_first_welcome_v1';
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
export async function getCassidyWelcomeState(){return LocalStore.get<CassidyWelcomeState>(KEY,{introduced:false,introductionVersion:1});}
export async function shouldShowCassidyIntroduction(){const state=await getCassidyWelcomeState();return !state.introduced;}
export async function completeCassidyIntroduction(){const now=Date.now();const next={introduced:true,introducedAt:now,introductionVersion:1};await LocalStore.set(KEY,next);return next;}
export const cassidyWelcomeEngine={get:getCassidyWelcomeState,shouldShow:shouldShowCassidyIntroduction,complete:completeCassidyIntroduction,script:CASSIDY_INTRODUCTION};
