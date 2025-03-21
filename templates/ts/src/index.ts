/**
 * Main entry point for the plugin
 * This is a TypeScript + WASM implementation (Tier 2)
 */

import { init, on } from "plugin-sdk";
import { wasmConfig } from "./wasm-config.js";
import handleIssueOpened from "./handlers/issue-opened.js";

/**
 * Initialize the SDK and register event handlers
 */
async function main() {
  // Initialize the SDK with custom WASM configuration
  await init({ wasm: wasmConfig });

  // Register event handlers
  on("issues.opened", handleIssueOpened);

  console.log("Plugin initialized");
}

// Start the plugin
main().catch((error) => {
  console.error("Plugin initialization failed:", error);
  process.exit(1);
});
