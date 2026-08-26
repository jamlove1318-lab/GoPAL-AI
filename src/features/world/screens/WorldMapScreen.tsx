import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorldState } from '../../../hooks/useWorldState';
import { LocalStore, CulturalArtifact, RevisitRecord } from '../../../lib/localStore';
import { KnowledgeEngine } from '../../../engines/knowledge/knowledgeEngine';
import { WonderPromptModal } from '../../learning/components/WonderPromptModal';
import { WorldThresholdModal } from '../components/WorldThresholdModal';
import { EmaRitualModal } from '../components/EmaRitualModal';
import {
  MapPin,
  Navigation,
  Sparkles,
  Coffee,
  BookOpen,
  Lamp,
  Trees,
  Lock,
  Eye,
  Compass,
  Heart,
} from 'lucide-react-native';

interface WorldMapScreenProps {
  onStartScenario?: (scenarioKey: string) => void;
}

interface LocationDetail {
  id: string;
  key: string;
  name: string;
  description: string;
  npcName: string;
  npcRole: string;
  familiarity_stage: 'personal' | 'familiar' | 'discovered' | 'unknown';
  scenarioKey?: string;
  icon: string;
}

const LOCATION_METADATA: Record<
  string,
  { description: string; npcName: string; npcRole: string; scenarioKey?: string; icon: string }
> = {
  study_room: {
    description: 'Your cozy personal hub. Desk, growing bonsai plant, radio, and notes.',
    npcName: 'Cassidy',
    npcRole: 'Companion & Guide',
    icon: 'study',
  },
  cozy_cafe: {
    description: 'A warm café with gentle rain sounds, aroma of matcha and roasted coffee.',
    npcName: 'Ren',
    npcRole: 'Friendly Barista',
    scenarioKey: 'scen-cafe-order',
    icon: 'cafe',
  },
  whispering_library: {
    description: 'Silent archives filled with ancient scrolls and cultural manuscripts.',
    npcName: 'Emi',
    npcRole: 'Wisdom Keeper & Historian',
    scenarioKey: 'scen-library-inquiry',
    icon: 'library',
  },
  lantern_market: {
    description: 'Bustling night alley lit by red lanterns with street food vendors.',
    npcName: 'Kenji',
    npcRole: 'Stall Master',
    scenarioKey: 'scen-market-browse',
    icon: 'market',
  },
  zen_garden: {
    description: 'Tranquil raked gravel and bamboo groves for deep reflection.',
    npcName: 'Master Jin',
    npcRole: 'Garden Monk',
    icon: 'garden',
  },
};

