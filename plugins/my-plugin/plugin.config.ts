export default {
  name: 'my-plugin',
  description: 'A GitHub Action plugin',
  author: 'Your Name',

  action: {
    icon: 'code',
    color: 'blue',
    inputs: {
      // Add your custom inputs here
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
    'external.service': './src/handlers/external-service.ts'
  }
};
