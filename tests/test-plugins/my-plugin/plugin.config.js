/**
 * Plugin configuration for the Issue Auto-Labeler
 * This is a JavaScript-only implementation (Tier 1)
 */

module.exports = {
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

  // Event handlers
  events: {
    'issues.opened': './src/handlers/issue-opened.js'
  }
};
