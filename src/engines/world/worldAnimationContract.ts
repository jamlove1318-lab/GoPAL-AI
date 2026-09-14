/**
 * Cross-tool animation vocabulary for the Living World.
 *
 * The world runtime decides WHAT should happen. Art runtimes decide HOW it looks.
 * Blender, Spine, Rive, Godot and React Native must not introduce competing
 * world-state or scheduling systems.
 */

export type WorldAnimationAction =
  | 'idle'
  | 'breathe'
  | 'look'
  | 'lookAt'
  | 'walk'
  | 'run'
  | 'stop'
  | 'turn'
  | 'greet'
  | 'wave'
  | 'listen'
  | 'talk'
  | 'think'
  | 'discover'
  | 'celebrate'
  | 'inspect'
  | 'interact'
  | 'sit'
  | 'stand';

export type WorldAnimationLayer =
  | 'base'
  | 'locomotion'
  | 'posture'
  | 'head'
  | 'gaze'
  | 'face'
  | 'gesture'
  | 'environment'
  | 'effect';

export type WorldAnimationSource = 'blender' | 'spine' | 'rive' | 'godot' | 'native';

export type WorldAnimationPriority = 'ambient' | 'contextual' | 'important' | 'cinematic';

export interface WorldAnimationTarget {
  id: string;
  kind: 'cassidy' | 'resident' | 'creature' | 'prop' | 'environment' | 'scene';
}

export interface WorldAnimationIntent {
  target: WorldAnimationTarget;
  action: WorldAnimationAction;
  source?: WorldAnimationSource;
  priority?: WorldAnimationPriority;
  layers?: WorldAnimationLayer[];
  /** Optional world entity to look toward, inspect, approach, or react to. */
  focusId?: string;
  /** Runtime-provided seed so ambient motion stays organic but deterministic. */
  seed?: number;
  /** Runtime hint; visual adapters remain free to blend their own clip lengths. */
  intensity?: number;
  reason?: string;
}

export interface WorldAnimationBinding {
  action: WorldAnimationAction;
  source: WorldAnimationSource;
  assetId: string;
  layers: WorldAnimationLayer[];
  loop?: boolean;
  blendInMs?: number;
  blendOutMs?: number;
}

export interface WorldAnimationManifestEntry {
  targetKind: WorldAnimationTarget['kind'];
  bindings: WorldAnimationBinding[];
}

export const DEFAULT_WORLD_ANIMATION_LAYERS: WorldAnimationLayer[] = [
  'base',
  'posture',
  'head',
  'gaze',
  'face',
  'gesture',
];

/**
 * Normalizes an intent before it reaches an art adapter.
 * No scheduling, timers, world state, or rendering belongs here.
 */
export function normalizeWorldAnimationIntent(
  intent: WorldAnimationIntent,
): WorldAnimationIntent {
  return {
    ...intent,
    priority: intent.priority ?? 'ambient',
    layers: intent.layers?.length ? intent.layers : DEFAULT_WORLD_ANIMATION_LAYERS,
    intensity: Math.max(0, Math.min(1, intent.intensity ?? 1)),
  };
}
