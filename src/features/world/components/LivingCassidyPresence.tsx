import React,{useEffect,useMemo,useState}from'react';
import{Pressable,View,type DimensionValue}from'react-native';
import{CassidyCharacter}from'../../../components/CassidyCharacter';
import{CassidyPresenceContext,resolveCassidyWorldPresence}from'../../../engines/cassidy/cassidyWorldPresenceEngine';
import{resolveCassidySceneAnchor,type CassidyPhysicalAnchor}from'../../../engines/cassidy/cassidySceneAnchorEngine';
import type{CassidyLifeActivity}from'../../../engines/cassidy/cassidyLifeEngine';
import{cassidyLifeStateEngine}from'../../../engines/cassidy/cassidyLifeStateEngine';
import{cassidyPresenceDirectorEngine}from'../../../engines/cassidy/cassidyPresenceDirectorEngine';
import{resolveLanguageWorld}from'../../../engines/world/languageWorldEngine';
import{getWorldPlaceHotspots}from'../../learning/components/worldPlaceHotspotCatalog';
import{eventBus}from'../../../engines/events/eventBus';

interface Props{languageCode?:string;context?:CassidyPresenceContext;locationLabel?:string;placeId?:string;}

function physicalAnchorFor(placeId:string|undefined,activity:CassidyLifeActivity|undefined):CassidyPhysicalAnchor|undefined{
 if(!placeId||!activity)return undefined;
 const hotspots=getWorldPlaceHotspots(placeId);
 const preferredKind=activity==='cafe'?'discovery':activity==='wandering'||activity==='adventure'?'path':activity==='storytelling'||activity==='helping'?'resident':'landmark';
 const hotspot=hotspots.find(h=>h.kind===preferredKind)||hotspots.find(h=>h.kind!=='locked'&&h.x!==undefined&&h.y!==undefined);
 return hotspot&&hotspot.x!==undefined&&hotspot.y!==undefined?{id:hotspot.id,x:hotspot.x,y:hotspot.y,facing:hotspot.x>55?'left':'right',activity}:undefined;
}

/** Cassidy is a physical resident of the world, not a floating UI companion card. */
export function LivingCassidyPresence({languageCode='ja',context='exploring',placeId}:Props){
 const[lifeActivity,setLifeActivity]=useState<CassidyLifeActivity|undefined>();
 const[invitation,setInvitation]=useState(false);
 useEffect(()=>{
  let active=true;
  void cassidyLifeStateEngine.get().then(state=>{
   if(!active)return;
   if(state.destinationId&&placeId&&state.destinationId!==placeId)return;
   setLifeActivity(state.activity);
   setInvitation(Boolean(state.lastInvitationAt&&Date.now()-Date.parse(state.lastInvitationAt)<30*60*1000));
  });
  const unsubscribe=eventBus.on('cassidy:autonomyActed',payload=>{
   if(payload.destinationId&&placeId&&payload.destinationId!==placeId)return;
   if(payload.lifeActivity)setLifeActivity(payload.lifeActivity as CassidyLifeActivity);
   else if(payload.action!=='live')setLifeActivity(undefined);
   setInvitation(Boolean(payload.invitation));
  });
  return()=>{active=false;unsubscribe();};
 },[placeId]);
 useEffect(()=>{
  if(context!=='exploring'&&context!=='quiet')return;
  let active=true;
  const refresh=async()=>{
   try{
    const worldId=languageCode==='home'?'emerald-valley':resolveLanguageWorld(languageCode).id;
    const decision=await cassidyPresenceDirectorEngine.decide({worldId,destinationId:placeId,allowStory:true,allowAdventure:true});
    if(!active)return;
    setLifeActivity(decision.activity);setInvitation(decision.invitation);
   }catch{if(active)setInvitation(false);}
  };
  void refresh();
  const timer=setInterval(()=>void refresh(),5*60*1000);
  return()=>{active=false;clearInterval(timer);};
 },[context,languageCode,placeId]);
 const canUseAutonomousLife=context==='exploring'||context==='quiet';
 const effectiveContext:CassidyPresenceContext=canUseAutonomousLife&&lifeActivity?'life':context;
 const presence=useMemo(()=>resolveCassidyWorldPresence(languageCode,effectiveContext,lifeActivity),[languageCode,effectiveContext,lifeActivity]);
 const physicalAnchor=useMemo(()=>physicalAnchorFor(placeId,lifeActivity),[placeId,lifeActivity]);
 const anchor=useMemo(()=>resolveCassidySceneAnchor(languageCode,effectiveContext,lifeActivity,physicalAnchor),[languageCode,effectiveContext,lifeActivity,physicalAnchor]);
 if(!presence.visible)return null;
 const flip=anchor.facing==='left'?[{scaleX:-1}]:undefined;
 return <Pressable accessibilityRole="button" accessibilityLabel={invitation?'Cassidy is inviting you':'Cassidy is in the world'} onPress={()=>eventBus.emit('cassidy:worldPresenceTapped',{activity:lifeActivity},'world')} className="absolute z-[35] items-center" style={{left:anchor.left as DimensionValue,top:anchor.top as DimensionValue}}>
  <View style={{transform:flip}}>
   <CassidyCharacter height={anchor.height} action={anchor.action} speaking={false} expression={presence.mood}/>
  </View>
  {invitation&&<View pointerEvents="none" className="absolute -right-1 top-2 h-2 w-2 rounded-full bg-emerald-300"/>}
 </Pressable>;
}
