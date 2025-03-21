# Configuration Options Reference

This document provides a comprehensive reference for all configuration options available in our WebAssembly-Optimized GitHub Actions framework.

## Overview

Configuration in our framework is managed through a `plugin.config.js` (JavaScript) or `plugin.config.ts` (TypeScript) file in the root of your plugin project. This file exports a configuration object that defines how your plugin behaves, what events it responds to, and how it integrates with WebAssembly.

## Basic Configuration

### Minimal Configuration Example

```typescript
// plugin.config.ts
import { PluginConfig } from '@action-optimizer/sdk';

const config: PluginConfig = {
  name: "my-github-plugin",
  version: "1.0.0",
  description: "A plugin that responds to GitHub events",
  author: "Your Name",
  events: ["issues.opened", "pull_request.opened"],
  outputs: {
    result: {
      description: "The result of the plugin execution"
    }
  }
};

export default config;
```

### Core Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | The name of your plugin. Must be unique within your organization. |
| `version` | string | Yes | The version of your plugin in semver format (e.g., "1.0.0"). |
| `description` | string | Yes | A short description of what your plugin does. |
| `author` | string | Yes | Your name or organization name. |
| `events` | string[] | Yes | Array of GitHub events this plugin responds to (e.g., "issues.opened"). |
| `outputs` | object | Yes | Defines the outputs your action will produce. |

### Events

The `events` property defines which GitHub webhook events your plugin will respond to. Each event string follows the format `resource.action` (e.g., `issues.opened`).

Common event types include:

- `issues.opened`, `issues.edited`, `issues.closed`
- `pull_request.opened`, `pull_request.synchronize`, `pull_request.closed`
- `push`
- `release.published`
- `workflow_dispatch`

Example:

```typescript
events: [
  "issues.opened",
  "issues.edited",
  "pull_request.opened",
  "pull_request.synchronize"
]
```

You can also use wildcards to respond to all actions for a resource:

```typescript
events: [
  "issues.*",   // All issue events
  "pull_request.*"  // All pull request events
]
```

### Outputs

The `outputs` property defines the values your plugin will return after execution. These outputs can be used by GitHub Actions workflows that invoke your plugin.

Example:

```typescript
outputs: {
  issueLabels: {
    description: "Labels applied to the issue"
  },
  commentAdded: {
    description: "Whether a comment was added to the issue",
    type: "boolean" // Optional type information
  },
  processTime: {
    description: "Time taken to process the issue in milliseconds",
    type: "number"
  }
}
```

## Advanced Configuration

### Runtime Configuration

The `runtime` property allows you to configure how your plugin runs:

