import { LocalStore } from '../../lib/localStore';

export type SoundEffectType =
  | 'chime'
  | 'page_turn'
  | 'water_splash'
  | 'sparkle'
  | 'stamp'
  | 'threshold_cross';

export interface AmbientTrack {
  id: string;
  name: string;
  category: 'study' | 'nature' | 'social' | 'zen';
  description: string;
  streamUri?: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'lofi_study',
    name: 'Study Lo-Fi Beat',
    category: 'study',
    description: 'Gentle vinyl crackle and soothing instrumental beats for deep focus.',
  },
  {
    id: 'kyoto_rain',
    name: 'Kyoto Rain & Bamboo Chimes',
    category: 'nature',
    description: 'Soft raindrops falling on cedar roofs and swaying bamboo groves.',
  },
  {
    id: 'cafe_komorebi',
    name: 'Café Komorebi Stream & Murmurs',
    category: 'social',
    description: 'Steaming milk froth, gentle clinking porcelain, and friendly background murmurs.',
  },
  {
    id: 'zen_temple',
    name: 'Zen Temple Bell & Wind',
    category: 'zen',
    description: 'Resonant bronze temple bell and tranquil mountain breeze.',
  },
  {
    id: 'market_evening',
    name: 'Lantern Market Stroll',
    category: 'social',
    description: 'Warm chatter of evening shoppers and sizzling street delicacies.',
  },
];

export class AudioEngine {
  private static isMuted = false;
  private static masterVolume = 0.8;
  private static currentTrackId = 'lofi_study';

  static async initialize(): Promise<void> {
    const prefs = await LocalStore.getPreferences();
    this.isMuted = !prefs.audioEnabled;
  }

  static getTracks(): AmbientTrack[] {
    return AMBIENT_TRACKS;
  }

  static getCurrentTrack(): AmbientTrack {
    return (
      AMBIENT_TRACKS.find((t) => t.id === this.currentTrackId) ?? AMBIENT_TRACKS[0]
    );
  }

  static setTrack(trackId: string): void {
    if (AMBIENT_TRACKS.some((t) => t.id === trackId)) {
      this.currentTrackId = trackId;
    }
  }

  static async toggleMute(): Promise<boolean> {
    this.isMuted = !this.isMuted;
    await LocalStore.savePreferences({ audioEnabled: !this.isMuted });
    return this.isMuted;
  }

  static playSoundEffect(effect: SoundEffectType): void {
    if (this.isMuted) return;
    // Log sound effect playback for ambient sensory feedback
    console.log(`[AudioEngine] Playing SFX: ${effect} at volume ${this.masterVolume}`);
  }
}
