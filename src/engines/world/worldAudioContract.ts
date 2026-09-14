export type WorldAudioCategory =
  | 'music'
  | 'ambience'
  | 'location'
  | 'activity'
  | 'interaction'
  | 'transport'
  | 'voice'
  | 'event';

export type WorldAudioPriority = 'background' | 'normal' | 'important' | 'moment';
export type WorldAudioEnvironment = 'outdoor' | 'indoor' | 'covered';

export type WorldAudioPosition = {
  x: number;
  y: number;
  z?: number;
};

export type WorldAudioCue = {
  id: string;
  category: WorldAudioCategory;
  sourceUri?: string;
  loop?: boolean;
  baseGain: number;
  maxGain: number;
  fadeInMs?: number;
  fadeOutMs?: number;
  cooldownMs?: number;
  maxConcurrent?: number;
  priority?: WorldAudioPriority;
  spatial?: boolean;
  position?: WorldAudioPosition;
  tags?: string[];
};

export type WorldAudioLocationProfile = {
  id: string;
  displayName: string;
  environment: WorldAudioEnvironment;
  music: string[];
  ambience: string[];
  location: string[];
  activity: string[];
  transport: string[];
  interactions: string[];
  eventCues: string[];
  defaultDensity: number;
  maxActiveOneShots: number;
  musicGain: number;
  ambienceGain: number;
  locationGain: number;
  activityGain: number;
  eventGain: number;
  reverbPreset: 'open' | 'small-room' | 'large-room' | 'station' | 'cafe' | 'forest';
};

export type WorldAudioWorldState = {
  locationId: string;
  environment: WorldAudioEnvironment;
  distanceToFocus: number;
  playerSpeed: number;
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'clear' | 'cloudy' | 'rain' | 'wind' | 'snow';
  focusedActivity?: string;
  quietMode?: boolean;
};

export type WorldAudioEvent = {
  cueId: string;
  category: WorldAudioCategory;
  priority?: WorldAudioPriority;
  position?: WorldAudioPosition;
  intensity?: number;
  nowMs?: number;
};

export type WorldAudioMix = {
  master: number;
  music: number;
  ambience: number;
  location: number;
  activity: number;
  transport: number;
  interaction: number;
  event: number;
  voice: number;
};

export const SOFT_WORLD_AUDIO_DEFAULTS: WorldAudioMix = {
  master: 0.72,
  music: 0.34,
  ambience: 0.28,
  location: 0.24,
  activity: 0.18,
  transport: 0.2,
  interaction: 0.24,
  event: 0.3,
  voice: 0.46,
};

export function clampWorldAudioGain(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function distanceAttenuation(distance: number, near = 2, far = 32): number {
  if (!Number.isFinite(distance) || distance <= near) return 1;
  if (distance >= far) return 0;
  const normalized = (distance - near) / (far - near);
  return Math.pow(1 - normalized, 1.6);
}
