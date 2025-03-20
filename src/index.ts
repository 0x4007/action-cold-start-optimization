// This is the main entry point for the plugin
// It will be executed by Node.js

// Import the WebAssembly wrapper
import { runWasmAction } from './wasm-wrapper';

// Check if WebAssembly is available
const useWasm = process.env.USE_WASM !== 'false';

// Map GitHub Actions inputs to environment variables
// This is needed for GitHub Actions to pass inputs to our action
if (process.env.INPUT_STATEID) {
  process.env.STATE_ID = process.env.INPUT_STATEID;
}
if (process.env.INPUT_EVENTNAME) {
  process.env.EVENT_NAME = process.env.INPUT_EVENTNAME;
}
if (process.env.INPUT_EVENTPAYLOAD) {
  process.env.EVENT_PAYLOAD = process.env.INPUT_EVENTPAYLOAD;
}
if (process.env.INPUT_SETTINGS) {
  process.env.SETTINGS = process.env.INPUT_SETTINGS;
}
if (process.env.INPUT_AUTHTOKEN) {
  process.env.AUTH_TOKEN = process.env.INPUT_AUTHTOKEN;
}
if (process.env.INPUT_REF) {
  process.env.REF = process.env.INPUT_REF;
}
if (process.env.INPUT_SIGNATURE) {
  process.env.SIGNATURE = process.env.INPUT_SIGNATURE;
}
if (process.env.INPUT_COMMAND) {
  process.env.COMMAND = process.env.INPUT_COMMAND;
}
if (process.env.INPUT_PLUGIN_GITHUB_TOKEN) {
  process.env.PLUGIN_GITHUB_TOKEN = process.env.INPUT_PLUGIN_GITHUB_TOKEN;
}
if (process.env.INPUT_KERNEL_PUBLIC_KEY) {
  process.env.KERNEL_PUBLIC_KEY = process.env.INPUT_KERNEL_PUBLIC_KEY;
}
if (process.env.INPUT_LOG_LEVEL) {
  process.env.LOG_LEVEL = process.env.INPUT_LOG_LEVEL;
}
if (process.env.INPUT_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.INPUT_SUPABASE_URL;
}
if (process.env.INPUT_SUPABASE_KEY) {
  process.env.SUPABASE_KEY = process.env.INPUT_SUPABASE_KEY;
}

// Define a fallback implementation in case WebAssembly is not available
async function runFallbackAction(): Promise<void> {
  // Access environment variables directly
  const env = {
    STATE_ID: process.env.STATE_ID || '',
    EVENT_NAME: process.env.EVENT_NAME || '',
    EVENT_PAYLOAD: process.env.EVENT_PAYLOAD || '',
    SETTINGS: process.env.SETTINGS || '',
    AUTH_TOKEN: process.env.AUTH_TOKEN || '',
    REF: process.env.REF || '',
    SIGNATURE: process.env.SIGNATURE || '',
    COMMAND: process.env.COMMAND || '',
    PLUGIN_GITHUB_TOKEN: process.env.PLUGIN_GITHUB_TOKEN || '',
    KERNEL_PUBLIC_KEY: process.env.KERNEL_PUBLIC_KEY || '',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || ''
  };

  console.log('Plugin execution started (fallback mode)');

  // Log the environment variables to verify they're being passed correctly
  console.log('Environment variables:');
  console.log('STATE_ID:', env.STATE_ID);
  console.log('EVENT_NAME:', env.EVENT_NAME);
  console.log('EVENT_PAYLOAD:', env.EVENT_PAYLOAD);
  console.log('SETTINGS:', env.SETTINGS);
  console.log('AUTH_TOKEN:', env.AUTH_TOKEN);
  console.log('REF:', env.REF);
  console.log('SIGNATURE:', env.SIGNATURE);
  console.log('COMMAND:', env.COMMAND);
  console.log('PLUGIN_GITHUB_TOKEN:', env.PLUGIN_GITHUB_TOKEN ? '[REDACTED]' : 'undefined');
  console.log('KERNEL_PUBLIC_KEY:', env.KERNEL_PUBLIC_KEY ? '[REDACTED]' : 'undefined');
  console.log('LOG_LEVEL:', env.LOG_LEVEL);
  console.log('SUPABASE_URL:', env.SUPABASE_URL ? '[REDACTED]' : 'undefined');
  console.log('SUPABASE_KEY:', env.SUPABASE_KEY ? '[REDACTED]' : 'undefined');

  // Process the event
  console.log('Processing event...');

  try {
    const eventPayload = env.EVENT_PAYLOAD ? JSON.parse(env.EVENT_PAYLOAD) : {};
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

// Main execution
async function main() {
  try {
    if (useWasm) {
      console.log('Using WebAssembly implementation for faster execution');
      await runWasmAction();
    } else {
      console.log('Using JavaScript fallback implementation');
      await runFallbackAction();
    }
  } catch (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
