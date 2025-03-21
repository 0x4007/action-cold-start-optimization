/**
 * Environment module for the Plugin SDK
 * Handles environment variables and provides a clean interface for accessing them
 */
// Using ESM format requires explicit file extensions

export interface PluginEnvironment {
  stateId: string;
  eventName: string;
  eventPayload: string;
  settings: string;
  authToken: string;
  ref: string;
  signature: string;
  command: string;
  pluginGithubToken: string;
  kernelPublicKey: string;
  logLevel: string;
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Maps GitHub Actions inputs to environment variables
 */
function mapInputsToEnvironment(): void {
  const envMappings: Record<string, string> = {
    INPUT_STATEID: "STATE_ID",
    INPUT_EVENTNAME: "EVENT_NAME",
    INPUT_EVENTPAYLOAD: "EVENT_PAYLOAD",
    INPUT_SETTINGS: "SETTINGS",
    INPUT_AUTHTOKEN: "AUTH_TOKEN",
    INPUT_REF: "REF",
    INPUT_SIGNATURE: "SIGNATURE",
    INPUT_COMMAND: "COMMAND",
    INPUT_PLUGIN_GITHUB_TOKEN: "PLUGIN_GITHUB_TOKEN",
    INPUT_KERNEL_PUBLIC_KEY: "KERNEL_PUBLIC_KEY",
    INPUT_LOG_LEVEL: "LOG_LEVEL",
    INPUT_SUPABASE_URL: "SUPABASE_URL",
    INPUT_SUPABASE_KEY: "SUPABASE_KEY",
  };

  // Process all environment variables in a single loop
  for (const [inputKey, envKey] of Object.entries(envMappings)) {
    if (process.env[inputKey]) {
      process.env[envKey] = process.env[inputKey];
    }
  }
}

/**
 * Gets the environment variables for the plugin
 */
export function getEnvironment(): PluginEnvironment {
  // Ensure inputs are mapped to environment variables
  mapInputsToEnvironment();

  return {
    stateId: process.env.STATE_ID || "",
    eventName: process.env.EVENT_NAME || "",
    eventPayload: process.env.EVENT_PAYLOAD || "",
    settings: process.env.SETTINGS || "",
    authToken: process.env.AUTH_TOKEN || "",
    ref: process.env.REF || "",
    signature: process.env.SIGNATURE || "",
    command: process.env.COMMAND || "",
    pluginGithubToken: process.env.PLUGIN_GITHUB_TOKEN || "",
    kernelPublicKey: process.env.KERNEL_PUBLIC_KEY || "",
    logLevel: process.env.LOG_LEVEL || "info",
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseKey: process.env.SUPABASE_KEY || "",
  };
}
