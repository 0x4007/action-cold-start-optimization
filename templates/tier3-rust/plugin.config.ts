/**
 * Plugin configuration for the Issue Auto-Labeler
 * This is a Full Stack with Rust implementation (Tier 3)
 */

export default {
  name: 'Issue Auto-Labeler',
  description: 'Automatically labels issues based on content',
  author: 'Your Name',

  action: {
    icon: 'tag',
    color: 'green',
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
    wasmFunctions: ['match_labels'],
    lazyLoad: ['@octokit/rest']
  },

  // Event handlers
  events: {
    'issues.opened': './src/handlers/issue-opened.ts'
  }
};