export function WorldMapScreen({ onStartScenario }: WorldMapScreenProps) {
  const { state, changeLocation, worldEngine } = useWorldState();
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [artifacts, setArtifacts] = useState<CulturalArtifact[]>([]);
  const [revisitStats, setRevisitStats] = useState<Record<string, RevisitRecord>>({});
  const [revisitNotes, setRevisitNotes] = useState<Record<string, string | null>>({});
  const [gatedByLoc, setGatedByLoc] = useState<Record<string, number>>({});

  // Modals
  const [selectedArtifact, setSelectedArtifact] = useState<CulturalArtifact | null>(null);
  const [thresholdVisible, setThresholdVisible] = useState(false);
  const [pendingTargetLocation, setPendingTargetLocation] = useState<LocationDetail | null>(null);
  const [showEmaModal, setShowEmaModal] = useState(false);

  const loadData = async () => {
    const rawLocations = await worldEngine.listLocations('world-emerald-valley');
    const arts = await LocalStore.getCulturalArtifacts();
    const stats = await LocalStore.getRevisitStats();

    setArtifacts(arts);
    setRevisitStats(stats);

    // Wave 5Y: Revisit Difference — subtle, deterministic changes per location.
    const notes: Record<string, string | null> = {};
    for (const loc of rawLocations) {
      const diff = await worldEngine.getRevisitDifference(loc.key);
      notes[loc.key] = diff.note;
    }
    setRevisitNotes(notes);

    // Wave 5E/5Y: Knowledge-Gated Progressive Revelation — concepts below the
    // mastery gate remain "unreadable" in the world until verified learning reveals them.
    const nodes = await LocalStore.getKnowledgeNodes();
    const gated: Record<string, number> = {};
    for (const n of nodes) {
      if (n.masteryLevel < 40) gated[n.locationKey] = (gated[n.locationKey] || 0) + 1;
    }
    setGatedByLoc(gated);

    const merged: LocationDetail[] = rawLocations.map((loc) => {
      const meta = LOCATION_METADATA[loc.key] || {
        description: 'An unexplored region in the valley.',
        npcName: 'Resident',
        npcRole: 'Local',
        icon: 'map',
      };
      return {
        id: loc.id,
        key: loc.key,
        name: loc.name,
        description: meta.description,
        npcName: meta.npcName,
        npcRole: meta.npcRole,
        familiarity_stage: loc.familiarity_stage as LocationDetail['familiarity_stage'],
        scenarioKey: meta.scenarioKey,
        icon: meta.icon,
      };
    });
    setLocations(merged);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTravelRequest = (targetLoc: LocationDetail) => {
    setPendingTargetLocation(targetLoc);
    setThresholdVisible(true);
  };

  const handleThresholdComplete = async () => {
    if (!pendingTargetLocation) return;
    await changeLocation(pendingTargetLocation.id);
    await LocalStore.recordLocationVisit(pendingTargetLocation.key);
    setThresholdVisible(false);
    setPendingTargetLocation(null);
    await loadData();
  };

  const getFamiliarityLabel = (stage: string) => {
    switch (stage) {
      case 'personal':
        return { label: 'Personal Sanctuary', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/40' };
      case 'familiar':
        return { label: 'Familiar Ground', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/40' };
      case 'discovered':
        return { label: 'Discovered', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/40' };
      default:
        return { label: 'Undiscovered Lore', color: 'text-slate-400', bg: 'bg-slate-900 border-slate-700' };
    }
  };

  const getLocationIcon = (key: string) => {
    switch (key) {
      case 'study_room':
        return '📚';
      case 'cozy_cafe':
        return '☕';
      case 'whispering_library':
        return '📜';
      case 'lantern_market':
        return '🏮';
      case 'zen_garden':
        return '🎋';
      default:
        return '📍';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Emerald Valley World Map
            </Text>
            <Text className="text-2xl font-bold text-white">Locations & Lore</Text>
          </View>
          <View className="rounded-full bg-slate-800/80 px-3 py-1 border border-slate-700">
            <Text className="text-xs font-medium text-slate-300">
              {locations.length} Known Regions
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-xs leading-relaxed text-slate-400">
          Explore living locations across Emerald Valley. Each place has its own resident NPCs, atmosphere, and cultural artifacts.
        </Text>

        {/* Global Ema Wish Hanging Banner */}
        <Pressable
          onPress={() => setShowEmaModal(true)}
          className="mt-4 flex-row items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-950/20 p-3.5 active:bg-amber-950/40"
        >
          <View className="flex-row items-center gap-2.5">
            <Text className="text-2xl">🎋</Text>
            <View>
              <Text className="text-xs font-bold text-amber-300">Ema Wish Hanging (絵馬)</Text>
              <Text className="text-[10px] text-slate-300">Inscribe a learning goal at Zen Garden</Text>
            </View>
          </View>
          <View className="rounded-full bg-amber-500/20 px-2.5 py-1 border border-amber-500/40">
            <Text className="text-[10px] font-bold text-amber-300">Ritual ✨</Text>
          </View>
        </Pressable>

        {/* Location Cards */}
        <View className="mt-4 gap-4">
          {locations.map((loc) => {
            const isCurrent = state?.location?.id === loc.id;
            const isLocked = loc.familiarity_stage === 'unknown';
            const fam = getFamiliarityLabel(loc.familiarity_stage);
            const locArtifacts = artifacts.filter((a) => a.locationKey === loc.key);
            const visits = revisitStats[loc.key]?.count || 0;

            return (
              <View
                key={loc.id}
                className={`rounded-2xl border p-4 shadow-lg ${
                  isCurrent
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : isLocked
                    ? 'border-slate-800/40 bg-slate-900/40 opacity-70'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                {/* Header info */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700">
                      <Text className="text-2xl">{getLocationIcon(loc.key)}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-white">{loc.name}</Text>
                      <Text className="text-xs text-indigo-300">
                        {loc.npcName} · {loc.npcRole}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end gap-1">
                    <View className={`rounded-full px-2.5 py-0.5 border ${fam.bg}`}>
                      <Text className={`text-[10px] font-bold ${fam.color}`}>{fam.label}</Text>
                    </View>
                    {visits > 0 && (
                      <Text className="text-[9px] text-slate-500 font-medium">
                        Visited {visits} {visits === 1 ? 'time' : 'times'}
                      </Text>
                    )}
                  </View>
                </View>

                <Text className="mt-3 text-xs leading-relaxed text-slate-300">
                  {loc.description}
                </Text>

                {/* Wave 5Y: Revisit Difference — the place stays recognizable but changes subtly. */}
                {revisitNotes[loc.key] && (
                  <View className="mt-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 p-2.5">
                    <Text className="text-[11px] italic text-indigo-200">“{revisitNotes[loc.key]}”</Text>
                  </View>
                )}

                {/* Wave 5E/5Y: Knowledge-Gated Progressive Revelation */}
                {gatedByLoc[loc.key] > 0 && (
                  <View className="mt-2 flex-row items-center gap-1.5 rounded-xl bg-slate-800/60 border border-slate-700 p-2.5">
                    <Eye size={12} color="#94a3b8" />
                    <Text className="text-[10px] text-slate-400">
                      A sign here is still unreadable — keep learning to reveal {gatedByLoc[loc.key]} hidden {gatedByLoc[loc.key] === 1 ? 'concept' : 'concepts'}.
                    </Text>
                  </View>
                )}

                {/* Cultural Artifacts & Wonder Prompts */}
                {locArtifacts.length > 0 && (
                  <View className="mt-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="flex-row items-center gap-1.5">
                        <Sparkles size={12} color="#fbbf24" />
                        <Text className="text-[11px] font-bold text-amber-300">
                          Cultural Keepsakes & Wonder Prompts (Blueprint #48)
                        </Text>
                      </View>
                      <Text className="text-[10px] text-slate-500">Tap to inspect</Text>
                    </View>

                    <View className="gap-1.5">
                      {locArtifacts.map((art) => (
                        <Pressable
                          key={art.id}
                          onPress={() => setSelectedArtifact(art)}
                          className="flex-row items-center justify-between rounded-lg bg-amber-950/30 p-2 border border-amber-500/20 active:bg-amber-950/50"
                        >
                          <Text className="text-[10px] font-bold text-amber-200">
                            {art.name} ({art.japaneseName})
                          </Text>
                          <Text className="text-[9px] text-amber-400 font-semibold">Inspect 🔍</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Actions: Enter / Travel / Roleplay */}
                <View className="mt-3.5 flex-row gap-2">
                  {!isCurrent && !isLocked && (
                    <Pressable
                      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 active:bg-slate-700"
                      onPress={() => handleTravelRequest(loc)}
                    >
                      <Compass size={14} color="#38bdf8" />
                      <Text className="text-xs font-semibold text-slate-200">Travel Here</Text>
                    </Pressable>
                  )}

                  {loc.scenarioKey && (
                    <Pressable
                      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 active:bg-emerald-600"
                      onPress={() => onStartScenario?.(loc.scenarioKey!)}
                    >
                      <Sparkles size={14} color="#064e3b" />
                      <Text className="text-xs font-bold text-emerald-950">
                        Practice Dialogue with {loc.npcName}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* World Threshold Transition Modal (Wave 5A, 5B) */}
      <WorldThresholdModal
        visible={thresholdVisible}
        fromLocationName={state?.location?.name ?? 'Current Location'}
        toLocationName={pendingTargetLocation?.name ?? 'Destination'}
        toLocationKey={pendingTargetLocation?.key ?? 'study_room'}
        onTransitionComplete={handleThresholdComplete}
      />

      {/* Cultural Wonder Prompt Modal (Wave 5E, 5F) */}
      <WonderPromptModal
        visible={selectedArtifact !== null}
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />

      {/* Ema Wish Ritual Modal */}
      <EmaRitualModal
        visible={showEmaModal}
        onClose={() => setShowEmaModal(false)}
      />
    </SafeAreaView>
  );
}
