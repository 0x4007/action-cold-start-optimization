/**
 * Event system for the Plugin SDK
 * Provides a simple way to register handlers for GitHub webhook events
 */

import { PluginContext } from "./context.js";

export type EventPayload = Record<string, any>;

export type EventHandler<T extends EventPayload = EventPayload> = (
  payload: T,
  context: PluginContext,
) => Promise<void> | void;

export interface EventRegistry {
  on<T extends EventPayload>(event: string, handler: EventHandler<T>): void;
  once<T extends EventPayload>(event: string, handler: EventHandler<T>): void;
  off(event: string, handler?: EventHandler): void;
}

/**
 * Event manager that handles registration and triggering of event handlers
 */
class EventManager implements EventRegistry {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Register an event handler for the specified event
   */
  on<T extends EventPayload>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    // Type assertion to handle the generic type
    this.handlers.get(event)!.add(handler as unknown as EventHandler);
  }

  /**
   * Register a one-time event handler for the specified event
   */
  once<T extends EventPayload>(event: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler = async (payload, context) => {
      // Type assertion to handle the generic type
      await (handler as EventHandler<EventPayload>)(payload, context);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * Unregister an event handler for the specified event
   */
  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      this.handlers.delete(event);
      return;
    }

    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Trigger all handlers for the specified event
   */
  async trigger(
    event: string,
    payload: EventPayload,
    context: PluginContext,
  ): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const promises = Array.from(handlers).map((handler) =>
      handler(payload, context),
    );
    await Promise.all(promises);
  }
}

// Export a singleton instance of the event manager
export const events = new EventManager();
