// WebAssembly wrapper for GitHub Action
// This file loads and initializes the WebAssembly module

import * as fs from 'fs';
import * as path from 'path';

// Define the environment interface
interface ActionEnvironment {
  state_id: string;
  event_name: string;
  event_payload: string;
  settings: string;
  auth_token: string;
  ref_value: string;
  signature: string;
  command: string;
  plugin_github_token: string;
  kernel_public_key: string;
  log_level: string;
  supabase_url: string;
  supabase_key: string;
}

// Main function to initialize and run the WASM module
export async function runWasmAction(): Promise<void> {
  try {
    // Map environment variables to the format expected by the WASM module
    const env: ActionEnvironment = {
      state_id: process.env.STATE_ID || '',
      event_name: process.env.EVENT_NAME || '',
      event_payload: process.env.EVENT_PAYLOAD || '',
      settings: process.env.SETTINGS || '',
      auth_token: process.env.AUTH_TOKEN || '',
      ref_value: process.env.REF || '', // Note: 'ref' is a reserved word in JS, so we use ref_value
      signature: process.env.SIGNATURE || '',
      command: process.env.COMMAND || '',
      plugin_github_token: process.env.PLUGIN_GITHUB_TOKEN || '',
      kernel_public_key: process.env.KERNEL_PUBLIC_KEY || '',
      log_level: process.env.LOG_LEVEL || 'info',
      supabase_url: process.env.SUPABASE_URL || '',
      supabase_key: process.env.SUPABASE_KEY || ''
    };

    // Convert environment to JSON string for passing to WASM
    const envJson = JSON.stringify(env);

    // Dynamically import the WASM module
    // In a real implementation, you would use the actual path to your WASM module
    const wasmPath = path.resolve(__dirname, '../pkg/action_wasm_bg.wasm');

    // Check if the WASM file exists
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM module not found at ${wasmPath}`);
    }

    // Import the WASM module
    const wasmModule = await import('../pkg/action_wasm.js');

    // Initialize the WASM module
    await wasmModule.default();

    // Process the event using the WASM module
    const result = wasmModule.process_event(envJson);

    // Parse and handle the result
    try {
      const parsedResult = JSON.parse(result);
      if (parsedResult.error) {
        console.error('Error from WASM module:', parsedResult.error);
        process.exit(1);
      }
    } catch (parseError) {
      console.error('Failed to parse WASM result:', parseError);
      console.error('Raw result:', result);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running WASM action:', error);
    process.exit(1);
  }
}
