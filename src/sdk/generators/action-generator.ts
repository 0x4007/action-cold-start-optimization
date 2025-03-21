/**
 * Action.yml generator for the Plugin SDK
 * Generates the action.yml file from the plugin configuration
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { PluginConfig } from "../config.js";

/**
 * Generates the action.yml file from the plugin configuration
 */
export function generateActionYml(
  config: PluginConfig,
  outputPath: string = "./action.yml",
): void {
  const resolvedPath = resolve(outputPath);

  // Ensure the directory exists
  const dir = dirname(resolvedPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Create the action.yml content
  const actionYml = `name: "${config.name}"
description: "${config.description}"
author: "${config.author}"

${
  config.action.icon && config.action.color
    ? `branding:
  icon: ${config.action.icon}
  color: ${config.action.color}
`
    : ""
}
# Define your inputs here, mapping from the workflow_dispatch inputs
inputs:
  stateId:
    description: "State Id"
    required: true
  eventName:
    description: "Event Name"
    required: true
  eventPayload:
    description: "Event Payload"
    required: true
  settings:
    description: "Settings"
    required: true
  authToken:
    description: "Auth Token"
    required: true
  ref:
    description: "Ref"
    required: true
  signature:
    description: "The kernel signature"
    required: true
  command:
    description: "Command from the Kernel"
    required: false
  PLUGIN_GITHUB_TOKEN:
    description: "GitHub Token for plugin operations"
    required: true
  KERNEL_PUBLIC_KEY:
    description: "Kernel public key for verification"
    required: true
  LOG_LEVEL:
    description: "Logging level"
    required: false
    default: "info"
  SUPABASE_URL:
    description: "Supabase URL"
    required: true
  SUPABASE_KEY:
    description: "Supabase Key"
    required: true
  USE_WASM:
    description: "Whether to use WebAssembly for faster execution"
    required: false
    default: "true"
${Object.entries(config.action.inputs)
  .map(
    ([key, value]) => `  ${key}:
    description: "${value.description}"
    required: ${value.required}${
      value.default
        ? `
    default: "${value.default}"`
        : ""
    }`,
  )
  .join("\n")}

${
  Object.keys(config.action.outputs || {}).length > 0
    ? `# Define your outputs here
outputs:
${Object.entries(config.action.outputs || {})
  .map(
    ([key, value]) => `  ${key}:
    description: "${value.description}"`,
  )
  .join("\n")}
`
    : ""
}
# The action will run directly using a custom runtime
runs:
  using: "node20"
  main: "dist/index.js"`;

  // Write the action.yml file
  writeFileSync(resolvedPath, actionYml, "utf8");

  console.log(`Generated action.yml at ${resolvedPath}`);
}
