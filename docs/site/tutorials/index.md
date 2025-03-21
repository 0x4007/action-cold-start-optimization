# Interactive Tutorials

Welcome to our interactive tutorials! These tutorials are designed to help you learn how to use our WebAssembly-optimized GitHub Actions framework. The tutorials are interactive, allowing you to experiment with code samples directly in your browser.

## Available Tutorials

### Beginner Tutorials

These tutorials are designed for newcomers to our framework. They will guide you through the basics of creating and deploying GitHub Action plugins.

<div class="tutorial-cards">
  <div class="tutorial-card">
    <h3>First Plugin Tutorial</h3>
    <p>Build your first GitHub Action plugin that responds to new issues.</p>
    <a href="/tutorials/beginner/first-plugin/" class="tutorial-link">Start Tutorial</a>
  </div>

  <div class="tutorial-card">
    <h3>Event Handling</h3>
    <p>Learn how to handle multiple GitHub event types in your plugin.</p>
    <a href="/tutorials/beginner/event-handling/" class="tutorial-link">Start Tutorial</a>
  </div>

  <div class="tutorial-card">
    <h3>GitHub API Integration</h3>
    <p>Discover how to interact with the GitHub API in your plugins.</p>
    <a href="/tutorials/beginner/github-api/" class="tutorial-link">Start Tutorial</a>
  </div>
</div>

## Tutorial Features

Our interactive tutorials include these key features:

- **Code Editor**: Experiment with real code directly in your browser
- **Step-by-step Instructions**: Follow clear guidance through each concept
- **Output Preview**: See the results of your code immediately
- **Performance Metrics**: Learn about optimization opportunities

## Troubleshooting

If you encounter any issues with the interactive features:

1. Make sure your browser is up-to-date
2. Try refreshing the page
3. Check the browser console for any errors
4. Try using a different browser if problems persist

For persistent issues, please [open an issue](https://github.com/your-repo/wasm-actions/issues) on our GitHub repository.

<style>
.tutorial-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.tutorial-card {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tutorial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.tutorial-card h3 {
  margin-top: 0;
  color: var(--vp-c-brand);
}

.tutorial-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--vp-c-brand);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.tutorial-link:hover {
  background-color: var(--vp-c-brand-dark);
  text-decoration: none;
}
</style>
