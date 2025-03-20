# Next Steps for Implementation

This document outlines the immediate next steps for implementing Phase 1 of our developer experience roadmap for WebAssembly-optimized GitHub Actions.

## 1. Set Up Development Environment

### 1.1 Create Project Structure

```bash
# Create SDK directory structure
mkdir -p src/sdk
touch src/sdk/index.ts
touch src/sdk/events.ts
touch src/sdk/context.ts
touch src/sdk/environment.ts
touch src/sdk/wasm-bridge.ts
touch src/sdk/wasm-utils.ts

# Create template directories
mkdir -p templates/tier1-js/src/handlers
mkdir -p templates/tier2-ts/src/handlers
mkdir -p templates/tier3-rust/src/handlers
mkdir -p templates/tier3-rust/wasm/src
```

### 1.2 Set Up Build Pipeline

Update the build process to handle the new SDK structure:

```typescript
// build-sdk.ts
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

// Configuration
const DIST_DIR = './dist';
const SDK_DIST_DIR = './dist/sdk';
const TEMPLATES_DIR = './templates';

// Ensure the dist directories exist
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}
if (!existsSync(SDK_DIST_DIR)) {
  mkdirSync(SDK_DIST_DIR, { recursive: true });
}

// Build the SDK
async function buildSDK() {
  console.log('Building SDK...');

  try {
    await esbuild.build({
      entryPoints: ['./src/sdk/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: join(SDK_DIST_DIR, 'index.js'),
      minify: false,
      treeShaking: true,
      sourcemap: true,
      metafile: true,
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    // Generate TypeScript declaration files
    execSync('tsc --project tsconfig.sdk.json', { stdio: 'inherit' });

    console.log('SDK built successfully');
  } catch (error) {
    console.error('SDK build failed:', error);
    process.exit(1);
  }
}

// Build the templates
async function buildTemplates() {
  console.log('Building templates...');

  try {
    // Copy template files
    execSync(`cp -r ${TEMPLATES_DIR}/* ${DIST_DIR}/templates/`, { stdio: 'inherit' });

    console.log('Templates built successfully');
  } catch (error) {
    console.error('Templates build failed:', error);
    process.exit(1);
  }
}

// Main build function
async function build() {
  await buildSDK();
  await buildTemplates();
  console.log('Build completed successfully');
}

build().catch(console.error);
```

## 2. Implement Core SDK Components

### 2.1 Environment Module

First, implement the environment module to handle environment variables:

```typescript
// src/sdk/environment.ts
export interface PluginEnvironment {
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

/**
 * Maps GitHub Actions inputs to environment variables
 */
function mapInputsToEnvironment(): void {
  const envMappings: Record<string, string> = {
    INPUT_STATEID: 'STATE_ID',
    INPUT_EVENTNAME: 'EVENT_NAME',
    INPUT_EVENTPAYLOAD: 'EVENT_PAYLOAD',
    INPUT_SETTINGS: 'SETTINGS',
    INPUT_AUTHTOKEN: 'AUTH_TOKEN',
    INPUT_REF: 'REF',
    INPUT_SIGNATURE: 'SIGNATURE',
    INPUT_COMMAND: 'COMMAND',
    INPUT_PLUGIN_GITHUB_TOKEN: 'PLUGIN_GITHUB_TOKEN',
    INPUT_KERNEL_PUBLIC_KEY: 'KERNEL_PUBLIC_KEY',
    INPUT_LOG_LEVEL: 'LOG_LEVEL',
    INPUT_SUPABASE_URL: 'SUPABASE_URL',
    INPUT_SUPABASE_KEY: 'SUPABASE_KEY'
  };

  // Process all environment variables in a single loop
  for (const [inputKey, envKey] of Object.entries(envMappings)) {
    if (process.env[inputKey]) {
      process.env[envKey] = process.env[inputKey];
    }
  }
}

/**
 * Gets the environment variables for the plugin
 */
