import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Sparkles, BookMarked, CalendarHeart, GitBranch, Gift, ListMusic, Newspaper, Layers } from 'lucide-react-native';
import { KnowledgeEngine } from '../../../engines/knowledge/knowledgeEngine';
import { JourneyEngine } from '../../../engines/journey/journeyEngine';
import { ExperienceDirector } from '../../../engines/director/experienceDirector';
import { WorldEngine } from '../../../engines/world/worldEngine';
import { LocalStore } from '../../../lib/localStore';
import { WaveStore } from '../../../lib/waveStore';

type Tab = 'echoes' | 'library' | 'traditions' | 'threads' | 'souvenirs' | 'playlists' | 'editorial' | 'story' | 'decisions';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function DiscoveriesModal({ visible, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('echoes');

  const [learningEchoes, setLearningEchoes] = useState<any[]>([]);
  const [worldEchoes, setWorldEchoes] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [traditions, setTraditions] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [distilled, setDistilled] = useState<any[]>([]);
  const [souvenirs, setSouvenirs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [editorial, setEditorial] = useState<any[]>([]);
  const [storyLayers, setStoryLayers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);

  const [playlistTitle, setPlaylistTitle] = useState('');

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLearningEchoes(await KnowledgeEngine.getLearningEchoes());
      setWorldEchoes(await KnowledgeEngine.getWorldEchoes());
      setLibrary(await WaveStore.getLibrary());
      setTraditions(await WaveStore.getTraditions());
      setThreads(await new JourneyEngine().getMemoryThreads());
      setDistilled(await new JourneyEngine().distillMemories('local-explorer-user'));
      setSouvenirs(await new JourneyEngine().getSouvenirs());
      setPlaylists(await ExperienceDirector.getPlaylists());
      setEditorial(await ExperienceDirector.getEditorialMoments());
      setStoryLayers(await WaveStore.getStoryLayers());
      setLocations(await LocalStore.getLocations());
      setDecisions(await WaveStore.getDecisions());
    })();
  }, [visible]);

  const revealWorldEcho = async (id: string) => {
    const updated = await KnowledgeEngine.revealWorldEcho(id);
    setWorldEchoes(updated);
  };

  const toggleTradition = async (id: string) => {
    const updated = await WaveStore.toggleTradition(id);
    setTraditions(updated);
  };

  const createPlaylist = async () => {
    if (!playlistTitle.trim()) return;
    const updated = await ExperienceDirector.createPlaylist(playlistTitle.trim(), [
      { label: 'A calm opening with Cassidy', intent: 'conversation', durationMinutes: 2 },
      { label: 'Short contextual practice', intent: 'focus', durationMinutes: 3 },
    ]);
    setPlaylists(updated);
    setPlaylistTitle('');
  };

  const TABS: { key: Tab; label: string; Icon: any }[] = [
    { key: 'echoes', label: 'Echoes', Icon: Sparkles },
    { key: 'library', label: 'Library', Icon: BookMarked },
    { key: 'traditions', label: 'Traditions', Icon: CalendarHeart },
    { key: 'threads', label: 'Threads', Icon: GitBranch },
    { key: 'souvenirs', label: 'Souvenirs', Icon: Gift },
    { key: 'playlists', label: 'Playlists', Icon: ListMusic },
    { key: 'editorial', label: 'Editorial', Icon: Newspaper },
    { key: 'story', label: 'Story Layers', Icon: Layers },
    { key: 'decisions', label: 'Decisions', Icon: GitBranch },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-row items-center justify-between border-b border-slate-800 px-5 py-4">
          <Text className="text-lg font-bold text-white">World Discoveries</Text>
          <Pressable onPress={onClose} className="rounded-full bg-slate-800 p-2 active:bg-slate-700">
            <X size={18} color="#94a3b8" />
          </Pressable>
        </View>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-slate-800 px-3 py-2">
          <View className="flex-row gap-2">
            {TABS.map(({ key, label, Icon }) => (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
                  tab === key ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <Icon size={13} color={tab === key ? '#06281f' : '#94a3b8'} />
                <Text className={`text-xs font-semibold ${tab === key ? 'text-emerald-950' : 'text-slate-300'}`}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
          {tab === 'echoes' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Learning Echoes (Wave 4W)</Text>
              {learningEchoes.length === 0 && <Empty text="Concepts you practice will quietly reappear in new contexts." />}
              {learningEchoes.map((e) => (
                <Card key={e.id} title={e.conceptLabel}>
                  <Text className="text-xs text-slate-300">Echoed {e.echoCount}× across: {e.contexts.join(', ')}</Text>
                </Card>
              ))}

              <Text className="mt-3 text-xs uppercase tracking-wider text-indigo-400">World Echoes (Wave 4X)</Text>
              {worldEchoes.length === 0 && <Empty text="World events will unlock future learning context here." />}
              {worldEchoes.map((e) => (
                <Card key={e.id} title={e.unlockedConceptLabel}>
                  <Text className="text-xs text-slate-300">From world event: {e.worldEvent}</Text>
                  {!e.revealed && (
                    <Pressable onPress={() => revealWorldEcho(e.id)} className="mt-2 self-start rounded-lg bg-indigo-600 px-3 py-1.5">
                      <Text className="text-xs font-bold text-white">Reveal connection</Text>
                    </Pressable>
                  )}
                  {e.revealed && <Text className="mt-1 text-xs text-emerald-300">Connection revealed.</Text>}
                </Card>
              ))}
            </View>
          )}

          {tab === 'library' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Living Library (Wave 4E)</Text>
              {library.length === 0 && <Empty text="Save lessons, explanations, and creations to build a personal library." />}
              {library.map((item) => (
                <Card key={item.id} title={item.title}>
                  <Text className="text-xs text-slate-300">{item.subtitle}</Text>
                  <Text className="text-[10px] text-slate-500 mt-1">Shelf: {item.shelf}</Text>
                </Card>
              ))}
              <Pressable
                onPress={async () => {
                  const updated = await WaveStore.addLibraryItem({
                    kind: 'conversation',
                    title: 'Recent Café Dialogue',
                    subtitle: 'Your latest order practice with Ren',
                    shelf: 'recent',
                  });
                  setLibrary(updated);
                }}
                className="mt-1 rounded-xl bg-emerald-600 py-2.5"
              >
                <Text className="text-center text-xs font-bold text-white">Save current session to Library</Text>
              </Pressable>
            </View>
          )}

          {tab === 'traditions' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Personal Traditions (Wave 4AA)</Text>
              {traditions.map((t) => (
                <Card key={t.id} title={t.title}>
                  <Text className="text-xs text-slate-300">{t.description}</Text>
                  <Pressable
                    onPress={() => toggleTradition(t.id)}
                    className={`mt-2 self-start rounded-lg px-3 py-1.5 ${t.enabled ? 'bg-slate-700' : 'bg-amber-600'}`}
                  >
                    <Text className="text-xs font-bold text-white">{t.enabled ? 'Enabled' : 'Enable'}</Text>
                  </Pressable>
                </Card>
              ))}
            </View>
          )}

          {tab === 'threads' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Memory Threads (Wave 5Y)</Text>
              {threads.length === 0 && <Empty text="Meaningful themes connecting your journey events will appear here." />}
              {threads.map((th) => (
                <Card key={th.id} title={th.title}>
                  <Text className="text-xs text-slate-300">{th.theme}</Text>
                  <Text className="text-[10px] text-slate-500 mt-1">{th.eventRefs.length} linked events</Text>
                </Card>
              ))}

              <Pressable
                onPress={async () => {
                  const events = await LocalStore.getJourneyEvents();
                  const dialogueRefs = events.filter((e) => e.type === 'conversation:completed').map((e) => e.id);
                  if (dialogueRefs.length > 0) {
                    const updated = await new JourneyEngine().addMemoryThread(
                      'Your First Conversations',
                      'conversation',
                      dialogueRefs
                    );
                    setThreads(updated);
                  }
                }}
                className="mt-1 rounded-xl bg-emerald-600 py-2.5"
              >
                <Text className="text-center text-xs font-bold text-white">Weave a thread from your dialogues</Text>
              </Pressable>

              <Text className="mt-3 text-xs uppercase tracking-wider text-indigo-400">
                Distilled Memories (Wave 5Z)
              </Text>
              {distilled.length === 0 && <Empty text="Raw events are distilled into a small, ranked personal record." />}
              {distilled.map((d) => (
                <Card key={d.id} title={d.summary.slice(0, 40)}>
                  <Text className="text-[10px] text-slate-500">Rank {d.rank}</Text>
                </Card>
              ))}
            </View>
          )}

          {tab === 'souvenirs' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Learning Souvenirs (Wave 5X)</Text>
              {souvenirs.map((s) => (
                <Card key={s.id} title={s.title}>
                  <Text className="text-xs text-slate-300">{s.detail}</Text>
                </Card>
              ))}
            </View>
          )}

          {tab === 'playlists' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Experience Playlists (Wave 4G)</Text>
              {playlists.map((p) => (
                <Card key={p.id} title={p.title}>
                  {p.steps.map((s: any, i: number) => (
                    <Text key={i} className="text-xs text-slate-300">
                      {i + 1}. {s.label} ({s.durationMinutes}m)
                    </Text>
                  ))}
                </Card>
              ))}
              <View className="mt-1 flex-row items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 border border-slate-800">
                <TextInput
                  value={playlistTitle}
                  onChangeText={setPlaylistTitle}
                  placeholder="Name a new playlist…"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-xs text-white"
                />
                <Pressable onPress={createPlaylist} className="rounded-lg bg-emerald-600 px-3 py-1.5">
                  <Text className="text-xs font-bold text-white">Create</Text>
                </Pressable>
              </View>
            </View>
          )}

          {tab === 'editorial' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Editorial Moments (Wave 4H)</Text>
              {editorial.map((m) => (
                <Card key={m.id} title={m.title}>
                  {m.items.map((it: any, i: number) => (
                    <Text key={i} className="text-xs text-slate-300">
                      • {it.label} — {it.detail}
                    </Text>
                  ))}
                </Card>
              ))}
            </View>
          )}

          {tab === 'story' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Story Layers in Space (Wave 5C)</Text>
              {storyLayers.map((l, i) => {
                const loc = locations.find((x) => x.key === l.locationKey);
                return (
                  <Card key={i} title={loc?.name ?? l.locationKey}>
                    <Text className="text-xs text-slate-300">Identity: {l.layer1_identity}</Text>
                    <Text className="text-xs text-slate-300">History: {l.layer2_history}</Text>
                    <Text className="text-xs text-slate-300">Active story: {l.layer3_activeStory}</Text>
                    <Text className="text-xs text-slate-300">Your history: {l.layer4_learnerHistory}</Text>
                  </Card>
                );
              })}
            </View>
          )}

          {tab === 'decisions' && (
            <View className="gap-3">
              <Text className="text-xs uppercase tracking-wider text-emerald-400">Decision Echoes (Wave 5Q)</Text>
              {decisions.length === 0 && <Empty text="Choices you make will resonate and resurface later." />}
              {decisions.map((d) => (
                <Card key={d.id} title={d.decision}>
                  <Text className="text-[10px] text-slate-500">
                    {new Date(d.madeAt).toLocaleDateString()}
                    {d.acknowledgedIn.length > 0 ? ` · echoed in ${d.acknowledgedIn.length} place(s)` : ' · not yet echoed'}
                  </Text>
                  {d.acknowledgedIn.length === 0 && (
                    <Pressable
                      onPress={async () => {
                        const updated = await WaveStore.acknowledgeDecision(d.id, 'self-reflection');
                        setDecisions(updated);
                      }}
                      className="mt-2 self-start rounded-lg bg-violet-600 px-3 py-1.5"
                    >
                      <Text className="text-xs font-bold text-white">Let it echo</Text>
                    </Pressable>
                  )}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <Text className="text-sm font-bold text-white">{title}</Text>
      <View className="mt-1.5 gap-0.5">{children}</View>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-4">
      <Text className="text-xs text-slate-500">{text}</Text>
    </View>
  );
}
