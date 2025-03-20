/**
 * Main entry point for the plugin
 * This is a Full Stack with Rust implementation (Tier 3)
 */

import { init, on } from 'plugin-sdk';
import handleIssueOpened from './handlers/issue-opened.js';

/**
 * Initialize the SDK and register event handlers
 */
async function main() {
  // Initialize the SDK
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
