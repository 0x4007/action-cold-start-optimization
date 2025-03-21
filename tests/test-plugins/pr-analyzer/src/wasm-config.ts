/**
 * WebAssembly configuration for the PR Analyzer plugin
 */
export const wasmConfig = {
  // Configure which operations should use WASM
  operations: {
    parseJSON: true,
    validatePayload: true,
    computeHash: true,
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    logPerformance: true,
  },
};