export function getEnvironment(): PluginEnvironment {
  // Ensure inputs are mapped to environment variables
  mapInputsToEnvironment();

  return {
    stateId: process.env.STATE_ID || '',
    eventName: process.env.EVENT_NAME || '',
    eventPayload: process.env.EVENT_PAYLOAD || '',
    settings: process.env.SETTINGS || '',
    authToken: process.env.AUTH_TOKEN || '',
    ref: process.env.REF || '',
    signature: process.env.SIGNATURE || '',
    command: process.env.COMMAND || '',
    pluginGithubToken: process.env.PLUGIN_GITHUB_TOKEN || '',
    kernelPublicKey: process.env.KERNEL_PUBLIC_KEY || '',
    logLevel: process.env.LOG_LEVEL || 'info',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || ''
  };
}
```

### 2.2 Update Rust WASM Module

Enhance the Rust WASM module to support the new utility functions:

```rust
// wasm/src/lib.rs
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;

// Initialize panic hook for better error messages
static mut PANIC_HOOK_INITIALIZED: bool = false;

#[wasm_bindgen(start)]
pub fn start() {
    // Only initialize the panic hook once
    unsafe {
        if !PANIC_HOOK_INITIALIZED {
            console_error_panic_hook::set_once();
            PANIC_HOOK_INITIALIZED = true;
        }
    }
}

// Parse JSON with optimized memory usage
#[wasm_bindgen(js_name = "parse_json")]
pub fn parse_json(json: &str) -> String {
    match serde_json::from_str::<Value>(json) {
        Ok(value) => serde_json::to_string(&value).unwrap_or_else(|_| "{}".to_string()),
        Err(e) => format!("{{\"error\":\"Failed to parse JSON: {}\"}}", e)
    }
}

// Validate payload against schema
#[wasm_bindgen(js_name = "validate_payload")]
pub fn validate_payload(schema: &str, payload: &str) -> i32 {
    let schema_result = serde_json::from_str::<Value>(schema);
    let payload_result = serde_json::from_str::<Value>(payload);

    if schema_result.is_err() || payload_result.is_err() {
        return 0; // Invalid
    }

    // Simple validation logic - can be enhanced with JSON Schema validation
    1 // Valid
}

// Compute hash of data
#[wasm_bindgen(js_name = "compute_hash")]
pub fn compute_hash(data: &str) -> String {
    use sha2::{Sha256, Digest};

    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let result = hasher.finalize();

    // Convert to hex string
    let hex: String = result.iter()
        .map(|b| format!("{:02x}", b))
        .collect();

    hex
}
```

## 3. Create Template Files

### 3.1 Tier 1 (JavaScript Only) Template

Create the base files for the JavaScript-only template:

```javascript
// templates/tier1-js/src/index.js
const { init, on } = require('@your-org/plugin-sdk');

// Load handlers
const handlers = require('./handlers');

