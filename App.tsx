import './global.css';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/features/home/screens/HomeScreen';
import { StudyScreen } from './src/features/study/screens/StudyScreen';
import { LivingValleyScreen } from './src/features/world/screens/LivingValleyScreen';
import { LivingJourneyScreen } from './src/features/journey/screens/LivingJourneyScreen';
import { MemoryMuseumScreen } from './src/features/journey/screens/MemoryMuseumScreen';
import { CharacterScreen } from './src/features/characters/screens/CharacterScreen';
import { SettingsScreen } from './src/features/settings/screens/SettingsScreen';
import { LearningScenarioModal } from './src/features/learning/screens/LearningScenarioModal';
import { WorldLearningMomentModal, isWorldLearningScenario } from './src/features/learning/screens/WorldLearningMomentModal';
import { CassidyHomeScreen } from './src/features/cassidy/screens/CassidyHomeScreen';
import { WorldAtmosphere, WorldAtmospherePhase } from './src/features/world/components/WorldAtmosphere';
import { LivingCompanion } from './src/components/LivingCompanion';
import { LivingWorldPulse } from './src/components/LivingWorldPulse';
import { AmbientBackground } from './src/components/AmbientBackground';
import { loadCassidySnapshot, worldIntensity, CassidySnapshot } from './src/characters/cassidyContext';
import { resolveTimeOfDay } from './src/lib/time';
import { startLivingWorldReactor } from './src/engines';
import { Home, BookOpen, MapPin, Sparkles, Heart, Image as ImageIcon, Users, Settings as SettingsIcon } from 'lucide-react-native';

type TabKey = 'home' | 'cassidy' | 'study' | 'world' | 'journey' | 'museum' | 'characters' | 'settings';
const PRIMARY_TABS: Array<{ key: TabKey; label: string; Icon: typeof Home }> = [{ key: 'world', label: 'Explore', Icon: MapPin }, { key: 'journey', label: 'Journey', Icon: Sparkles }, { key: 'cassidy', label: 'Cassidy', Icon: Heart }, { key: 'study', label: 'Learn', Icon: BookOpen }, { key: 'home', label: 'Sanctuary', Icon: Home }];
function currentAtmospherePhase(): WorldAtmospherePhase { switch (resolveTimeOfDay()) { case 'morning': return new Date().getHours() < 7 ? 'dawn' : 'morning'; case 'afternoon': return 'afternoon'; case 'evening': return 'dusk'; default: return 'night'; } }
export default function App() {
 const [activeTab,setActiveTab]=useState<TabKey>('world'); const [moreOpen,setMoreOpen]=useState(false); const [snapshot,setSnapshot]=useState<CassidySnapshot|null>(null); const [scenarioState,setScenarioState]=useState({visible:false,scenarioKey:'scen-cafe-order'}); const [atmospherePhase,setAtmospherePhase]=useState<WorldAtmospherePhase>(currentAtmospherePhase); const screenMotion=useRef(new Animated.Value(1)).current;
 useEffect(()=>{const stop=startLivingWorldReactor();return stop;},[]); useEffect(()=>{loadCassidySnapshot().then(setSnapshot);},[activeTab]); useEffect(()=>{screenMotion.setValue(0);Animated.timing(screenMotion,{toValue:1,duration:320,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();},[activeTab,screenMotion]); useEffect(()=>{const sync=()=>setAtmospherePhase(currentAtmospherePhase());sync();const t=setInterval(sync,60000);return()=>clearInterval(t);},[]);
 const handleStartScenario=(scenarioKey:string)=>setScenarioState({visible:true,scenarioKey}); const handleCloseScenario=()=>{setScenarioState(p=>({...p,visible:false}));loadCassidySnapshot().then(setSnapshot);}; const handleNavigate=(tab:string)=>{const target=tab==='map'?'world':tab;if(['home','cassidy','study','world','journey','museum','characters','settings'].includes(target)){setActiveTab(target as TabKey);setMoreOpen(false);}};
 const render=()=>{switch(activeTab){case'home':return <HomeScreen snapshot={snapshot} onNavigate={handleNavigate} onStartScenario={handleStartScenario}/>;case'cassidy':return <CassidyHomeScreen/>;case'study':return <StudyScreen/>;case'world':return <LivingValleyScreen onStartScenario={handleStartScenario}/>;case'journey':return <LivingJourneyScreen/>;case'museum':return <MemoryMuseumScreen/>;case'characters':return <CharacterScreen/>;case'settings':return <SettingsScreen/>;default:return <LivingValleyScreen onStartScenario={handleStartScenario}/>;}};
 const worldScenario=isWorldLearningScenario(scenarioState.scenarioKey);
 return <SafeAreaProvider><View className="flex-1 bg-slate-950"><StatusBar style="light"/><AmbientBackground intensity={worldIntensity(snapshot)}/><WorldAtmosphere phase={atmospherePhase} intensity={Math.max(.55,worldIntensity(snapshot))}/><LivingWorldPulse/><Animated.View className="flex-1" style={{opacity:screenMotion,transform:[{translateY:screenMotion.interpolate({inputRange:[0,1],outputRange:[8,0]})}]}}>{render()}</Animated.View>{moreOpen&&<Pressable className="absolute inset-0 bg-slate-950/45" onPress={()=>setMoreOpen(false)}><View className="absolute bottom-20 right-3 w-52 rounded-3xl border border-slate-700/70 bg-slate-900/95 p-2"><Text className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">More of your world</Text><MoreItem icon={<ImageIcon size={18} color="#a7f3d0"/>} label="Memory Museum" onPress={()=>handleNavigate('museum')}/><MoreItem icon={<Users size={18} color="#a7f3d0"/>} label="People" onPress={()=>handleNavigate('characters')}/><MoreItem icon={<SettingsIcon size={18} color="#a7f3d0"/>} label="Settings" onPress={()=>handleNavigate('settings')}/></View></Pressable>}<View className="mx-3 mb-2 flex-row items-center justify-around rounded-3xl border border-slate-800/60 bg-slate-900/80 px-1.5 py-2">{PRIMARY_TABS.map(({key,label,Icon})=>{const selected=activeTab===key&&!moreOpen;return <Pressable key={key} onPress={()=>{setActiveTab(key);setMoreOpen(false);}} className="items-center justify-center px-1 py-1"><View className={`items-center justify-center rounded-full px-3 py-1.5 ${selected?'bg-emerald-500/15':''}`}><Icon size={19} color={selected?'#34d399':'#64748b'} strokeWidth={selected?2.4:1.8}/><Text className={`mt-1 text-[10px] font-medium ${selected?'font-bold text-emerald-400':'text-slate-500'}`}>{label}</Text></View></Pressable>;})}</View>{activeTab!=='cassidy'&&!moreOpen&&<LivingCompanion activeTab={activeTab} snapshot={snapshot} onTap={()=>setActiveTab('cassidy')}/>} {worldScenario?<WorldLearningMomentModal visible={scenarioState.visible} scenarioKey={scenarioState.scenarioKey} onClose={handleCloseScenario}/>:<LearningScenarioModal visible={scenarioState.visible} scenarioKey={scenarioState.scenarioKey} onClose={handleCloseScenario}/>}</View></SafeAreaProvider>;
}
function MoreItem({icon,label,onPress}:{icon:React.ReactNode;label:string;onPress:()=>void}){return <Pressable onPress={onPress} className="flex-row items-center rounded-2xl px-3 py-3 active:bg-white/10"><View>{icon}</View><Text className="ml-3 text-sm text-slate-200">{label}</Text></Pressable>;}
