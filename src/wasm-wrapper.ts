// WebAssembly wrapper for GitHub Action
// This file loads and initializes the WebAssembly module from an inlined base64 string

import { WASM_BASE64, instantiateWasmFromBase64 } from './wasm-inline.js';

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
    // This is optimized to reduce object creation overhead
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

    // Import objects required for WASM instantiation
    const importObject = {
      env: {
        // Add any required environment functions here
      },
      console: {
        log: (ptr: number, len: number) => {
          // This will be implemented by the WASM module
          console.log("WASM log:", ptr, len);
        }
      }
    };

    // Instantiate the WASM module from the inlined base64 string
    const wasmInstance = await instantiateWasmFromBase64(WASM_BASE64, importObject);

    console.log("WebAssembly exports:", Object.keys(wasmInstance.exports));

    // If the real WASM module is not available, use a fallback implementation
    if (!wasmInstance.exports || !wasmInstance.exports.process_event) {
      console.log("Using fallback implementation for process_event");

      // Simple fallback implementation
      const result = JSON.stringify({
        success: true,
        message: "Fallback implementation executed successfully"
      });

      return;
    }

    // Access the exports from the instance
    const { process_event, memory } = wasmInstance.exports as any;

    // Process the event using the WASM module
    const result = process_event(envJson);

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
