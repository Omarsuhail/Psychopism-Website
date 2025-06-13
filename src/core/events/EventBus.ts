/**
 * Type-safe event bus for application-wide communication
 */

type EventCallback<T = unknown> = (data: T) => void;
type EventMap = Record<string, unknown>;

export class EventBus<Events extends EventMap = Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<EventCallback<Events[keyof Events]>>>();
  private onceListeners = new Map<keyof Events, Set<EventCallback<Events[keyof Events]>>>();

  /**
   * Subscribe to an event
   */
  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback as EventCallback<Events[keyof Events]>);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    
    this.onceListeners.get(event)!.add(callback as EventCallback<Events[keyof Events]>);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback<Events[keyof Events]>);
    this.onceListeners.get(event)?.delete(callback as EventCallback<Events[keyof Events]>);
  }

  /**
   * Emit an event
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    // Call regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for '${String(event)}':`, error);
        }
      });
    }

    // Call once listeners and remove them
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in once event listener for '${String(event)}':`, error);
        }
      });
      onceListeners.clear();
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof Events>(event: K): number {
    const regularCount = this.listeners.get(event)?.size ?? 0;
    const onceCount = this.onceListeners.get(event)?.size ?? 0;
    return regularCount + onceCount;
  }
}

// Application-specific event types
export interface AppEvents extends EventMap {
  'app:initialized': { timestamp: number };
  'app:error': { error: Error; component?: string };
  'animation:start': { type: string; element?: HTMLElement };
  'animation:complete': { type: string; element?: HTMLElement };
  'performance:warning': { fps: number; component: string };
  'canvas:created': { canvas: HTMLCanvasElement };
  'canvas:resize': { width: number; height: number };
}

// Global event bus instance
export const eventBus = new EventBus<AppEvents>();

