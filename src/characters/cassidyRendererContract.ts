import type { CassidyVisualCommand } from './cassidyVisualResolver';

/**
 * Renderer-neutral contract between Cassidy's domain visual resolver and any
 * concrete renderer (WebGL/Three, native 3D, or a future renderer).
 *
 * The renderer owns pixels, GPU resources and frame timing. It must not make
 * decisions about Cassidy's personality, learning state, memory or world
 * logic. Those decisions stay upstream in the engines and visual resolver.
 */
export interface CassidyRendererHandle {
  readonly rendererId: string;
  readonly mounted: boolean;
  readonly loadedAssetKey?: string;
}

export interface CassidyRendererMetrics {
  fps?: number;
  frameTimeMs?: number;
  drawCalls?: number;
  triangles?: number;
  textureBytes?: number;
  modelBytes?: number;
  assetLoadMs?: number;
}

export interface CassidyRendererAdapter {
  /** Attach the renderer to its host surface. */
  mount(): Promise<CassidyRendererHandle> | CassidyRendererHandle;

  /** Release GPU/native resources. Safe to call during unmount. */
  unmount(): Promise<void> | void;

  /** Apply a fully-resolved Cassidy command; no domain decisions here. */
  apply(command: CassidyVisualCommand): Promise<void> | void;

  /** Optional renderer-side diagnostics for the development quality gate. */
  getMetrics?(): CassidyRendererMetrics;
}

export interface CassidyRendererCapabilities {
  gltf: boolean;
  animations: boolean;
  facialExpressions: boolean;
  eyeGaze: boolean;
  secondaryMotion: boolean;
  lod: boolean;
}

export const CASSIDY_RENDERER_REQUIREMENTS: CassidyRendererCapabilities = {
  gltf: true,
  animations: true,
  facialExpressions: true,
  eyeGaze: true,
  secondaryMotion: true,
  lod: true,
};

/**
 * Keeps renderer capability checks reusable for future characters and scenes.
 * A renderer can be integrated only when every production Cassidy capability
 * is explicitly supported.
 */
export function isCassidyRendererCompatible(
  capabilities: CassidyRendererCapabilities,
): boolean {
  return (Object.keys(CASSIDY_RENDERER_REQUIREMENTS) as Array<keyof CassidyRendererCapabilities>)
    .every(key => capabilities[key]);
}
