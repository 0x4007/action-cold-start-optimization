/**
 * WASM bridge module for the Plugin SDK
 * Connects JavaScript and Rust with a clean interface
 */

import { instantiateWasmFromBase64 } from '../wasm-inline.js';

/**
 * Interface for WASM exports
 */
export interface WasmExports {
  process_event: (envJson: string) => string;
  parse_json: (json: string) => string;
  validate_payload: (schema: string, payload: string) => number;
  compute_hash: (data: string) => string;
  // Add more WASM exports as needed
}

// Initialize WASM module
let wasmInstance: WebAssembly.Instance | null = null;
let wasmExports: WasmExports | null = null;

/**
 * Initializes the WASM module
 */
export async function initWasm(wasmBase64: string): Promise<void> {
  if (wasmInstance) return;

  try {
    // Create import object for WASM
    const importObject = {
      env: {},
      console: {
        log: (ptr: number, len: number) => {
          console.log("WASM log:", ptr, len);
        }
      }
    };

    // Instantiate WASM module
    wasmInstance = await instantiateWasmFromBase64(wasmBase64, importObject);
    wasmExports = wasmInstance.exports as unknown as WasmExports;

    console.log("WebAssembly initialized successfully");
  } catch (error) {
    console.error("Failed to initialize WebAssembly:", error);
    throw error;
  }
}

/**
 * Gets the WASM exports
 */
export function getWasmExports(): WasmExports {
  if (!wasmExports) {
    throw new Error("WebAssembly not initialized. Call initWasm() first.");
  }
  return wasmExports;
}

/**
 * Checks if WASM is initialized
 */
export function isWasmInitialized(): boolean {
  return wasmExports !== null;
}
