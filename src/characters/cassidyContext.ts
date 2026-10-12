import { WaveStore } from '../lib/waveStore';
import { livingWorldObjectsStore } from '../engines/world/livingWorldObjectsStore';
import { CharacterEngine } from '../engines/character/characterEngine';

const characterEngine = new CharacterEngine();

export type Place = 'home' | 'cassidy' | 'study' | 'world' | 'journey' | 'museum' | 'characters' | 'settings';

export interface CassidySnapshot {
  returns: number;
  lastMode: string | null;
  echoes: number;
  worldEchoes: number;
  souvenirs: number;
  threads: number;
  decisions: number;
  bonsaiGrowth: number;
  radioGrowth: number;
}

export async function loadCassidySnapshot(userId: string = 'local-explorer-user'): Promise<CassidySnapshot> {
  await livingWorldObjectsStore.migrateLegacyLocalState(userId);
  const [ret, echoes, worldEchoes, souvs, threads, decisions, living] = await Promise.all([
    WaveStore.getReturnSignature(),
    WaveStore.getLearningEchoes(),
    WaveStore.getWorldEchoes(),
    WaveStore.getSouvenirs(),
    WaveStore.getThreads(),
    WaveStore.getDecisions(),
    livingWorldObjectsStore.getAll(userId),
  ]);
  const bonsai = living.find((o) => o.id === 'living-bonsai');
  const radio = living.find((o) => o.id === 'living-radio');
  return {
    returns: ret.samples,
    lastMode: ret.lastMode ?? null,
    echoes: echoes.length,
    worldEchoes: worldEchoes.length,
    souvenirs: souvs.length,
    threads: threads.length,
    decisions: decisions.length,
    bonsaiGrowth: bonsai?.growth ?? 0,
    radioGrowth: radio?.growth ?? 0,
  };
}

export function cassidyTimeGreeting(timeOfDay: string, location?: string | null): string {
  return characterEngine.generateGreeting((timeOfDay as any) ?? 'morning', (location as any) ?? '', 'warm' as any);
}

export function worldIntensity(snap: CassidySnapshot | null): number {
  if (!snap) return 0.5;
  return Math.min(1, 0.35 + (snap.echoes + snap.souvenirs + snap.threads + snap.worldEchoes) / 30);
}