```typescript
runtime: {
  nodeVersion: "16",  // Node.js version to use
  timeout: 60000,     // Maximum execution time in milliseconds
  memory: 512,        // Memory limit in MB
  environment: {      // Environment variables
    LOG_LEVEL: "info"
  },
  entryPoint: "./src/index.js"  // Custom entry point (default: src/index.js or src/index.ts)
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `nodeVersion` | string | "16" | Node.js version to use. |
| `timeout` | number | 60000 | Maximum execution time in milliseconds. |
| `memory` | number | 256 | Memory limit in MB. |
| `environment` | object | {} | Environment variables to set at runtime. |
| `entryPoint` | string | "./src/index.js" | Path to the entry point file. |

### WebAssembly Configuration

The `wasm` property configures WebAssembly modules and their integration:

```typescript
wasm: {
  modules: [
    {
      name: "textAnalyzer",
      path: "./wasm/text-analyzer.wasm",
      memorySize: 16,  // Initial memory in pages (64KB each)
      functions: [
        "analyzeText",
        "extractKeywords"
      ],
      autoload: true  // Load on startup
    },
    {
      name: "imageProcessor",
      path: "./wasm/image-processor.wasm",
      memorySize: 64,
      functions: [
        "processImage",
        "detectObjects"
      ],
      autoload: false  // Load on demand
    }
  ],
  sharedMemory: false,  // Whether modules share memory
  debug: false          // Enable WASM debug mode
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `modules` | array | [] | Array of WASM module configurations. |
| `sharedMemory` | boolean | false | Whether modules share memory space. |
| `debug` | boolean | false | Enable debug mode for WASM modules. |

#### Module Configuration

Each WASM module can be configured with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | A unique identifier for the module. |
| `path` | string | Yes | Path to the WASM file, relative to the project root. |
| `memorySize` | number | No | Initial memory size in pages (64KB each). Default is 16. |
| `functions` | string[] | No | List of exported functions to use (for documentation). |
| `autoload` | boolean | No | Whether to load the module at startup. Default is false. |
| `imports` | object | No | Custom import object for the WebAssembly module. |

### GitHub Integration

The `github` property configures GitHub-specific behavior:

```typescript
github: {
  permissions: {
    issues: "write",
    contents: "read",
    pull_requests: "write"
  },
  defaultLabels: [
    {
      name: "bug",
      color: "d73a4a",
      description: "Something isn't working"
    },
    {
      name: "enhancement",
      color: "a2eeef",
      description: "New feature or request"
    }
  ],
  appId: 12345,  // GitHub App ID (if using GitHub App)
  privateKey: "${GITHUB_PRIVATE_KEY}"  // Reference to environment variable
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `permissions` | object | {} | GitHub token permissions required by the plugin. |
| `defaultLabels` | array | [] | Labels to ensure exist in the repository. |
| `appId` | number | null | GitHub App ID (if using GitHub App authentication). |
| `privateKey` | string | null | GitHub App private key (reference to environment variable). |

### Performance Optimization

The `optimization` property configures performance settings:

```typescript
optimization: {
  coldStart: {
    preloadModules: true,    // Preload WASM modules
    lazyLoadDependencies: true,  // Use dynamic imports for large dependencies
    initializeOnDemand: true     // Initialize components on demand
  },
  memory: {
    gcInterval: 1000,        // GC interval in milliseconds
    reuseBuffers: true,      // Reuse memory buffers
    maxCacheSize: 100        // Maximum cache size for memoization
  },
  execution: {
    batchSize: 10,           // Process items in batches of this size
    parallelLimit: 3,        // Maximum parallel operations
    throttle: {              // API throttling configuration
      rate: 5,               // Requests per second
      burst: 10              // Burst limit
    }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `coldStart.preloadModules` | boolean | false | Preload WASM modules at startup. |
| `coldStart.lazyLoadDependencies` | boolean | true | Use dynamic imports for dependencies. |
| `coldStart.initializeOnDemand` | boolean | true | Initialize components only when needed. |
| `memory.gcInterval` | number | 0 | Interval for forced garbage collection (0 to disable). |
| `memory.reuseBuffers` | boolean | false | Enable buffer pooling for WASM operations. |
| `memory.maxCacheSize` | number | 100 | Maximum cache size for memoization. |
| `execution.batchSize` | number | 10 | Process items in batches of this size. |
| `execution.parallelLimit` | number | 3 | Maximum parallel operations. |
| `execution.throttle` | object | null | API throttling configuration. |

### Logging and Diagnostics

The `logging` property configures logging behavior:

```typescript
logging: {
  level: "info",          // Log level
  format: "json",         // Log format (json or text)
  destination: "stdout",  // Where to send logs

  // Custom log settings for components
  components: {
    "wasm-bridge": "debug",
    "github-api": "warn"
  },

  metrics: {
    enabled: true,        // Enable performance metrics
    detailed: false       // Collect detailed metrics
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `level` | string | "info" | Default log level (error, warn, info, debug, trace). |
| `format` | string | "json" | Log format (json or text). |
| `destination` | string | "stdout" | Log destination (stdout, stderr, or file path). |
| `components` | object | {} | Component-specific log levels. |
| `metrics.enabled` | boolean | false | Enable performance metrics collection. |
| `metrics.detailed` | boolean | false | Collect detailed performance metrics. |

## Configuration Schema

The full TypeScript interface for the configuration object is:

```typescript
interface PluginConfig {
  // Core properties
  name: string;
  version: string;
  description: string;
  author: string;
  events: string[];
  outputs: {
    [key: string]: {
      description: string;
      type?: string;
    };
  };

  // Advanced properties (all optional)
  runtime?: {
    nodeVersion?: string;
    timeout?: number;
    memory?: number;
    environment?: Record<string, string>;
    entryPoint?: string;
  };

  wasm?: {
    modules?: Array<{
      name: string;
      path: string;
      memorySize?: number;
      functions?: string[];
      autoload?: boolean;
      imports?: Record<string, any>;
    }>;
    sharedMemory?: boolean;
    debug?: boolean;
  };

  github?: {
    permissions?: Record<string, "read" | "write">;
    defaultLabels?: Array<{
      name: string;
      color: string;
      description?: string;
    }>;
    appId?: number;
    privateKey?: string;
  };

  optimization?: {
    coldStart?: {
      preloadModules?: boolean;
      lazyLoadDependencies?: boolean;
      initializeOnDemand?: boolean;
    };
    memory?: {
      gcInterval?: number;
      reuseBuffers?: boolean;
      maxCacheSize?: number;
    };
    execution?: {
      batchSize?: number;
      parallelLimit?: number;
      throttle?: {
        rate: number;
        burst: number;
      };
    };
  };

  logging?: {
    level?: "error" | "warn" | "info" | "debug" | "trace";
    format?: "json" | "text";
    destination?: string;
    components?: Record<string, "error" | "warn" | "info" | "debug" | "trace">;
    metrics?: {
      enabled?: boolean;
      detailed?: boolean;
    };
  };
}
```

## Environment Variables

### Built-in Variables

The following environment variables are automatically available to your plugin:

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub API token with permissions defined in your config. |
| `GITHUB_EVENT_NAME` | Name of the GitHub event that triggered the action. |
| `GITHUB_REPOSITORY` | The owner and repository name. |
| `GITHUB_WORKSPACE` | The GitHub workspace directory path. |
| `GITHUB_SHA` | The commit SHA that triggered the workflow. |
| `GITHUB_REF` | The branch or tag ref that triggered the workflow. |
| `GITHUB_HEAD_REF` | The head ref or source branch of the pull request. |
| `GITHUB_BASE_REF` | The base ref or target branch of the pull request. |

### Custom Variables

You can define custom environment variables in your GitHub workflow:

```yaml
# .github/workflows/my-workflow.yml
jobs:
  run-plugin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./
        with:
          debug: true
        env:
          CUSTOM_API_KEY: ${{ secrets.CUSTOM_API_KEY }}
          LOG_LEVEL: debug
```

These variables can be accessed in your plugin code:

```typescript
// Access environment variables
const apiKey = process.env.CUSTOM_API_KEY;
const logLevel = process.env.LOG_LEVEL || 'info';
```

## Configuration in Different Formats

### JavaScript (CommonJS)

```javascript
// plugin.config.js
module.exports = {
  name: "my-plugin",
  version: "1.0.0",
  description: "A GitHub Action plugin",
  author: "Your Name",
  events: ["issues.opened"],
  outputs: {
    result: {
      description: "Operation result"
    }
  }
};
```

### TypeScript

```typescript
// plugin.config.ts
import { PluginConfig } from '@action-optimizer/sdk';

const config: PluginConfig = {
  name: "my-plugin",
  version: "1.0.0",
  description: "A GitHub Action plugin",
  author: "Your Name",
  events: ["issues.opened"],
  outputs: {
    result: {
      description: "Operation result"
    }
  }
};

export default config;
```

### JavaScript (ES Modules)

```javascript
// plugin.config.js
export default {
  name: "my-plugin",
  version: "1.0.0",
  description: "A GitHub Action plugin",
  author: "Your Name",
  events: ["issues.opened"],
  outputs: {
    result: {
      description: "Operation result"
    }
  }
};
```

## Best Practices

### Minimizing Cold Start Time

```typescript
// Optimize for fast cold start
const config: PluginConfig = {
  // Basic configuration...

  optimization: {
    coldStart: {
      preloadModules: false,      // Only true for critical WASM modules
      lazyLoadDependencies: true, // Dynamically import heavy dependencies
      initializeOnDemand: true    // Initialize components only when needed
    }
  },

  wasm: {
    modules: [
      {
        name: "critical",
        path: "./wasm/critical.wasm",
        autoload: true           // Only autoload critical modules
      },
      {
        name: "nonCritical",
        path: "./wasm/non-critical.wasm",
        autoload: false          // Load on demand
      }
    ]
  }
};
```

### Configuring for Large Repositories

```typescript
// Optimize for large repositories
const config: PluginConfig = {
  // Basic configuration...

  runtime: {
    timeout: 180000,  // 3 minutes (for processing large repos)
    memory: 1024      // 1GB memory limit
  },

  optimization: {
    execution: {
      batchSize: 25,       // Process items in larger batches
      parallelLimit: 5     // More parallel operations
    }
  },

  wasm: {
    modules: [
      {
        name: "dataProcessor",
        path: "./wasm/data-processor.wasm",
        memorySize: 128    // More memory for large data sets
      }
    ]
  }
};
```

### Security Best Practices

```typescript
// Security-focused configuration
const config: PluginConfig = {
  // Basic configuration...

  github: {
    permissions: {
      // Only request permissions you actually need
      issues: "write",
      contents: "read"
      // Don't request unnecessary permissions like admin:repo
    }
  },

  runtime: {
    environment: {
      // Don't hardcode secrets - reference env vars
      API_ENDPOINT: "https://api.example.com",
      // Secrets should be injected via GitHub Secrets
    }
  }
};
```

## Configuration Validation

Our framework automatically validates your configuration at build time. You can also manually validate your configuration:

```bash
# Validate configuration
bun run validate-config
```

Common validation errors include:

- Missing required fields
- Invalid event name formats
- Incompatible permission settings
- Invalid WASM module paths

## Dynamic Configuration

You can use environment variables in your configuration to make it more flexible:

```typescript
const config: PluginConfig = {
  // Basic configuration...

  runtime: {
    timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 60000,
    memory: process.env.MEMORY ? parseInt(process.env.MEMORY) : 256
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
```

## Configuration Inheritance

For organizations with multiple plugins, you can create a base configuration:

```typescript
// base-config.ts
export const baseConfig = {
  author: "Your Organization",
  github: {
    permissions: {
      issues: "write",
      contents: "read"
    }
  },
  // Common configuration...
};

// plugin.config.ts
import { baseConfig } from './base-config';

export default {
  ...baseConfig,
  name: "specific-plugin",
  version: "1.0.0",
  description: "Specific plugin functionality",
  events: ["issues.opened"],
  // Plugin-specific configuration...
};
```

## Further Reading

- [Getting Started Guide](/getting-started/index.md)
- [WebAssembly Bridge API](/api/wasm-bridge.md)
- [GitHub Events Reference](/api/event-system.md)
- [Performance Optimization Guide](/performance/cold-start-optimization.md)
