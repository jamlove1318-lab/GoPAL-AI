import React,{useCallback,useEffect,useState}from'react';
import{SafeAreaView,Text}from'react-native';
import{worldPresenceEngine}from'../../../engines/world/worldPresenceEngine';
import{resolveLanguageWorld}from'../../../engines/world/languageWorldEngine';
import{getLanguageWorldLocation}from'../data/livingLanguageWorldLocations';
import{worldDiscoveryProgressionEngine,type WorldDiscoveryNode}from'../../../engines/world/worldDiscoveryProgressionEngine';
import{LanguageWorldPhysicalScreen}from'../components/LanguageWorldPhysicalScreen';

interface Props{onStartScenario?:(scenarioKey:string)=>void;onHome?:()=>void;}

/**
 * Bridge from the legacy journey/world IDs into the canonical physical language-world catalog.
 * The legacy journey engine remains intact for compatibility, while Japanese/French locations
 * can now be real or fictional canonical locations rendered by the physical world runtime.
 */
export function JourneyWorldScreen({onStartScenario,onHome}:Props){
 const[presence,setPresence]=useState(worldPresenceEngine.current());
 const[nodes,setNodes]=useState<WorldDiscoveryNode[]>([]);
 const[loading,setLoading]=useState(true);
 const refresh=useCallback(async(worldId:'ja'|'es'|'fr'|'ko')=>{setLoading(true);try{setNodes(await worldDiscoveryProgressionEngine.get(worldId));}finally{setLoading(false);}},[]);
 useEffect(()=>{let alive=true;worldPresenceEngine.hydrate().then(next=>{if(!alive)return;setPresence(next);if(next.kind==='journey')void refresh(next.worldId);}).catch(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[refresh]);
 const world=presence.kind==='journey'?resolveLanguageWorld(presence.worldId):null;
 const canonicalWorldId=presence.kind==='journey'?(presence.worldId==='ja'?'japanese':presence.worldId==='fr'?'french':null):null;
 const canonicalLocation=presence.kind==='journey'&&canonicalWorldId?getLanguageWorldLocation(presence.placeId):null;
 const legacyDestination=presence.kind==='journey'&&world?world.places.find(place=>place.id===presence.placeId):null;
 const destination=legacyDestination??(canonicalLocation?{id:canonicalLocation.id,name:canonicalLocation.name,city:canonicalLocation.city??canonicalLocation.country,country:canonicalLocation.country,realWorldLocation:[canonicalLocation.city,canonicalLocation.country].filter(Boolean).join(', '),purpose:canonicalLocation.description,landmarks:canonicalLocation.kind==='real'?['Real-world location']:['Fictional learning location'],hiddenGems:canonicalLocation.experiences.includes('quest')?['Contextual learning encounter']:[]}:null);
 if(presence.kind!=='journey'||!world||!destination)return <SafeAreaView className="flex-1 items-center justify-center bg-slate-950"><Text className="text-xs text-slate-500">Returning to Emerald Valley…</Text></SafeAreaView>;
 if(loading)return <SafeAreaView className="flex-1 items-center justify-center bg-slate-950"><Text className="text-xs text-slate-500">Building the living destination…</Text></SafeAreaView>;
 return <LanguageWorldPhysicalScreen place={destination} nodes={nodes} onStartScenario={onStartScenario} onHome={()=>onHome?.()}/>;
}
