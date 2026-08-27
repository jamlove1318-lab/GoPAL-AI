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
  private history: EmittedEvent[] = [];
  private readonly historyLimit = 80;

  on<K extends AppEventName>(type: K, handler: Handler<K>): () => void {
    if (!this.handlers[type]) this.handlers[type] = new Set();
    this.handlers[type]!.add(handler);
    return () => this.handlers[type]?.delete(handler);
  }

  emit<K extends AppEventName>(type: K, payload: AppEventPayload<K>, producer: EventProducer = 'system'): EmittedEvent<K> {
    const event: EmittedEvent<K> = { type, payload, producer, at: new Date().toISOString() };
    this.history.push(event);
    if (this.history.length > this.historyLimit) {
      this.history.splice(0, this.history.length - this.historyLimit);
    }

    const set = this.handlers[type] as Set<Handler<K>> | undefined;
    set?.forEach((handler) => handler(payload));
    return event;
  }

  recent<K extends AppEventName>(type?: K, limit = 12): EmittedEvent<K>[] {
    const safeLimit = Math.max(0, Math.min(limit, this.historyLimit));
    const events = type ? this.history.filter((event): event is EmittedEvent<K> => event.type === type) : this.history;
    return events.slice(-safeLimit) as EmittedEvent<K>[];
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const eventBus = new EventBus();
