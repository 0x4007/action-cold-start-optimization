/**
 * Plugin configuration for test-ui-plugin
 * This is a TypeScript + WASM implementation (Tier 2)
 */

export default {
  name: 'test-ui-plugin',
  description: 'A test plugin for UI testing',
  author: 'Test Author',

  action: {
    icon: 'rocket',
    color: 'blue',
    inputs: {
      labelMapping: {
        description: 'JSON mapping of keywords to labels',
        required: false,
        default: '{"bug":["error","exception","fail"],"enhancement":["improve","enhancement","feature"]}'
      }
    }
  },

  // Performance optimization settings
  optimization: {
    useWasm: true,
    wasmFunctions: ['parseJSON', 'computeHash'],
    lazyLoad: ['@octokit/rest']
  },

  // Event handlers
  events: {
    'issue.opened': './src/handlers/issue-opened.ts',
    'issue.closed': './src/handlers/issue-closed.ts',
    'issue.labeled': './src/handlers/issue-labeled.ts',
    'pull_request.opened': './src/handlers/pull-request-opened.ts',
    'pull_request.review': './src/handlers/pull-request-review.ts',
    'external.service': './src/handlers/external-service.ts'
  }
};
