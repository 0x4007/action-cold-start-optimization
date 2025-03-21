
 * Plugin configuration for {{name}}
 * This is a TypeScript + WASM implementation (Tier 2)
 */

export default {
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

  // Performance optimization settings
  optimization: {
    useWasm: true,
    wasmFunctions: ['parseJSON', 'computeHash'],
    lazyLoad: ['@octokit/rest']
  },

  // Event handlers
  events: {
    {{events}}
  }
};
