import type { WorldAnimationName } from './worldAnimationContract';

/** Maps one shared world animation vocabulary onto common authored clip names. */
const CLIP_ALIASES: Readonly<Record<WorldAnimationName, readonly string[]>> = {
  idle: ['idle', 'Idle', 'IDLE'],
  breathe: ['breathe', 'breathing', 'idle'],
  look: ['look', 'look_left', 'look_right'],
  lookAt: ['lookAt', 'look_at', 'look'],
  walk: ['walk', 'Walk', 'walking'],
  run: ['run', 'Run', 'running'],
  stop: ['stop', 'idle'],
  turn: ['turn', 'turn_left', 'turn_right'],
  greet: ['greet', 'greeting', 'wave', 'Wave'],
  wave: ['wave', 'Wave', 'greet'],
  listen: ['listen', 'listening', 'idle'],
  talk: ['talk', 'Talk', 'talking'],
  think: ['think', 'Thinking', 'thinking'],
  discover: ['discover', 'discovery', 'inspect'],
  celebrate: ['celebrate', 'Celebrate', 'celebration'],
  inspect: ['inspect', 'Inspect', 'look'],
  interact: ['interact', 'interaction', 'inspect'],
  sit: ['sit', 'Sit', 'sitting'],
  stand: ['stand', 'Stand', 'idle'],
};

export function resolveWorldAnimationClip(
  animation: WorldAnimationName,
  availableClips: readonly string[],
): string | undefined {
  const normalized = new Map(availableClips.map(clip => [clip.toLowerCase(), clip]));
  for (const alias of CLIP_ALIASES[animation]) {
    const exact = availableClips.find(clip => clip === alias);
    if (exact) return exact;
    const insensitive = normalized.get(alias.toLowerCase());
    if (insensitive) return insensitive;
  }
  return animation === 'idle' ? availableClips[0] : undefined;
}
