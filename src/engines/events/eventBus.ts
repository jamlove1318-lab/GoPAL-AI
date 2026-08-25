import type { AppEventMap, AppEventName, AppEventPayload, EventProducer } from '../../lib/events';

type Handler<K extends AppEventName> = (payload: AppEventPayload<K>) => void;

export interface EmittedEvent<K extends AppEventName = AppEventName> {
  type: K;
  payload: AppEventPayload<K>;
  producer: EventProducer;
  at: string;
}

export class EventBus {
  private handlers: Record<string, Set<any>> = {};

  on<K extends AppEventName>(type: K, handler: Handler<K>): () => void {
    if (!this.handlers[type]) {
      this.handlers[type] = new Set();
    }
    this.handlers[type]!.add(handler);
    return () => this.handlers[type]?.delete(handler);
  }


  emit<K extends AppEventName>(type: K, payload: AppEventPayload<K>, producer: EventProducer = 'system'): EmittedEvent<K> {
    const set = this.handlers[type] as Set<Handler<K>> | undefined;
    if (set) {
      set.forEach((h) => h(payload));
    }
    return { type, payload, producer, at: new Date().toISOString() };
  }
}

export const eventBus = new EventBus();
