import React,{useEffect,useMemo,useState}from'react';
import{Modal,Pressable,Text,View}from'react-native';
import{WorldLearningMomentModal}from'./WorldLearningMomentModal';
import{WorldSceneInteractionLayer}from'../components/WorldSceneInteractionLayer';
import{WorldPlaceHotspot}from'../components/WorldPlaceHotspots';
import{worldLearningScenarioEngine}from'../../../engines/learning/worldLearningScenarioEngine';
import{getDestinationResidents}from'../../../engines/world/destinationResidentEngine';

export function WorldExperienceOverlay({visible,scenarioKey,onClose}:{visible:boolean;scenarioKey:string;onClose:()=>void}){
 const scenario=worldLearningScenarioEngine.all().find(item=>item.id===scenarioKey||item.id==='ja-market-first-purchase');
 const[showResident,setShowResident]=useState(false); const[showInteraction,setShowInteraction]=useState(false); const[selected,setSelected]=useState<WorldPlaceHotspot|null>(null);
 const resident=useMemo(()=>{if(!scenario)return null;const residents=getDestinationResidents(scenario.worldId,scenario.placeId);const goal=scenario.goal.toLowerCase();return residents.find(item=>item.languageNeed.toLowerCase().split(' ').some(word=>word.length>3&&goal.includes(word)))??residents[0]??null;},[scenario?.worldId,scenario?.placeId,scenario?.goal]);
 useEffect(()=>{if(!visible){setShowResident(false);setShowInteraction(false);setSelected(null);return;}setShowResident(false);setShowInteraction(false);setSelected(null);const revealTimer=setTimeout(()=>setShowResident(true),2400);const interactionTimer=setTimeout(()=>setShowInteraction(true),3300);return()=>{clearTimeout(revealTimer);clearTimeout(interactionTimer);};},[visible,scenarioKey]);
 if(!visible||!scenario)return null;
 const select=(hotspot:WorldPlaceHotspot)=>{setSelected(hotspot);if(hotspot.kind==='resident')setShowResident(true);if(hotspot.kind==='discovery')setShowInteraction(true);};
 return <><Modal visible={visible} animationType="fade" transparent statusBarTranslucent><View pointerEvents="auto" className="absolute inset-0 bg-black"><WorldSceneInteractionLayer worldId={scenario.worldId} placeId={scenario.placeId} residentId={resident?.id} showResident={showResident} onExplore={()=>setShowResident(true)} onHotspotSelect={select}/>{selected&&<View className="absolute inset-x-8 bottom-[24%] rounded-[26px] border border-emerald-300/15 bg-slate-950/95 p-4"><Text className="text-[9px] font-bold uppercase tracking-[1.5px] text-emerald-200">{selected.kind==='locked'?'Locked discovery':'World interaction'}</Text><Text className="mt-1 text-lg font-bold text-white">{selected.label}</Text><Text className="mt-1 text-[11px] text-slate-400">{selected.kind==='locked'?'Keep exploring and complete interactions to reveal this place.':'This part of the world has something for you to discover.'}</Text><Pressable onPress={()=>setSelected(null)} className="mt-3 self-start rounded-full bg-emerald-400/15 px-3 py-2"><Text className="text-[10px] font-bold text-emerald-100">Continue exploring</Text></Pressable></View>}</View></Modal><WorldLearningMomentModal visible={showInteraction} scenarioKey={scenarioKey} onClose={onClose}/></>;
}