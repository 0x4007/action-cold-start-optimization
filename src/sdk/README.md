# GitHub Actions Plugin SDK

This SDK provides a framework for building optimized GitHub Actions plugins with WebAssembly support.

## Features

- **WebAssembly Optimization**: Improve cold start times by using WebAssembly for performance-critical operations
- **Type-Safe Event Handling**: TypeScript definitions for GitHub webhook events
- **Simplified GitHub API Access**: Wrapper around Octokit for common operations
- **Context Management**: Easy access to GitHub context, utilities, and configuration
- **Flexible Plugin Architecture**: Support for JavaScript, TypeScript, and Rust implementations

## Installation

```bash
npm install plugin-sdk
```

## Usage

### JavaScript Plugin (Tier 1)

```javascript
import { init, on, getContext } from "plugin-sdk";

// Handle issue.opened event
on("issue.opened", async (payload) => {
  const { github, log } = getContext();

  log("Processing new issue");

  // Get issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;

  // Add a comment
  await github.createComment(issueNumber, "Thanks for opening this issue!");

  log("Issue processing completed");
});

// Initialize the SDK
init().catch((error) => {
  console.error("Plugin initialization failed:", error);
  process.exit(1);
});
```

### TypeScript Plugin (Tier 2)

```typescript
import { init, on, getContext, EventHandler } from "plugin-sdk";
import { IssueOpenedPayload } from "plugin-sdk/types";

// Configure WebAssembly optimizations
const wasmConfig = {
  operations: {
    parseJSON: true,
    validatePayload: true,
    computeHash: true,
  },
  monitoring: {
    enabled: true,
    logPerformance: true,
  },
};

// Handle issue.opened event with type safety
const handleIssueOpened: EventHandler<IssueOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log("Processing new issue");

  // Get issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;

  // Add a comment
  await github.createComment(issueNumber, "Thanks for opening this issue!");

  log("Issue processing completed");
};

// Register event handler
on("issue.opened", handleIssueOpened);

// Initialize the SDK with WebAssembly optimizations
init({ wasm: wasmConfig }).catch((error) => {
  console.error("Plugin initialization failed:", error);
  process.exit(1);
});
```

### Rust + TypeScript Plugin (Tier 3)

For maximum performance, you can implement performance-critical functions in Rust and compile them to WebAssembly.

```rust
// wasm/src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse_and_validate_json(input: &str) -> Result<JsValue, JsValue> {
    // Implement your Rust logic here
    // This will be compiled to WebAssembly
}
```

```typescript
// src/index.ts
import { init, on } from "plugin-sdk";
import * as wasm from "../wasm/pkg";

// Initialize the SDK with Rust WASM functions
init({
  wasm: {
    module: wasm,
    functions: {
      parseJSON: wasm.parse_and_validate_json,
    },
  },
}).catch((error) => {
  console.error("Plugin initialization failed:", error);
  process.exit(1);
});
```

## Development Tools

### Plugin Generator

Create a new plugin with the interactive generator:

```bash
bun run create:plugin:interactive
```

### Local Development Server

Test your plugin with the local development server:

```bash
bun run dev:server --plugin-dir my-plugin
```

### GitHub Actions Integration

Generate a GitHub Action from your plugin:

```bash
bun run generate:action my-plugin
```

## Performance Optimization

The SDK includes several features to optimize performance and reduce cold start times:

1. **WebAssembly Acceleration**: Performance-critical operations can be offloaded to WebAssembly
2. **Lazy Loading**: Heavy dependencies are loaded only when needed
3. **Optimized Bundle**: The SDK is bundled to minimize size and startup time
4. **Caching**: Results of expensive operations are cached

## API Reference

### Core Functions

- `init(options?)`: Initialize the SDK
- `on(event, handler)`: Register an event handler
- `getContext()`: Get the current context (github, utils, log, etc.)

### GitHub API

- `github.createComment(issueNumber, body)`: Create a comment on an issue or PR
- `github.addLabels(issueNumber, labels)`: Add labels to an issue or PR
- `github.octokit`: Access the full Octokit API

### Utilities

- `utils.parseJSON(json)`: Parse JSON with error handling
- `utils.computeHash(data)`: Compute a hash of the data
- `utils.validatePayload(payload, schema)`: Validate a payload against a schema

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
