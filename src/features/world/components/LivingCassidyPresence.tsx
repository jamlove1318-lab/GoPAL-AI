import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MessageCircle, X } from 'lucide-react-native';
import { CassidyCharacter } from '../../../components/CassidyCharacter';
import { CassidyPresenceContext, resolveCassidyWorldPresence } from '../../../engines/cassidy/cassidyWorldPresenceEngine';
import { resolveCassidySceneAnchor, type CassidyPhysicalAnchor } from '../../../engines/cassidy/cassidySceneAnchorEngine';
import type { CassidyLifeActivity } from '../../../engines/cassidy/cassidyLifeEngine';
import { cassidyLifeStateEngine } from '../../../engines/cassidy/cassidyLifeStateEngine';
import { getWorldPlaceHotspots } from './worldPlaceHotspotCatalog';
import { eventBus } from '../../../engines/events/eventBus';

interface Props { languageCode?:string; context?:CassidyPresenceContext; locationLabel?:string; placeId?:string; }
const LIFE_LINES:Partial<Record<CassidyLifeActivity,string>>={
 wandering:'I was just wandering around. You never know what you might find.', cafe:'I found a nice little café. I think I might stay here for a while.', reading:'I found a quiet place to read. It is nice to slow down sometimes.', 'watching-rain':'Listen to the rain for a moment. We do not have to rush anywhere.', stargazing:'The sky is beautiful tonight. I could stay here for hours.', dreaming:'I had the strangest dream. I will tell you about it later.', storytelling:'I have a story for you, if you feel like listening.', adventure:'I discovered something interesting. Want to see where it leads?', helping:'I noticed you might need a little help.', resting:'I am taking a quiet moment. Sometimes doing nothing is exactly right.', discovering:'I noticed something I had never seen before.', celebrating:'I am still enjoying what we accomplished together.'
};
function physicalAnchorFor(placeId:string|undefined,activity:CassidyLifeActivity|undefined):CassidyPhysicalAnchor|undefined{
 if(!placeId||!activity)return undefined;
 const hotspots=getWorldPlaceHotspots(placeId);
 const preferredKind=activity==='cafe'?'discovery':activity==='wandering'||activity==='adventure'?'path':activity==='storytelling'||activity==='helping'?'resident':'landmark';
 const hotspot=hotspots.find(h=>h.kind===preferredKind)||hotspots.find(h=>h.kind!=='locked'&&h.x!==undefined&&h.y!==undefined);
 return hotspot&&hotspot.x!==undefined&&hotspot.y!==undefined?{id:hotspot.id,x:hotspot.x,y:hotspot.y,facing:hotspot.x>55?'left':'right',activity}:undefined;
}

/** Cassidy belongs inside the current world scene. Her autonomous life is persisted and positioned against existing world hotspots. */
export function LivingCassidyPresence({languageCode='ja',context='exploring',locationLabel,placeId}:Props){
 const [lifeActivity,setLifeActivity]=useState<CassidyLifeActivity|undefined>(); const [invitation,setInvitation]=useState(false);
 useEffect(()=>{let active=true; void cassidyLifeStateEngine.get().then(state=>{if(!active)return;if(state.destinationId&&placeId&&state.destinationId!==placeId)return;setLifeActivity(state.activity);setInvitation(Boolean(state.lastInvitationAt));}); const unsubscribe=eventBus.on('cassidy:autonomyActed',payload=>{if(payload.destinationId&&placeId&&payload.destinationId!==placeId)return;if(payload.lifeActivity)setLifeActivity(payload.lifeActivity as CassidyLifeActivity);else if(payload.action!=='live')setLifeActivity(undefined);setInvitation(Boolean(payload.invitation));}); return()=>{active=false;unsubscribe();};},[placeId]);
 const canUseAutonomousLife=context==='exploring'||context==='quiet'; const effectiveContext:CassidyPresenceContext=canUseAutonomousLife&&lifeActivity?'life':context;
 const presence=useMemo(()=>resolveCassidyWorldPresence(languageCode,effectiveContext,lifeActivity),[languageCode,effectiveContext,lifeActivity]);
 const physicalAnchor=useMemo(()=>physicalAnchorFor(placeId,lifeActivity),[placeId,lifeActivity]);
 const anchor=useMemo(()=>resolveCassidySceneAnchor(languageCode,effectiveContext,lifeActivity,physicalAnchor),[languageCode,effectiveContext,lifeActivity,physicalAnchor]);
 const [open,setOpen]=useState(context==='confused'||context==='learning'||context==='success');
 useEffect(()=>{if(context==='confused'||context==='learning'||context==='success')setOpen(true);},[context,languageCode]);
 if(!presence.visible)return null;
 const speaking=open&&(context==='learning'||context==='confused'||context==='success'||lifeActivity==='storytelling'||lifeActivity==='helping');
 const flip=anchor.facing==='left'?[{scaleX:-1}]:undefined; const line=LIFE_LINES[lifeActivity??'']??presence.line;
 const canShowLifeMessage=Boolean(lifeActivity&&(invitation||context==='exploring'||context==='quiet'));
 return <View className="absolute z-[35] items-center" style={{left:anchor.left,top:anchor.top}} pointerEvents="box-none">
  {open&&line&&(canShowLifeMessage||!lifeActivity)&&<View className="mb-1 w-56 rounded-[22px] border border-emerald-200/15 bg-slate-950/92 px-3 py-2 shadow-xl"><Pressable accessibilityLabel="Close Cassidy message" onPress={()=>setOpen(false)} className="absolute right-2 top-2 h-6 w-6 items-center justify-center"><X size={13} color="#94a3b8"/></Pressable><Text className="pr-6 text-[9px] font-bold uppercase tracking-[1.6px] text-emerald-300">Cassidy{locationLabel?` · ${locationLabel}`:''}</Text><Text className="mt-1 text-xs leading-5 text-slate-100">{line}</Text></View>}
  <Pressable accessibilityRole="button" accessibilityLabel={invitation?'Join Cassidy':'Talk with Cassidy'} onPress={()=>setOpen(value=>!value)} className="items-center"><View className="rounded-full border border-emerald-200/10 bg-slate-950/10 px-1 pt-1"><View style={{transform:flip}}><CassidyCharacter height={anchor.height} action={anchor.action} speaking={speaking} expression={presence.mood}/></View></View>{!open&&context!=='quiet'&&<View className="absolute -right-2 top-1 h-7 w-7 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-500/20"><MessageCircle size={13} color="#a7f3d0"/></View>}</Pressable>
 </View>;
}
