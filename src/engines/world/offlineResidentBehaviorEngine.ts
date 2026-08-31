import type { LivingResidentEncounter, ResidentMotion } from './livingResidentEncounterEngine';

export type ResidentBehaviorState =
  | 'idle'
  | 'working'
  | 'noticing'
  | 'welcoming'
  | 'listening'
  | 'thinking'
  | 'responding'
  | 'gesturing'
  | 'laughing'
  | 'returning-to-task';

export type OfflineResidentMoment = {
  state: ResidentBehaviorState;
  motion: ResidentMotion;
  facialCue: 'neutral' | 'curious' | 'warm' | 'focused' | 'surprised' | 'happy';
  attention: 'environment' | 'learner' | 'task';
  dialogueMode: 'none' | 'local-phrase' | 'learner-turn';
  canSpeakLocally: boolean;
};

export type OfflineResidentProfile = {
  id: string;
  preferredWorkMotion?: ResidentMotion;
  warmth: number;
  curiosity: number;
  expressiveness: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function motionFor(state: ResidentBehaviorState, profile: OfflineResidentProfile): ResidentMotion {
  switch (state) {
    case 'working': return profile.preferredWorkMotion ?? 'working';
    case 'noticing': return 'surprised';
    case 'welcoming': return profile.warmth >= 0.6 ? 'warm' : 'gesturing';
    case 'listening': return 'listening';
    case 'thinking': return 'thinking';
    case 'responding': return 'speaking';
    case 'gesturing': return 'gesturing';
    case 'laughing': return 'laughing';
    case 'returning-to-task': return profile.preferredWorkMotion ?? 'working';
    default: return 'idle';
  }
}

function cueFor(state: ResidentBehaviorState, profile: OfflineResidentProfile): OfflineResidentMoment['facialCue'] {
  switch (state) {
    case 'noticing': return 'curious';
    case 'welcoming': return profile.warmth >= 0.6 ? 'warm' : 'curious';
    case 'listening': return 'focused';
    case 'thinking': return 'focused';
    case 'responding': return profile.warmth >= 0.65 ? 'warm' : 'focused';
    case 'laughing': return 'happy';
    default: return 'neutral';
  }
}

/**
 * Offline-first resident behavior. This is deliberately deterministic and does not
 * call an LLM. AI may enrich dialogue later, but the resident remains animated,
 * reactive and usable when the network and every AI provider are unavailable.
 */
export function planOfflineResidentMoment(
  encounter: LivingResidentEncounter,
  profile: OfflineResidentProfile,
  trigger: 'enter' | 'learner-spoke' | 'learner-typed' | 'idle' | 'success' | 'confusion' | 'goodbye',
): OfflineResidentMoment {
  const warmth = clamp(profile.warmth, 0, 1);
  const curiosity = clamp(profile.curiosity, 0, 1);

  let state: ResidentBehaviorState;
  switch (trigger) {
    case 'enter': state = 'noticing'; break;
    case 'learner-spoke':
    case 'learner-typed': state = 'listening'; break;
    case 'success': state = warmth > 0.45 ? 'laughing' : 'responding'; break;
    case 'confusion': state = curiosity > 0.45 ? 'thinking' : 'responding'; break;
    case 'goodbye': state = 'welcoming'; break;
    default: state = encounter.resident.mood.toLowerCase().includes('busy') ? 'working' : 'idle';
  }

  const motion = motionFor(state, profile);
  const dialogueMode = state === 'responding' || state === 'welcoming' ? 'local-phrase' : state === 'listening' ? 'learner-turn' : 'none';

  return {
    state,
    motion,
    facialCue: cueFor(state, profile),
    attention: state === 'working' || state === 'returning-to-task' ? 'task' : 'learner',
    dialogueMode,
    canSpeakLocally: true,
  };
}

/**
 * Small local transition sequence used by renderers. A renderer can animate these
 * states without understanding learning, relationships, or AI providers.
 */
export function offlineResidentSequence(
  encounter: LivingResidentEncounter,
  profile: OfflineResidentProfile,
  trigger: 'enter' | 'learner-spoke' | 'learner-typed' | 'idle' | 'success' | 'confusion' | 'goodbye',
): OfflineResidentMoment[] {
  const first = planOfflineResidentMoment(encounter, profile, trigger);
  if (trigger === 'enter') {
    return [
      first,
      planOfflineResidentMoment(encounter, profile, 'learner-typed'),
    ];
  }
  if (trigger === 'success') {
    return [first, planOfflineResidentMoment(encounter, profile, 'learner-typed')];
  }
  return [first];
}

export const offlineResidentBehaviorEngine = {
  plan: planOfflineResidentMoment,
  sequence: offlineResidentSequence,
};
