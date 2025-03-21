import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "WebAssembly-Optimized Actions",
  description: "Documentation for high-performance GitHub Actions with WebAssembly",
  lastUpdated: true,

  // Define all required head elements for the site
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'stylesheet', href: '/styles/tutorials.css' }],
    ['link', { rel: 'stylesheet', href: '/styles/tutorial-interactive.css' }],
    ['script', { src: '/js/tutorial-interactive.js' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'Tutorials', link: '/tutorials/' },
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
      '/tutorials/': [
        {
          text: 'Interactive Tutorials',
          items: [
            { text: 'Overview', link: '/tutorials/' },
            { text: 'First Plugin', link: '/tutorials/beginner/first-plugin/' },
            { text: 'Event Handling', link: '/tutorials/beginner/event-handling/' },
            { text: 'GitHub API', link: '/tutorials/beginner/github-api/' }
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
    }
  }
})
