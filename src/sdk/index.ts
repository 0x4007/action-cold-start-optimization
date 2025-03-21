/**
 * Main SDK entry point for the Plugin SDK
 * Provides a simple API for plugin developers
 */

import { WASM_BASE64 } from "../wasm-inline.js";
import { events, EventHandler, EventPayload } from "./events.js";
import { createContext, PluginContext } from "./context.js";
import { initWasm } from "./wasm-bridge.js";
import { wasmUtils } from "./wasm-utils.js";

// SDK initialization state
let initialized = false;
let context: PluginContext | null = null;

/**
 * SDK initialization options
 */
export interface InitOptions {
  wasm?: {
    operations?: {
      parseJSON?: boolean;
      validatePayload?: boolean;
      computeHash?: boolean;
    };
    monitoring?: {
      enabled?: boolean;
      logPerformance?: boolean;
    };
  };
}

/**
 * Initializes the SDK
 */
export async function init(options: InitOptions = {}): Promise<void> {
  if (initialized) return;

  try {
    // Initialize WASM if enabled (default is true)
    const useWasm = process.env.USE_WASM !== "false";

    if (useWasm) {
      await initWasm(WASM_BASE64);
    }

    // Create context
    context = createContext();

    initialized = true;

    console.log("SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize SDK:", error);
    throw error;
  }
}

/**
 * Register an event handler for the specified event
 */
export function on<T extends EventPayload>(
  event: string,
  handler: EventHandler<T>,
): void {
  events.on(event, handler);
}

/**
 * Register a one-time event handler for the specified event
 */
export function once<T extends EventPayload>(
  event: string,
  handler: EventHandler<T>,
): void {
  events.once(event, handler);
}

/**
 * Unregister an event handler for the specified event
 */
export function off(event: string, handler?: EventHandler): void {
  events.off(event, handler);
}

/**
 * Gets the plugin context
 */
export function getContext(): PluginContext {
  if (!context) {
    throw new Error("SDK not initialized. Call init() first.");
  }
  return context;
}

// Export utility functions
export const utils = wasmUtils;

// Export types
export type { EventPayload, EventHandler, PluginContext };