// Initialize the SDK
async function main() {
  // Initialize the SDK with WebAssembly optimizations
  await init();

  // Register event handlers from the handlers directory
  for (const [event, handler] of Object.entries(handlers)) {
    on(event, handler);
  }

  console.log('Plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
```

```javascript
// templates/tier1-js/src/handlers/index.js
// Export all handlers
module.exports = {
  // Add your handlers here
  // Example: 'issues.opened': require('./issue-opened')
};
```

### 3.2 Tier 2 (TypeScript + WASM) Template

Create the base files for the TypeScript + WASM template:

```typescript
// templates/tier2-ts/src/index.ts
import { init, on } from '@your-org/plugin-sdk';
import { wasmConfig } from './wasm-config';

// Import handlers
import * as handlers from './handlers';

// Initialize the SDK
async function main() {
  // Initialize the SDK with custom WASM configuration
  await init({ wasm: wasmConfig });

  // Register event handlers
  for (const [event, handler] of Object.entries(handlers)) {
    on(event, handler);
  }

  console.log('Plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
```

```typescript
// templates/tier2-ts/src/wasm-config.ts
export const wasmConfig = {
  // Configure which operations should use WASM
  operations: {
    parseJSON: true,
    validatePayload: true,
    computeHash: true
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    logPerformance: true
  }
};
```

```typescript
// templates/tier2-ts/src/handlers/index.ts
// Export all handlers
export {
  // Add your handlers here
  // Example: issueOpened as 'issues.opened'
};
```

### 3.3 Tier 3 (Full Stack with Rust) Template

Create the base files for the Full Stack with Rust template:

```typescript
// templates/tier3-rust/src/index.ts
import { init, on } from '@your-org/plugin-sdk';

// Import handlers
import * as handlers from './handlers';

// Initialize the SDK
async function main() {
  // Initialize the SDK
  await init();

  // Register event handlers
  for (const [event, handler] of Object.entries(handlers)) {
    on(event, handler);
  }

  console.log('Plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
```

```rust
// templates/tier3-rust/wasm/src/lib.rs
use wasm_bindgen::prelude::*;

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

// Add your custom Rust functions here
// Example:
// #[wasm_bindgen(js_name = "process_data")]
// pub fn process_data(data: &str) -> String {
//     // Process data
//     format!("Processed: {}", data)
// }
```

```toml
# templates/tier3-rust/wasm/Cargo.toml
[package]
name = "plugin-wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
console_error_panic_hook = "0.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

## 4. Create Configuration System

### 4.1 Configuration Parser

Implement the configuration parser:

```typescript
// src/sdk/config.ts
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface PluginConfig {
  name: string;
  description: string;
  author: string;
  action: {
    icon?: string;
    color?: string;
    inputs: Record<string, {
      description: string;
      required: boolean;
      default?: string;
    }>;
    outputs?: Record<string, {
      description: string;
    }>;
  };
  optimization?: {
    useWasm: boolean;
    wasmFunctions?: string[];
    lazyLoad?: string[];
  };
  events: Record<string, string>;
}

/**
 * Loads and parses the plugin configuration
 */
export function loadConfig(configPath: string = './plugin.config.js'): PluginConfig {
  const resolvedPath = resolve(configPath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  try {
    // For JavaScript config
    if (resolvedPath.endsWith('.js')) {
      const config = require(resolvedPath);
      return validateConfig(config);
    }

    // For TypeScript config
    if (resolvedPath.endsWith('.ts')) {
      // This requires ts-node to be installed
      require('ts-node/register');
      const config = require(resolvedPath).default;
      return validateConfig(config);
    }

    // For JSON config
    if (resolvedPath.endsWith('.json')) {
      const configContent = readFileSync(resolvedPath, 'utf8');
      const config = JSON.parse(configContent);
      return validateConfig(config);
    }

    throw new Error(`Unsupported configuration file format: ${resolvedPath}`);
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error}`);
  }
}

/**
 * Validates the plugin configuration
 */
function validateConfig(config: any): PluginConfig {
  // Basic validation
  if (!config.name) {
    throw new Error('Configuration must include a name');
  }

  if (!config.description) {
    throw new Error('Configuration must include a description');
  }

  if (!config.author) {
    throw new Error('Configuration must include an author');
  }

  if (!config.action || !config.action.inputs) {
    throw new Error('Configuration must include action.inputs');
  }

  if (!config.events || Object.keys(config.events).length === 0) {
    throw new Error('Configuration must include at least one event handler');
  }

  // Set defaults for optional fields
  const validatedConfig: PluginConfig = {
    ...config,
    action: {
      ...config.action,
      icon: config.action.icon || 'code',
      color: config.action.color || 'blue',
      outputs: config.action.outputs || {},
    },
    optimization: config.optimization || {
      useWasm: true,
      wasmFunctions: [],
      lazyLoad: [],
    },
  };

  return validatedConfig;
}
```

### 4.2 Action.yml Generator

Implement the action.yml generator:

```typescript
// src/sdk/generators/action-generator.ts
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { PluginConfig } from '../config';
import * as yaml from 'js-yaml';

/**
 * Generates the action.yml file from the plugin configuration
 */
export function generateActionYml(config: PluginConfig, outputPath: string = './action.yml'): void {
  const actionConfig = {
    name: config.name,
    description: config.description,
    author: config.author,

    // Add branding if specified
    ...(config.action.icon && config.action.color ? {
      branding: {
        icon: config.action.icon,
        color: config.action.color,
      },
    } : {}),

    // Add inputs
    inputs: {
      // Standard inputs
      stateId: {
        description: 'State Id',
        required: true,
      },
      eventName: {
        description: 'Event Name',
        required: true,
      },
      eventPayload: {
        description: 'Event Payload',
        required: true,
      },
      settings: {
        description: 'Settings',
        required: true,
      },
      authToken: {
        description: 'Auth Token',
        required: true,
      },
      ref: {
        description: 'Ref',
        required: true,
      },
      signature: {
        description: 'The kernel signature',
        required: true,
      },
      command: {
        description: 'Command from the Kernel',
        required: false,
      },
      PLUGIN_GITHUB_TOKEN: {
        description: 'GitHub Token for plugin operations',
        required: true,
      },
      KERNEL_PUBLIC_KEY: {
        description: 'Kernel public key for verification',
        required: true,
      },
      LOG_LEVEL: {
        description: 'Logging level',
        required: false,
        default: 'info',
      },
      SUPABASE_URL: {
        description: 'Supabase URL',
        required: true,
      },
      SUPABASE_KEY: {
        description: 'Supabase Key',
        required: true,
      },
      USE_WASM: {
        description: 'Whether to use WebAssembly for faster execution',
        required: false,
        default: 'true',
      },

      // Custom inputs from config
      ...config.action.inputs,
    },

    // Add outputs if specified
    ...(Object.keys(config.action.outputs || {}).length > 0 ? {
      outputs: config.action.outputs,
    } : {}),

    // Run configuration
    runs: {
      using: 'node20',
      main: 'dist/index.js',
    },
  };

  // Convert to YAML
  const yamlContent = yaml.dump(actionConfig, {
    lineWidth: -1, // Don't wrap lines
    noRefs: true,
  });

  // Write to file
  writeFileSync(resolve(outputPath), yamlContent, 'utf8');
}
```

## 5. Testing Framework

### 5.1 Unit Tests

Create unit tests for the SDK components:

```typescript
// tests/sdk/events.test.ts
import { events, EventPayload } from '../../src/sdk/events';
import { PluginContext } from '../../src/sdk/context';

describe('Event System', () => {
  let mockContext: PluginContext;
  let mockPayload: EventPayload;

  beforeEach(() => {
    // Create mock context and payload
    mockContext = {
      github: {
        octokit: {} as any,
        repo: { owner: 'test-owner', repo: 'test-repo' },
        createComment: jest.fn(),
        createIssue: jest.fn(),
      },
      env: {
        stateId: 'test-state-id',
        eventName: 'test-event',
        eventPayload: '{}',
        settings: '{}',
        authToken: 'test-token',
        ref: 'test-ref',
        signature: 'test-signature',
        command: 'test-command',
        pluginGithubToken: 'test-github-token',
        kernelPublicKey: 'test-public-key',
        logLevel: 'info',
        supabaseUrl: 'test-supabase-url',
        supabaseKey: 'test-supabase-key',
      },
      utils: {
        parseJSON: jest.fn(),
        validatePayload: jest.fn(),
        computeHash: jest.fn(),
      },
      log: jest.fn(),
    };

    mockPayload = { test: 'payload' };
  });

  test('should register and trigger event handlers', async () => {
    const handler = jest.fn();

    // Register handler
    events.on('test-event', handler);

    // Trigger event
    await events.trigger('test-event', mockPayload, mockContext);

    // Check if handler was called
    expect(handler).toHaveBeenCalledWith(mockPayload, mockContext);
  });

  test('should register and trigger once handlers', async () => {
    const handler = jest.fn();

    // Register once handler
    events.once('test-event', handler);

    // Trigger event twice
    await events.trigger('test-event', mockPayload, mockContext);
    await events.trigger('test-event', mockPayload, mockContext);

    // Check if handler was called only once
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should unregister event handlers', async () => {
    const handler = jest.fn();

    // Register handler
    events.on('test-event', handler);

    // Unregister handler
    events.off('test-event', handler);

    // Trigger event
    await events.trigger('test-event', mockPayload, mockContext);

    // Check if handler was not called
    expect(handler).not.toHaveBeenCalled();
  });
});
```

### 5.2 Integration Tests

Create integration tests for the full SDK:

```typescript
// tests/integration/sdk.test.ts
import { init, on, getContext } from '../../src/sdk';
import { WASM_BASE64 } from '../../src/wasm-inline';

describe('SDK Integration', () => {
  beforeEach(() => {
    // Reset environment
    process.env = {
      ...process.env,
      STATE_ID: 'test-state-id',
      EVENT_NAME: 'test-event',
      EVENT_PAYLOAD: '{"test":"payload"}',
      SETTINGS: '{}',
      AUTH_TOKEN: 'test-token',
      REF: 'test-ref',
      SIGNATURE: 'test-signature',
      COMMAND: 'test-command',
      PLUGIN_GITHUB_TOKEN: 'test-github-token',
      KERNEL_PUBLIC_KEY: 'test-public-key',
      LOG_LEVEL: 'info',
      SUPABASE_URL: 'test-supabase-url',
      SUPABASE_KEY: 'test-supabase-key',
      USE_WASM: 'true',
    };
  });

  test('should initialize SDK and register event handlers', async () => {
    // Initialize SDK
    await init();

    // Get context
    const context = getContext();

    // Check if context is created
    expect(context).toBeDefined();
    expect(context.env.stateId).toBe('test-state-id');

    // Register event handler
    const handler = jest.fn();
    on('test-event', handler);

    // TODO: Trigger event and check if handler was called
  });

  test('should use WebAssembly for utility functions', async () => {
    // Initialize SDK
    await init();

    // Get context
    const context = getContext();

    // Use utility functions
    const json = '{"test":"value"}';
    const parsed = context.utils.parseJSON(json);

    // Check if parsed correctly
    expect(parsed).toEqual({ test: 'value' });
  });
});
```

## 6. Documentation

### 6.1 SDK Documentation

Create documentation for the SDK:

```markdown
# Plugin SDK Documentation

This document provides detailed information about the Plugin SDK for WebAssembly-optimized GitHub Actions.

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

## Event Types

The SDK provides TypeScript types for common GitHub webhook events:

```typescript
// Example: Issue Opened Event
interface IssueOpenedPayload extends EventPayload {
  issue: {
    number: number;
    title: string;
    body?: string;
    labels: Array<{
      name: string;
    }>;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}
```

## WebAssembly Optimization

The SDK uses WebAssembly to optimize performance-critical operations. You can configure which operations use WebAssembly through the `init` options.

```javascript
await init({
  wasm: {
    operations: {
      parseJSON: true,
      validatePayload: true,
      computeHash: true
    },
    monitoring: {
      enabled: true,
      logPerformance: true
    }
  }
});
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
```

## 7. Timeline for Phase 1

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 1 | Set up project structure, implement environment module | Project structure, environment.ts |
| 2 | Implement event system, context object | events.ts, context.ts |
| 3 | Implement WASM bridge, utility functions | wasm-bridge.ts, wasm-utils.ts |
| 4 | Update Rust WASM module | lib.rs with new utility functions |
| 5 | Implement configuration system | config.ts, action-generator.ts |
| 6 | Create template files for all tiers | Templates for Tier 1, 2, and 3 |
| 7 | Implement build pipeline | build-sdk.ts |
| 8 | Create unit tests | Unit tests for all SDK components |
| 9 | Create integration tests | Integration tests for the full SDK |
| 10 | Create documentation | SDK documentation, usage examples |
| 11 | Create sample plugins | Sample plugins for all tiers |
| 12 | Final testing and refinement | Production-ready SDK |
