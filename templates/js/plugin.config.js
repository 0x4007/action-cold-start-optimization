/**
 * Plugin configuration for {{name}}
 * This is a JavaScript-only implementation (Tier 1)
 */

module.exports = {
  name: '{{name}}',
  description: '{{description}}',
  author: '{{author}}',

  action: {
    icon: '{{icon}}',
    color: '{{color}}',
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
    {{events}}
  }
};
