import type { CassidyCharacterAssetSet, CassidyCharacterState } from './cassidyCharacterDesign';
import type {
  CassidyRendererAdapter,
  CassidyRendererHandle,
  CassidyRendererMetrics,
} from './cassidyRendererContract';
import { resolveCassidyVisual, type CassidyRenderAssetTier, type CassidyVisualCommand } from './cassidyVisualResolver';

/**
 * Reusable lifecycle/controller boundary between Cassidy state and a concrete
 * renderer. It deliberately contains no React, Expo, Three.js, or GPU logic.
 *
 * The controller serializes renderer operations so an async asset transition
 * cannot race an unmount or a newer visual command.
 */
export interface CassidyRendererControllerOptions {
  assetSet?: CassidyCharacterAssetSet;
  requestedTier?: Exclude<CassidyRenderAssetTier, 'fallback'>;
}

export interface CassidyRendererControllerSnapshot {
  mounted: boolean;
  syncing: boolean;
  lastCommand?: CassidyVisualCommand;
  lastHandle?: CassidyRendererHandle;
}

export class CassidyRendererController {
  private readonly adapter: CassidyRendererAdapter;
  private readonly options: CassidyRendererControllerOptions;
  private snapshotState: CassidyRendererControllerSnapshot = {
    mounted: false,
    syncing: false,
  };
  private operation: Promise<void> = Promise.resolve();
  private generation = 0;

  constructor(
    adapter: CassidyRendererAdapter,
    options: CassidyRendererControllerOptions = {},
  ) {
    this.adapter = adapter;
    this.options = options;
  }

  getSnapshot(): CassidyRendererControllerSnapshot {
    return { ...this.snapshotState };
  }

  async mount(): Promise<CassidyRendererHandle> {
    const generation = ++this.generation;
    let handle: CassidyRendererHandle | undefined;

    await this.enqueue(async () => {
      if (this.snapshotState.mounted) {
        handle = this.snapshotState.lastHandle;
        return;
      }

      const nextHandle = await this.adapter.mount();
      if (generation !== this.generation) {
        await this.adapter.unmount();
        return;
      }

      handle = nextHandle;
      this.snapshotState = {
        ...this.snapshotState,
        mounted: true,
        lastHandle: nextHandle,
      };
    });

    if (!handle) {
      throw new Error('Cassidy renderer mounted without a renderer handle.');
    }

    return handle;
  }

  async sync(state: CassidyCharacterState): Promise<CassidyVisualCommand> {
    const command = resolveCassidyVisual(state, this.options);
    const generation = this.generation;

    await this.enqueue(async () => {
      if (generation !== this.generation || !this.snapshotState.mounted) return;

      this.snapshotState = { ...this.snapshotState, syncing: true };
      try {
        await this.adapter.apply(command);
        if (generation === this.generation) {
          this.snapshotState = {
            ...this.snapshotState,
            syncing: false,
            lastCommand: command,
          };
        }
      } catch (error) {
        this.snapshotState = { ...this.snapshotState, syncing: false };
        throw error;
      }
    });

    return command;
  }

  async unmount(): Promise<void> {
    ++this.generation;
    await this.enqueue(async () => {
      if (!this.snapshotState.mounted) return;

      await this.adapter.unmount();
      this.snapshotState = {
        mounted: false,
        syncing: false,
      };
    });
  }

  getMetrics(): CassidyRendererMetrics | undefined {
    return this.adapter.getMetrics?.();
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    const next = this.operation.then(operation, operation);
    this.operation = next.catch(() => undefined);
    return next;
  }
}
