import {
  clampWorldAudioGain,
  distanceAttenuation,
  SOFT_WORLD_AUDIO_DEFAULTS,
  type WorldAudioEvent,
  type WorldAudioLocationProfile,
  type WorldAudioMix,
  type WorldAudioWorldState,
} from './worldAudioContract';
import { getWorldAudioProfile } from './worldAudioProfiles';

export type WorldAudioPlaybackRequest = {
  cueId: string;
  category: WorldAudioEvent['category'];
  gain: number;
  priority: NonNullable<WorldAudioEvent['priority']>;
  position?: WorldAudioEvent['position'];
};

type ActiveCue = {
  cueId: string;
  startedAt: number;
  lastPlayedAt: number;
};

const CATEGORY_KEYS: Record<WorldAudioEvent['category'], keyof WorldAudioMix> = {
  music: 'music',
  ambience: 'ambience',
  location: 'location',
  activity: 'activity',
  interaction: 'interaction',
  transport: 'transport',
  voice: 'voice',
  event: 'event',
};

const PRIORITY_GAIN: Record<NonNullable<WorldAudioEvent['priority']>, number> = {
  background: 0.55,
  normal: 0.72,
  important: 0.88,
  moment: 1,
};

export class WorldAudioEngine {
  private worldState: WorldAudioWorldState | undefined;
  private active: ActiveCue[] = [];
  private mix: WorldAudioMix = { ...SOFT_WORLD_AUDIO_DEFAULTS };

  setWorldState(state: WorldAudioWorldState): void {
    this.worldState = state;
  }

  setMix(partial: Partial<WorldAudioMix>): void {
    this.mix = { ...this.mix, ...partial };
  }

  getMix(): WorldAudioMix {
    return { ...this.mix };
  }

  getProfile(): WorldAudioLocationProfile | undefined {
    return this.worldState ? getWorldAudioProfile(this.worldState.locationId) : undefined;
  }

  resolveEvent(event: WorldAudioEvent): WorldAudioPlaybackRequest | undefined {
    const state = this.worldState;
    const profile = this.getProfile();
    if (!state || !profile || state.quietMode) return undefined;

    const now = event.nowMs ?? Date.now();
    const priority = event.priority ?? 'normal';
    const categoryKey = CATEGORY_KEYS[event.category];
    const profileGain = this.profileGain(profile, categoryKey);
    const distance = event.position ? this.distanceFromPlayer(event.position) : 0;
    const attenuation = event.position ? distanceAttenuation(distance) : 1;
    const intensity = clampWorldAudioGain(event.intensity ?? 1);
    const gain = clampWorldAudioGain(
      this.mix.master * profileGain * (this.mix[categoryKey] ?? 1) * PRIORITY_GAIN[priority] * intensity * attenuation,
    );

    const cooldownMs = this.cooldownFor(event.category);
    const existing = this.active.find((cue) => cue.cueId === event.cueId);
    if (existing && now - existing.lastPlayedAt < cooldownMs) return undefined;

    if (existing) existing.lastPlayedAt = now;
    else this.active.push({ cueId: event.cueId, startedAt: now, lastPlayedAt: now });

    this.trimActive(profile.maxActiveOneShots, now);
    return { cueId: event.cueId, category: event.category, gain, priority, position: event.position };
  }

  transition(locationId: string, environment: WorldAudioWorldState['environment']): void {
    this.worldState = this.worldState
      ? { ...this.worldState, locationId, environment }
      : {
          locationId,
          environment,
          distanceToFocus: 0,
          playerSpeed: 0,
          timeOfDay: 'afternoon',
          weather: 'clear',
        };
    this.active = [];
  }

  private profileGain(profile: WorldAudioLocationProfile, category: keyof WorldAudioMix): number {
    switch (category) {
      case 'music': return profile.musicGain;
      case 'ambience': return profile.ambienceGain;
      case 'location': return profile.locationGain;
      case 'activity': return profile.activityGain;
      case 'event': return profile.eventGain;
      default: return 1;
    }
  }

  private cooldownFor(category: WorldAudioEvent['category']): number {
    switch (category) {
      case 'ambience': return 7000;
      case 'location': return 4500;
      case 'transport': return 5000;
      case 'activity': return 900;
      case 'interaction': return 600;
      case 'event': return 3500;
      case 'music': return 12000;
      case 'voice': return 250;
      default: return 1000;
    }
  }

  private distanceFromPlayer(position: NonNullable<WorldAudioEvent['position']>): number {
    return Math.sqrt(position.x ** 2 + position.y ** 2 + (position.z ?? 0) ** 2);
  }

  private trimActive(limit: number, now: number): void {
    if (this.active.length <= limit) return;
    this.active.sort((a, b) => a.lastPlayedAt - b.lastPlayedAt);
    this.active = this.active.slice(-limit);
    this.active = this.active.filter((cue) => now - cue.lastPlayedAt < 30000);
  }
}

export const worldAudioEngine = new WorldAudioEngine();
