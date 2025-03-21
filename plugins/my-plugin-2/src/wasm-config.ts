/**
 * WASM configuration for the plugin
 * This is a TypeScript + WASM implementation (Tier 2)
 */

/**
 * WASM configuration for the plugin
 */
export const wasmConfig = {
  // Configure which operations should use WASM
  operations: {
    parseJSON: true,
    validatePayload: true,
    computeHash: true
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    logPerformance: true
  }
};
