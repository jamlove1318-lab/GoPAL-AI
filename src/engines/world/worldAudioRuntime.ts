import { Audio, createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { worldAudioEngine, type WorldAudioPlaybackRequest } from './worldAudioEngine';

export type WorldAudioAssetResolver = (cueId: string) => string | number | undefined;

type ActivePlayer = {
  cueId: string;
  player: AudioPlayer;
  loop: boolean;
};

/**
 * Thin playback adapter. WorldAudioEngine remains the only world-audio decision maker.
 * This class owns native player lifecycle only.
 */
export class WorldAudioRuntime {
  private readonly players = new Map<string, ActivePlayer>();
  private resolver: WorldAudioAssetResolver | undefined;

  setAssetResolver(resolver: WorldAudioAssetResolver): void {
    this.resolver = resolver;
  }

  async configure(): Promise<void> {
    await Audio.setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  }

  play(request: WorldAudioPlaybackRequest, loop = false): boolean {
    const source = this.resolver?.(request.cueId);
    if (source === undefined) return false;

    const existing = this.players.get(request.cueId);
    if (existing) {
      existing.player.volume = request.gain;
      existing.player.play();
      return true;
    }

    const player = createAudioPlayer(source, { downloadFirst: true });
    player.volume = request.gain;
    player.loop = loop;
    player.play();
    this.players.set(request.cueId, { cueId: request.cueId, player, loop });
    return true;
  }

  playEvent(cueId: string, category: WorldAudioPlaybackRequest['category'], intensity = 1): boolean {
    const request = worldAudioEngine.resolveEvent({ cueId, category, intensity });
    return request ? this.play(request, false) : false;
  }

  stop(cueId: string): void {
    const active = this.players.get(cueId);
    if (!active) return;
    active.player.pause();
    active.player.remove();
    this.players.delete(cueId);
  }

  stopAll(): void {
    for (const active of this.players.values()) {
      active.player.pause();
      active.player.remove();
    }
    this.players.clear();
  }

  setCueGain(cueId: string, gain: number): void {
    const active = this.players.get(cueId);
    if (active) active.player.volume = Math.max(0, Math.min(1, gain));
  }

  dispose(): void {
    this.stopAll();
  }
}

export const worldAudioRuntime = new WorldAudioRuntime();
