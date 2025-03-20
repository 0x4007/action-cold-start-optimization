import { init, on } from 'plugin-sdk';
import { wasmConfig } from './wasm-config.js';
import { handlers } from './handlers/index.js';

// Initialize the SDK
async function main() {
  // Initialize the SDK with WebAssembly optimizations
  await init({ wasm: wasmConfig });

  // Register event handlers
  for (const [event, handler] of Object.entries(handlers)) {
    on(event, handler);
  }

  console.log('my-plugin plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
