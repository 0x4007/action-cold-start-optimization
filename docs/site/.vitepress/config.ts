import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "WebAssembly-Optimized GitHub Actions",
  description: "Documentation for WebAssembly-optimized GitHub Actions framework",

  // Base public path when deployed in production
  base: '/',

  // Theme related configurations
  themeConfig: {
    logo: '/logo.svg',

    // Navigation menu items
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'API', link: '/api/' },
      { text: 'Tutorials', link: '/tutorials/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Performance', link: '/performance/' },
    ],

    // Sidebar nav configurations
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Basic Concepts', link: '/getting-started/basic-concepts' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Development Environment', link: '/getting-started/development-environment' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Configuration', link: '/api/configuration' },
            { text: 'WASM Bridge', link: '/api/wasm-bridge' },
            { text: 'Utility Functions', link: '/api/utility-functions' },
          ]
        }
      ],
      '/tutorials/': [
        {
          text: 'Tutorials',
          items: [
            { text: 'Overview', link: '/tutorials/' },
            {
              text: 'Beginner Tutorials',
              collapsed: false,
              items: [
                { text: 'First Plugin', link: '/tutorials/beginner/first-plugin/' },
                { text: 'Event Handling', link: '/tutorials/beginner/event-handling/' },
                { text: 'GitHub API', link: '/tutorials/beginner/github-api/' },
              ]
            }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'PR Analyzer', link: '/examples/pr-analyzer' },
            { text: 'Issue Responder', link: '/examples/issue-responder' },
          ]
        }
      ],
      '/performance/': [
        {
          text: 'Performance',
          items: [
            { text: 'Cold Start Optimization', link: '/performance/cold-start-optimization' },
            { text: 'Memory Usage', link: '/performance/memory-usage' },
            { text: 'Size Optimization', link: '/performance/size-optimization' },
          ]
        }
      ],
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo/wasm-actions' }
    ],

    // Footer configurations
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present'
    },

    // Search configurations
    search: {
      provider: 'local'
    }
  },

  // Head tags that are injected into the HTML document
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // Add tutorial CSS
    ['link', { rel: 'stylesheet', href: '/styles/tutorial-interactive.css' }],
    ['link', { rel: 'stylesheet', href: '/styles/tutorials.css' }],
    // Add tutorial initialization scripts
    ['script', { src: '/js/tutorial-init.js', defer: '' }],
    ['script', { src: '/js/tutorial-interactive.js', defer: '' }],
    ['script', { src: '/js/tutorial-loader.js', defer: '' }],
    ['script', { src: '/js/tutorial-global.js', defer: '' }]
  ],

  // Extend the default VitePress theme
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'tutorial': [
              './public/js/tutorial-init.js',
              './public/js/tutorial-interactive.js',
              './public/js/tutorial-loader.js',
              './public/js/tutorial-global.js'
            ]
          }
        }
      }
    }
  }
})
