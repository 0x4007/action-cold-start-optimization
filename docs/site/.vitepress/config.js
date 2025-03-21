import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "WebAssembly-Optimized Actions",
  description: "Documentation for high-performance GitHub Actions with WebAssembly",
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Basic Concepts', link: '/getting-started/basic-concepts' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Development Environment', link: '/getting-started/development-environment' }
          ]
        }
      ],
      '/guides/': [
        {
          text: 'Development Guides',
          items: [
            { text: 'Overview', link: '/guides/' },
            { text: 'JavaScript Development', link: '/guides/javascript-development' },
            { text: 'TypeScript Development', link: '/guides/typescript-development' },
            { text: 'Rust Integration', link: '/guides/rust-integration' },
            { text: 'WASM Optimization', link: '/guides/wasm-optimization' },
            { text: 'Deployment', link: '/guides/deployment' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Core SDK', link: '/api/core-sdk' },
            { text: 'Event System', link: '/api/event-system' },
            { text: 'Context Object', link: '/api/context-object' },
            { text: 'WASM Bridge', link: '/api/wasm-bridge' },
            { text: 'Configuration', link: '/api/configuration' }
          ]
        }
      ],
      '/performance/': [
        {
          text: 'Performance',
          items: [
            { text: 'Overview', link: '/performance/' },
            { text: 'Cold Start Optimization', link: '/performance/cold-start-optimization' },
            { text: 'Memory Usage', link: '/performance/memory-usage' },
            { text: 'Size Optimization', link: '/performance/size-optimization' },
            { text: 'Benchmarking', link: '/performance/benchmarking' }
          ]
        }
      ],
      '/troubleshooting/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Overview', link: '/troubleshooting/' },
            { text: 'Common Issues', link: '/troubleshooting/common-issues' },
            { text: 'Debugging', link: '/troubleshooting/debugging' },
            { text: 'Error Reference', link: '/troubleshooting/error-reference' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Example Plugins',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Issue Responder', link: '/examples/issue-responder' },
            { text: 'PR Analyzer', link: '/examples/pr-analyzer' },
            { text: 'Repository Statistics', link: '/examples/repo-statistics' },
            { text: 'External Service', link: '/examples/external-service' },
            { text: 'Custom UI', link: '/examples/custom-ui' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/action-cold-start-optimization' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-2025'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/yourusername/action-cold-start-optimization/edit/main/docs/site/:path'
    }
  },

  markdown: {
    lineNumbers: true,
    // Enable mermaid diagrams
    config: (md) => {
      // Add mermaid plugin once it's configured
    }
  }
})
