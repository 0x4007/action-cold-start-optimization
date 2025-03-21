# Development Environment

This guide will help you set up an efficient development environment for building WebAssembly-Optimized GitHub Actions plugins. A good development environment will help you code faster, debug more effectively, and build better plugins.

## Recommended Tools

### Core Tools

- **Node.js**: Version 16.x or higher
- **npm** or **bun** (recommended)
- **Git**: For version control
- **Visual Studio Code**: Recommended editor with extensions
- **GitHub CLI**: For interacting with GitHub repositories

### For Tier 2 Development (TypeScript)

- **TypeScript**: v4.5.0 or higher
- **ts-node**: For running TypeScript files directly

### For Tier 3 Development (Rust + WASM)

- **Rust**: Latest stable version
- **wasm-pack**: For building Rust to WebAssembly
- **cargo**: Rust package manager (comes with Rust)
- **rustfmt** and **clippy**: Rust formatting and linting tools

## Visual Studio Code Setup

Visual Studio Code (VS Code) provides an excellent development experience for building GitHub Actions plugins. Here are some recommended extensions and settings:

### Recommended Extensions

1. **ESLint**: JavaScript linting
2. **Prettier**: Code formatting
3. **GitHub Actions**: Syntax highlighting for GitHub Actions workflows
4. **REST Client**: For testing GitHub API calls
5. **Jest**: For running tests
6. **GitLens**: Enhanced Git capabilities
7. **WebAssembly**: For WebAssembly syntax highlighting and tooling

### Workspace Settings

Create a `.vscode/settings.json` file in your project with these recommended settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript"],
  "files.exclude": {
    "node_modules": true,
    "dist": false,
    ".github": false
  },
  "search.exclude": {
    "node_modules": true,
    "dist": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Project Structure

We recommend organizing your plugin project with the following structure:

```
my-plugin/
├── .github/                  # GitHub-specific files
│   └── workflows/            # GitHub workflow files
├── .vscode/                  # VS Code settings
├── src/                      # Source code
│   ├── index.js              # Main entry point
│   ├── handlers/             # Event handlers
│   │   └── issue-opened.js   # Handler for issues.opened event
│   └── utils/                # Utility functions
├── test/                     # Tests
│   ├── handlers/             # Handler tests
│   └── utils/                # Utility tests
├── package.json              # Package configuration
├── plugin.config.js          # Plugin configuration
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── .gitignore                # Git ignore file
└── README.md                 # Documentation
```

For Tier 2 (TypeScript) projects, add:

```
my-plugin/
├── tsconfig.json             # TypeScript configuration
├── src/
│   ├── index.ts              # Main entry point (TypeScript)
│   ├── types.ts              # Type definitions
│   └── ...
```

For Tier 3 (Rust + WASM) projects, add:

```
my-plugin/
├── wasm/                     # Rust and WebAssembly code
│   ├── Cargo.toml            # Rust package configuration
│   └── src/                  # Rust source code
│       └── lib.rs            # Rust library code
├── ...
```

## Development Workflow

Here's a recommended workflow for developing GitHub Actions plugins:

### 1. Setup

Start by creating a new plugin with our CLI tool:

```bash
mkdir my-plugin
cd my-plugin
npx @wasm-actions/create-plugin
```

### 2. Development Cycle

1. **Write code**: Implement your event handlers and utilities
2. **Test locally**: Use the development server to simulate events
3. **Iterate**: Refine your implementation based on test results

### 3. Testing

For local testing, use our development server:

```bash
npx @wasm-actions/dev-server
```

This will start a local server at `http://localhost:3000` with a dashboard for simulating GitHub webhook events.

### 4. Building

When you're ready to build your plugin:

```bash
npx @wasm-actions/build
```

This creates an optimized build in the `dist` directory and generates an `action.yml` file.

### 5. Testing in GitHub Actions

To test your plugin in a real GitHub Actions workflow:

1. Push your code to a GitHub repository
2. Create a workflow file in `.github/workflows/` that uses your action
3. Trigger the workflow to see your action in action

## Debugging Techniques

### Local Debugging

1. **Console Logging**: Use `console.log()` to output information
2. **Inspector Protocol**: Use `node --inspect` for Node.js debugging
3. **Development Server**: Use our development server's logging features

Example of enhanced logging:

```javascript
function handleEvent(event, context) {
  console.log('Event payload:', JSON.stringify(event.payload, null, 2));
  console.log('Context:', {
    repo: context.repo,
    event: context.event,
    actor: context.actor,
    inputs: context.inputs
  });

  // Your handler code...
}
```

### GitHub Actions Debugging

When debugging in GitHub Actions:

1. **Set the `ACTIONS_STEP_DEBUG` secret to `true` in your repository**
2. **Use debug logs**: Add `core.debug()` statements in your code
3. **Use workflow commands**: Output debug information using workflow commands

## Performance Analysis

To analyze the performance of your plugin:

1. **Enable timing logs**: Set `process.env.WASM_ACTIONS_TIMING=true`
2. **Measure cold start time**: Time the initialization phase
3. **Use the performance object**: `performance.mark()` and `performance.measure()`

Example of performance measurement:

```javascript
// Mark the start of an operation
performance.mark('start-operation');

// Perform the operation
const result = await performOperation();

// Mark the end and measure
performance.mark('end-operation');
performance.measure('operation-duration', 'start-operation', 'end-operation');

// Log the measurement
const measurement = performance.getEntriesByName('operation-duration')[0];
console.log(`Operation took: ${measurement.duration}ms`);
```

## Continuous Integration

We recommend setting up Continuous Integration for your plugin using GitHub Actions. Here's a sample workflow file:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

## Editor Configuration

### .editorconfig

Create an `.editorconfig` file to ensure consistent coding styles across different editors:

```
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## Next Steps

Now that you have set up your development environment, you're ready to start building more complex plugins. Check out the following resources:

- [API Reference](/api/) for detailed SDK documentation
- [Examples](/examples/) for inspiration and patterns
- [Guides](/guides/) for specific development scenarios

For specialized development tiers, refer to:
- [JavaScript Development](/guides/javascript-development) for Tier 1
- [TypeScript Development](/guides/typescript-development) for Tier 2
- [Rust Integration](/guides/rust-integration) for Tier 3
