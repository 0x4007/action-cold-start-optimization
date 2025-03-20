# Plugin SDK for WebAssembly-Optimized GitHub Actions

This SDK provides a simple API for developing GitHub Action plugins with WebAssembly optimization. It offers a tiered development model that accommodates developers of different skill levels.

## Tiered Development Model

### Tier 1: JavaScript-Only Development

For developers who just want to create simple plugins without dealing with WebAssembly complexity.

- Pure JavaScript API that abstracts away all WASM complexity
- Pre-compiled WASM module for performance-critical operations
- Simple hook-based programming model
- No Rust knowledge required

### Tier 2: TypeScript + WASM Integration

For developers who want more control and type safety.

- TypeScript interfaces for WASM interaction
- Configuration options for WASM usage
- Performance monitoring capabilities
- Extension points for custom optimizations

### Tier 3: Full Stack with Rust

For developers who need maximum performance.

- Complete access to modify Rust code
- Custom WASM optimization capabilities
- Advanced performance tuning options

## Getting Started

### Installation

```bash
npm install @your-org/plugin-sdk
```

### Basic Usage

```javascript
const { init, on, getContext } = require('@your-org/plugin-sdk');

// Initialize the SDK
async function main() {
  await init();

  // Register event handlers
  on('issues.opened', handleIssueOpened);

  console.log('Plugin initialized');
}

// Event handler
async function handleIssueOpened(payload) {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Your code here
}

// Start the plugin
main().catch(console.error);
```

## API Reference

### Core Functions

#### `init(options?: InitOptions): Promise<void>`

Initializes the SDK with the specified options.

```typescript
interface InitOptions {
  wasm?: {
    operations?: {
      parseJSON?: boolean;
      validatePayload?: boolean;
      computeHash?: boolean;
    };
    monitoring?: {
      enabled?: boolean;
      logPerformance?: boolean;
    };
  };
}
```

#### `on<T>(event: string, handler: EventHandler<T>): void`

Registers an event handler for the specified event.

#### `once<T>(event: string, handler: EventHandler<T>): void`

Registers a one-time event handler for the specified event.

#### `off(event: string, handler?: EventHandler): void`

Unregisters an event handler for the specified event.

#### `getContext(): PluginContext`

Gets the plugin context, which provides access to GitHub API, environment variables, and utility functions.

### Context Object

```typescript
interface PluginContext {
  github: GitHubAPI;
  env: PluginEnvironment;
  utils: PluginUtils;
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}
```

#### GitHub API

```typescript
interface GitHubAPI {
  octokit: Octokit;
  repo: { owner: string; repo: string };
  createComment(issueNumber: number, body: string): Promise<void>;
  createIssue(title: string, body: string, labels?: string[]): Promise<number>;
  // More methods...
}
```

#### Environment Variables

```typescript
interface PluginEnvironment {
  stateId: string;
  eventName: string;
  eventPayload: string;
  settings: string;
  authToken: string;
  ref: string;
  signature: string;
  command: string;
  pluginGithubToken: string;
  kernelPublicKey: string;
  logLevel: string;
  supabaseUrl: string;
  supabaseKey: string;
}
```

#### Utility Functions

```typescript
interface PluginUtils {
  parseJSON<T>(json: string): T;
  validatePayload(schema: any, payload: any): boolean;
  computeHash(data: string): string;
  // More functions...
}
```

## Configuration System

The SDK provides a configuration system that simplifies plugin creation:

```javascript
// plugin.config.js
module.exports = {
  name: 'My Plugin',
  description: 'This plugin does something awesome',
  author: 'Your Name',

  action: {
    icon: 'code',
    color: 'blue',
    inputs: {
      customSetting: {
        description: 'A custom setting for the plugin',
        required: false,
        default: 'default value'
      }
    }
  },

  events: {
    'issues.opened': './src/handlers/issue-opened.js'
  }
};
```

## Templates

The SDK provides templates for each tier of the development model:

- Tier 1: JavaScript-Only Template
- Tier 2: TypeScript + WASM Template
- Tier 3: Full Stack with Rust Template

You can use these templates as a starting point for your plugin development.

## Performance Comparison

| Approach | Cold Start Time | Processing Time | Memory Usage |
|----------|----------------|-----------------|--------------|
| Tier 1 (JS Only) | ~400ms | ~120ms | ~40MB |
| Tier 2 (TS+WASM) | ~350ms | ~80ms | ~35MB |
| Tier 3 (Full Rust) | ~300ms | ~30ms | ~30MB |

## License

MIT
