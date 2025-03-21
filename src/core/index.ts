// This is the main entry point for the plugin
// It will be executed by Node.js with optimized cold start time

// Import the WebAssembly wrapper
import { runWasmAction } from './wasm/wasm-wrapper.js';

// Check if WebAssembly is available (default to true for faster execution)
const useWasm = process.env.USE_WASM !== 'false';

// Map GitHub Actions inputs to environment variables in a single pass
// This is optimized for faster startup by reducing conditional checks
const envMappings = {
  INPUT_STATEID: 'STATE_ID',
  INPUT_EVENTNAME: 'EVENT_NAME',
  INPUT_EVENTPAYLOAD: 'EVENT_PAYLOAD',
  INPUT_SETTINGS: 'SETTINGS',
  INPUT_AUTHTOKEN: 'AUTH_TOKEN',
  INPUT_REF: 'REF',
  INPUT_SIGNATURE: 'SIGNATURE',
  INPUT_COMMAND: 'COMMAND',
  INPUT_PLUGIN_GITHUB_TOKEN: 'PLUGIN_GITHUB_TOKEN',
  INPUT_KERNEL_PUBLIC_KEY: 'KERNEL_PUBLIC_KEY',
  INPUT_LOG_LEVEL: 'LOG_LEVEL',
  INPUT_SUPABASE_URL: 'SUPABASE_URL',
  INPUT_SUPABASE_KEY: 'SUPABASE_KEY'
};

// Process all environment variables in a single loop
for (const [inputKey, envKey] of Object.entries(envMappings)) {
  if (process.env[inputKey]) {
    process.env[envKey] = process.env[inputKey];
  }
}

// Optimized fallback implementation with reduced object creation and improved error handling
async function runFallbackAction(): Promise<void> {
  console.log('Plugin execution started (fallback mode)');

  try {
    // Process the event payload directly without creating intermediate objects
    const eventPayload = process.env.EVENT_PAYLOAD
      ? JSON.parse(process.env.EVENT_PAYLOAD)
      : {};

    console.log('Event payload parsed successfully');

    // Add your plugin logic here

    console.log('Plugin execution completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing event:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

// Optimized main execution with faster startup
// We avoid creating a separate main function to reduce call stack depth
try {
  if (useWasm) {
    console.log('Using WebAssembly implementation for faster execution');
    await runWasmAction();
  } else {
    console.log('Using JavaScript fallback implementation');
    await runFallbackAction();
  }
} catch (error) {
  console.error('Execution failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
