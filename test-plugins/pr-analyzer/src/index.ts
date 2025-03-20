import { init, on } from '@your-org/plugin-sdk';
import { wasmConfig } from './wasm-config';
import handlePullRequestOpened from './handlers/pull-request-opened';
import handlePullRequestSynchronize from './handlers/pull-request-synchronize';

/**
 * Initialize the plugin
 */
async function main() {
  // Initialize the SDK with custom WASM configuration
  await init({ wasm: wasmConfig });

  // Register event handlers
  on('pull_request.opened', handlePullRequestOpened);
  on('pull_request.synchronize', handlePullRequestSynchronize);

  console.log('Pull Request Analyzer plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
