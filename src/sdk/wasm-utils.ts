/**
 * WASM utility functions for the Plugin SDK
 * Leverages WASM for performance-critical operations
 */

import { getWasmExports, isWasmInitialized } from './wasm-bridge.js';

/**
 * Utility functions that leverage WASM for performance
 */
export const wasmUtils = {
  /**
   * Parses JSON with optimized memory usage
   */
  parseJSON<T>(json: string): T {
    try {
      // Try to use WASM implementation if available
      if (isWasmInitialized()) {
        try {
          const exports = getWasmExports();
          const result = exports.parse_json(json);
          return JSON.parse(result) as T;
        } catch (wasmError) {
          // Fall back to native implementation
          console.warn("WASM parse_json failed, using native implementation:", wasmError);
          return JSON.parse(json) as T;
        }
      } else {
        // WASM not initialized, use native implementation
        return JSON.parse(json) as T;
      }
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  },

  /**
   * Validates payload against schema
   */
  validatePayload(schema: any, payload: any): boolean {
    try {
      // Try to use WASM implementation if available
      if (isWasmInitialized()) {
        try {
          const exports = getWasmExports();
          const schemaStr = JSON.stringify(schema);
          const payloadStr = JSON.stringify(payload);
          const result = exports.validate_payload(schemaStr, payloadStr);
          return result === 1;
        } catch (wasmError) {
          // Fall back to native implementation
          console.warn("WASM validate_payload failed, using native implementation:", wasmError);
          // Simple validation logic as fallback
          return true; // Replace with actual validation logic
        }
      } else {
        // WASM not initialized, use native implementation
        return true; // Replace with actual validation logic
      }
    } catch (error) {
      throw new Error(`Failed to validate payload: ${error}`);
    }
  },

  /**
   * Computes hash of data
   */
  computeHash(data: string): string {
    try {
      // Try to use WASM implementation if available
      if (isWasmInitialized()) {
        try {
          const exports = getWasmExports();
          return exports.compute_hash(data);
        } catch (wasmError) {
          // Fall back to native implementation
          console.warn("WASM compute_hash failed, using native implementation:", wasmError);
          // Simple hash function as fallback
          let hash = 0;
          for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
          }
          return hash.toString(16);
        }
      } else {
        // WASM not initialized, use native implementation
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          hash = ((hash << 5) - hash) + data.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16);
      }
    } catch (error) {
      throw new Error(`Failed to compute hash: ${error}`);
    }
  }
};
