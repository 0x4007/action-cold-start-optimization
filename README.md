# GitHub Actions Plugin SDK with WebAssembly Optimization

This project provides a framework for building optimized GitHub Actions plugins with WebAssembly support, focusing on reducing cold start times and improving performance.

## Features

- **WebAssembly Optimization**: Improve cold start times by using WebAssembly for performance-critical operations
- **Type-Safe Event Handling**: TypeScript definitions for GitHub webhook events
- **Simplified GitHub API Access**: Wrapper around Octokit for common operations
- **Context Management**: Easy access to GitHub context, utilities, and configuration
- **Flexible Plugin Architecture**: Support for JavaScript, TypeScript, and Rust implementations

## Project Structure

- `src/`: Core implementation files
  - `core/`: Main entry point and core functionality
  - `sdk/`: Core SDK implementation
  - `wasm/`: WebAssembly module files
- `templates/`: Plugin templates (JavaScript, TypeScript, Rust)
- `scripts/`: Development scripts
  - `utils/`: Development utilities
- `generated/`: Generated plugins (empty by default)
- `tests/`: Test files
- `docs/`: Documentation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) for fast development
- [Rust](https://www.rust-lang.org/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/) (for Rust plugins)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/action-cold-start-optimization.git
cd action-cold-start-optimization

# Install dependencies
bun install

# Build the SDK
bun run build:sdk
```

## Development Tools

### Plugin Generator

Create a new plugin with the interactive generator:

```bash
bun run create:plugin:interactive  # Creates plugin in generated/ directory
```

This tool will guide you through creating a new plugin, allowing you to:

- Choose a template (JavaScript, TypeScript, Rust)
- Select plugin features
- Customize plugin metadata
- Generate a complete plugin structure

#### Non-Interactive Mode

You can also create plugins non-interactively by using the `--non-interactive` flag with optional parameters:

```bash
bun run create:plugin:auto -- --name my-plugin --template ts --features issues,pr
```

Available options:

- `--name`: Name of the plugin (default: "my-plugin")
- `--description`: Description of the plugin (default: "A GitHub Action plugin")
- `--author`: Author of the plugin (default: "Your Name")
- `--template`: Template to use - js, ts, or rust (default: "ts")
- `--features`: Comma-separated list of features - issues, pr, repo, external (default: "issues")
- `--destination`: Destination directory (default: same as name)
- `--icon`: GitHub Action icon (default: "rocket")
- `--color`: GitHub Action color (default: "blue")

This is useful for CI/CD pipelines or scripted plugin creation.

### Local Development Server

Test your plugin with the local development server:

```bash
bun run dev:server --plugin-dir my-plugin
```

Features:

- Webhook event simulation
- Mock GitHub API responses
- Hot reloading for rapid development
- Web dashboard for monitoring and triggering events

### GitHub Actions Integration

Generate a GitHub Action from your plugin:

```bash
bun run generate:action my-plugin
```

## Example Plugins

### Issue Auto-Labeler (JavaScript)

A simple plugin that automatically labels issues based on content.

```bash
cd test-plugins/issue-labeler
bun install
bun run build
```

### Pull Request Analyzer (TypeScript)

A more advanced plugin that analyzes pull requests and provides feedback.

```bash
cd test-plugins/pr-analyzer
bun install
bun run build
```

## CI/CD Templates

The project includes GitHub Actions workflow templates for plugin testing and deployment:

- `test-plugin.yml`: Automates testing, including performance benchmarks
- `deploy-plugin.yml`: Handles deployment to GitHub Marketplace

## Performance Optimization

The SDK includes several features to optimize performance and reduce cold start times:

1. **WebAssembly Acceleration**: Performance-critical operations can be offloaded to WebAssembly
2. **Lazy Loading**: Heavy dependencies are loaded only when needed
3. **Optimized Bundle**: The SDK is bundled to minimize size and startup time
4. **Caching**: Results of expensive operations are cached

## Roadmap

See the [roadmap.md](roadmap.md) file for the project's development plan.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
