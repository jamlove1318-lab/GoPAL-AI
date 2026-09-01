import { auth } from '../../services/auth';
import { eventBus } from '../events/eventBus';
import { worldPresenceEngine } from '../world/worldPresenceEngine';
import { decideCassidyAction } from './cassidyAutonomyEngine';
import { executeCassidyDecision } from './cassidyActionEngine';
import { restoreCassidySession, enterCassidyWorld, returnCassidyHome, noteCassidyInteraction, recordMeaningfulCassidyMoment } from './cassidyRuntimeSessionEngine';
import { getCassidyLifeState } from './cassidyLifeStateEngine';
import { getCassidyPersonality } from './cassidyPersonalityEngine';
import { createCassidyNarrative } from './cassidyNarrativeExperienceEngine';

const AUTONOMY_INTERVAL_MS=90_000;
let stopBridge:(()=>void)|null=null;
export function startCassidyRuntimeBridge():()=>void{
 if(stopBridge)return stopBridge; let active=true; let userId='local-explorer-user'; let lastTickSlot=-1;
 const restore=async(id:string)=>{userId=id||'local-explorer-user';await restoreCassidySession(userId);};
 const runAutonomousMoment=async()=>{if(!active)return;const slot=Math.floor(Date.now()/AUTONOMY_INTERVAL_MS);if(slot===lastTickSlot)return;lastTickSlot=slot;const presence=worldPresenceEngine.current();const life=await getCassidyLifeState(userId);const personality=await getCassidyPersonality(userId);const hour=new Date().getHours();const decision=decideCassidyAction({worldMode:presence.kind==='home'?'home':'journey',worldId:presence.worldId,placeId:presence.kind==='journey'?presence.placeId:undefined,learner:{isExploring:false,needsHelp:false,recentlySucceeded:false},time:{minutesSinceCassidySpoke:life.lastInteractionAt?Math.max(0,(Date.now()-Date.parse(life.lastInteractionAt))/60000):999},learnerIsExploring:false,learnerNeedsHelp:false,learnerRecentlySucceeded:false,minutesSinceCassidySpoke:life.lastInteractionAt?Math.max(0,(Date.now()-Date.parse(life.lastInteractionAt))/60000):999,hour,seed:Date.now(),destinationId:presence.kind==='journey'?presence.placeId:undefined,personality});const action=executeCassidyDecision(decision);if(action.lifeActivity&&['dreaming','storytelling','adventure'].includes(action.lifeActivity)){const narrative=await createCassidyNarrative(userId,action.lifeActivity==='dreaming'?'dream':action.lifeActivity==='storytelling'?'story':'adventure',decision.worldId??'emerald-valley',decision.destinationId,slot);eventBus.emit('cassidy:narrativeCreated',{...narrative,invitation:action.invitation},'cassidy');}
 const meaningful=action.lifeActivity&&['discovering','adventure','storytelling','dreaming','helping','celebrating'].includes(action.lifeActivity);if(meaningful)await recordMeaningfulCassidyMoment(userId,{experienceId:`${slot}:${decision.worldId??'emerald-valley'}:${action.lifeActivity}`,activity:action.lifeActivity as 'discovering'|'adventure'|'storytelling'|'dreaming'|'helping'|'celebrating',summary:action.text,worldId:decision.worldId,destinationId:decision.destinationId}).catch(()=>undefined);};
 const authSubscription=auth.onAuthStateChange(user=>{void restore(user?.id??'local-explorer-user');});
 const offLocation=eventBus.on('world:locationChanged',payload=>{if(!active||payload.userId!==userId)return;const presence=worldPresenceEngine.current();void enterCassidyWorld(userId,presence.worldId,presence.kind==='journey'?presence.placeId:undefined,payload.locationId);});
 const offReturn=eventBus.on('world:returned',payload=>{if(!active||payload.userId!==userId)return;void returnCassidyHome(userId);});
 const offConversation=eventBus.on('conversation:completed',payload=>{if(!active||payload.userId!==userId)return;void noteCassidyInteraction(userId,{worldId:worldPresenceEngine.current().worldId});});
 void restore(userId);void runAutonomousMoment();const timer=setInterval(()=>{void runAutonomousMoment();},AUTONOMY_INTERVAL_MS);
 stopBridge=()=>{active=false;clearInterval(timer);authSubscription.data.subscription.unsubscribe();offLocation();offReturn();offConversation();stopBridge=null;};return stopBridge;
}
export const cassidyRuntimeBridge={start:startCassidyRuntimeBridge};
