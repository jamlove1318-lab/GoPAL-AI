import { CassidyMood } from '../../characters/cassidy';
import { LanguageWorldId, resolveLanguageWorld } from '../world/languageWorldEngine';
import { worldContextEngine } from '../world/worldContextEngine';

export type CassidyPresenceContext =
  | 'exploring' | 'learning' | 'confused' | 'success' | 'quiet' | 'returning';

export type CassidyWorldPresence = {
  worldId: LanguageWorldId | 'emerald-valley';
  worldName: string;
  destinationId?: string;
  destinationName?: string;
  context: CassidyPresenceContext;
  mood: CassidyMood;
  visible: boolean;
  line: string | null;
  helpMode: 'wait' | 'offer' | 'guide' | 'celebrate';
};

const WORLD_LINES: Record<LanguageWorldId, Record<CassidyPresenceContext, string[]>> = {
  ja:{exploring:['Let’s see what this place is hiding.','I want to see where this street leads.'],learning:['Take your time. We only need the language this moment needs.'],confused:['Want a small hint, or another second to listen?'],success:['That was yours. You used Japanese to make something happen.'],quiet:['We do not have to turn every quiet moment into a lesson.'],returning:['Welcome back. Let’s see what changed while we were away.']},
  es:{exploring:['There is a story around every corner here.','Come on. I want to see where that street goes.'],learning:['Use what you need now. We can grow it later.'],confused:['No rush. Tell me what you caught.'],success:['You just made the conversation move because you understood it.'],quiet:['Sometimes wandering together is enough.'],returning:['Let’s see what this place remembers.']},
  fr:{exploring:['I wonder what is behind those lights.','Let’s follow the street and see.'],learning:['We can borrow a little language now and make it yours later.'],confused:['I can help. Only if you want me to.'],success:['There. You were understood.'],quiet:['Stay a moment. The world can wait.'],returning:['Let’s see what changed while we were gone.']},
  ko:{exploring:['There is so much happening here. Let’s not rush.','I want to know what everyone is doing down there.'],learning:['Catch the useful pieces first. The rest can wait.'],confused:['Try one more time. I am right here.'],success:['You understood enough to act in that moment.'],quiet:['We can just watch the city for a minute.'],returning:['Your story kept moving while we were away.']},
};

const HOME_LINES:Record<CassidyPresenceContext,string[]>={
 exploring:['Home first. There is always something new in Emerald Valley.'],learning:['We can practice here too. Home is part of your journey.'],confused:['It is okay. We can slow down and figure it out together.'],success:['I saw that. You are getting better.'],quiet:['We can just be here for a while.'],returning:['Welcome home.'],
};

function choose<T>(items:T[]):T{return items[Math.floor(Math.random()*items.length)]!;}

export function resolveCassidyWorldPresence(languageCode:string,context:CassidyPresenceContext):CassidyWorldPresence{
 const worldContext=worldContextEngine.resolve();
 if(worldContext.mode==='home')return{worldId:'emerald-valley',worldName:'Emerald Valley',context,mood:context==='success'?'excited':context==='confused'?'thinking':context==='quiet'?'calm':'warm',visible:true,line:choose(HOME_LINES[context]),helpMode:context==='learning'?'guide':context==='confused'?'offer':context==='success'?'celebrate':'wait'};
 const world=resolveLanguageWorld(languageCode);
 const destination=worldContext.destination;
 const mood:CassidyMood=context==='success'?'excited':context==='confused'?'thinking':context==='quiet'?'calm':'warm';
 const helpMode=context==='learning'?'guide':context==='confused'?'offer':context==='success'?'celebrate':'wait';
 return{worldId:world.id,worldName:world.worldName,destinationId:destination?.id,destinationName:destination?.name,context,mood,visible:true,line:choose(WORLD_LINES[world.id][context]),helpMode};
}

export const cassidyWorldPresenceEngine={resolve:resolveCassidyWorldPresence};
