# WebAssembly-Optimized GitHub Action

This GitHub Action is optimized for extremely fast cold start times using WebAssembly (WASM) technology.

## How It Works

This action uses a hybrid approach:

1. **WebAssembly Core**: The main processing logic is implemented in Rust and compiled to WebAssembly for near-native performance.
2. **JavaScript Bridge**: A thin JavaScript layer handles the GitHub Actions inputs and environment setup.
3. **Fallback Mode**: If WebAssembly is not available, the action falls back to a pure JavaScript implementation.

## Performance Benefits

- **Faster Cold Start**: WebAssembly modules load and execute faster than equivalent JavaScript code.
- **Reduced Memory Footprint**: WASM typically has a smaller memory footprint.
- **Near-Native Performance**: The core logic runs at near-native speeds.

## Usage

```yaml
name: Example Workflow

on:
  workflow_dispatch:
    inputs:
      stateId:
        description: "State Id"
      # ... other inputs

jobs:
  compute:
    name: "Run Plugin"
    runs-on: ubuntu-latest
    steps:
      - uses: your-org/your-action@main
        with:
          stateId: ${{ github.event.inputs.stateId }}
          # ... other inputs
          USE_WASM: "true"  # Optional, defaults to true
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| stateId | State Id | Yes | |
| eventName | Event Name | Yes | |
| eventPayload | Event Payload | Yes | |
| settings | Settings | Yes | |
| authToken | Auth Token | Yes | |
| ref | Ref | Yes | |
| signature | The kernel signature | Yes | |
| command | Command from the Kernel | No | |
| PLUGIN_GITHUB_TOKEN | GitHub Token for plugin operations | Yes | |
| KERNEL_PUBLIC_KEY | Kernel public key for verification | Yes | |
| LOG_LEVEL | Logging level | No | info |
| SUPABASE_URL | Supabase URL | Yes | |
| SUPABASE_KEY | Supabase Key | Yes | |
| USE_WASM | Whether to use WebAssembly for faster execution | No | true |

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Rust](https://www.rust-lang.org/tools/install)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

### Building

```bash
# Install dependencies
npm install

# Build the WebAssembly module
npm run build:wasm

# Build the TypeScript code
npm run build:ts

# Bundle everything together
npm run build:bundle

# Or build everything at once
npm run build
```

## How It Optimizes Cold Start Time

1. **Direct Execution**: Uses the `node20` runtime to directly execute the JavaScript entry point.
2. **WebAssembly Optimization**: Compiles the core logic to WebAssembly for faster parsing and execution.
3. **Minimal JavaScript Bridge**: Uses a thin JavaScript layer to handle inputs and environment setup.
4. **Optimized Bundle**: The final bundle is optimized for size and startup performance.

## License

MIT
