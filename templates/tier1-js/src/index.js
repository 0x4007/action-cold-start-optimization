/**
 * Main entry point for the plugin
 * This is a JavaScript-only implementation (Tier 1)
 */

const { init, on } = require('@your-org/plugin-sdk');

// Load handlers
const handleIssueOpened = require('./handlers/issue-opened');

/**
 * Initialize the SDK and register event handlers
 */
async function main() {
  // Initialize the SDK with WebAssembly optimizations
  await init();

  // Register event handlers
  on('issues.opened', handleIssueOpened);

  console.log('Plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
