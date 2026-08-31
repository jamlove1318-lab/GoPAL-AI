import React,{useMemo,useState}from'react';
import{Modal,Pressable,Text,View}from'react-native';
import{WorldLearningMomentModal}from'./WorldLearningMomentModal';
import{WorldSceneInteractionLayer}from'../components/WorldSceneInteractionLayer';
import{WorldPlaceHotspot}from'../components/WorldPlaceHotspots';
import{worldLearningScenarioEngine}from'../../../engines/learning/worldLearningScenarioEngine';
import{getDestinationResidents}from'../../../engines/world/destinationResidentEngine';
import{worldHotspotExperienceEngine}from'../../../engines/world/worldHotspotExperienceEngine';

export function WorldExperienceOverlay({visible,scenarioKey,onClose}:{visible:boolean;scenarioKey:string;onClose:()=>void}){
 const scenario=worldLearningScenarioEngine.all().find(item=>item.id===scenarioKey||item.id==='ja-market-first-purchase');
 const[showResident,setShowResident]=useState(false); const[showInteraction,setShowInteraction]=useState(false); const[selected,setSelected]=useState<WorldPlaceHotspot|null>(null);
 const resident=useMemo(()=>{if(!scenario)return null;const residents=getDestinationResidents(scenario.worldId,scenario.placeId);const goal=scenario.goal.toLowerCase();return residents.find(item=>item.languageNeed.toLowerCase().split(' ').some(word=>word.length>3&&goal.includes(word)))??residents[0]??null;},[scenario?.worldId,scenario?.placeId,scenario?.goal]);
 if(!visible||!scenario)return null;
 const select=(hotspot:WorldPlaceHotspot)=>{setSelected(hotspot);const experience=worldHotspotExperienceEngine.resolve(hotspot);if(experience.mode==='resident-encounter')setShowResident(true);if(experience.mode==='learning-discovery')setShowInteraction(true);};
 return <><Modal visible={visible} animationType="fade" transparent statusBarTranslucent><View pointerEvents="auto" className="absolute inset-0 bg-black"><WorldSceneInteractionLayer worldId={scenario.worldId} placeId={scenario.placeId} residentId={resident?.id} showResident={showResident} onExplore={()=>setShowResident(true)} onHotspotSelect={select}/>{selected&&<View className="absolute inset-x-8 bottom-[24%] rounded-[26px] border border-emerald-300/15 bg-slate-950/95 p-4"><Text className="text-[9px] font-bold uppercase tracking-[1.5px] text-emerald-200">{worldHotspotExperienceEngine.resolve(selected).mode.replace('-', ' ')}</Text><Text className="mt-1 text-lg font-bold text-white">{selected.label}</Text><Text className="mt-1 text-[11px] text-slate-400">{selected.kind==='locked'?'This discovery is still hidden. Complete more interactions to reveal it.':selected.kind==='resident'?'You noticed someone in the world. Tap the encounter to begin.':'You found something in this location. Keep exploring to uncover what it means.'}</Text><Pressable onPress={()=>setSelected(null)} className="mt-3 self-start rounded-full bg-emerald-400/15 px-3 py-2"><Text className="text-[10px] font-bold text-emerald-100">Keep exploring</Text></Pressable></View>}</View></Modal><WorldLearningMomentModal visible={showInteraction} scenarioKey={scenarioKey} onClose={onClose}/></>;
}