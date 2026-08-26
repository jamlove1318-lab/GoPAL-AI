import { WaveStore } from '../lib/waveStore';
import { CharacterEngine } from '../engines/character/characterEngine';

const characterEngine = new CharacterEngine();

// Where Cassidy can be. Used to give her a voice that fits the place.
export type Place =
  | 'home'
  | 'cassidy'
  | 'study'
  | 'world'
  | 'journey'
  | 'museum'
  | 'characters'
  | 'settings';

// A live snapshot of the learner's world — pulled from every engine that
// remembers them. Cassidy reads this to know what to say.
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

export async function loadCassidySnapshot(): Promise<CassidySnapshot> {
  const [ret, echoes, worldEchoes, souvs, threads, decisions, living] = await Promise.all([
    WaveStore.getReturnSignature(),
    WaveStore.getLearningEchoes(),
    WaveStore.getWorldEchoes(),
    WaveStore.getSouvenirs(),
    WaveStore.getThreads(),
    WaveStore.getDecisions(),
    WaveStore.getLivingObjects(),
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

// The character engine's own time-of-day greeting — reused so Cassidy stays
// consistent with the world's clock.
export function cassidyTimeGreeting(timeOfDay: string, location?: string | null): string {
  return characterEngine.generateGreeting(
    (timeOfDay as any) ?? 'morning',
    (location as any) ?? '',
    'warm' as any,
  );
}

// How "alive" the world feels, derived from how much the learner has done.
export function worldIntensity(snap: CassidySnapshot | null): number {
  if (!snap) return 0.5;
  return Math.min(1, 0.35 + (snap.echoes + snap.souvenirs + snap.threads + snap.worldEchoes) / 30);
}
