# GitHub Action with Optimized Cold Start Time

This GitHub Action is designed for plugin execution with WebAssembly optimization, featuring an optimized cold start time.

## Optimizations

This action has been optimized for the fastest possible cold start time:

1. **WebAssembly Inlining**: The WebAssembly binary is inlined as a base64 string directly in the JavaScript bundle, eliminating file I/O operations during startup.

2. **Optimized Environment Variable Handling**: Environment variables are processed in a single pass with reduced conditional checks.

3. **Rust Optimizations**:
   - Using `Box<str>` instead of `String` for better memory efficiency
   - Minimizing allocations and string formatting
   - Optimized panic hook initialization

4. **WebAssembly Compilation Optimizations**:
   - Aggressive size optimization with `opt-level = 'z'`
   - Link Time Optimization (LTO)
   - Reduced codegen units
   - Panic abort for smaller code size
   - Stripped debug symbols

5. **JavaScript Optimizations**:
   - Single-file bundle with all dependencies inlined
   - Tree-shaking to eliminate unused code
   - Minification for smaller bundle size
   - Optimized module loading sequence

6. **Build Process Optimizations**:
   - Additional `wasm-opt` optimizations when available
   - Streamlined build process

## Building the Action

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Rust](https://www.rust-lang.org/tools/install)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- [Bun](https://bun.sh/) (for optimized build)
- [wasm-opt](https://github.com/WebAssembly/binaryen) (optional, for additional optimizations)

### Standard Build

```bash
npm run build
```

### Optimized Build

For the fastest cold start time, use the optimized build:

```bash
npm run build:optimized
```

This will:
1. Compile the WebAssembly module with optimized settings
2. Apply additional wasm-opt optimizations if available
3. Inline the WebAssembly as a base64 string
4. Bundle everything into a single optimized file

## Usage

Add this action to your GitHub workflow:

```yaml
- name: Run Plugin
  uses: your-username/action-cold-start-optimization@main
  with:
    stateId: ${{ github.event.inputs.stateId }}
    eventName: ${{ github.event.inputs.eventName }}
    eventPayload: ${{ github.event.inputs.eventPayload }}
    settings: ${{ github.event.inputs.settings }}
    authToken: ${{ github.event.inputs.authToken }}
    ref: ${{ github.event.inputs.ref }}
    signature: ${{ github.event.inputs.signature }}
    command: ${{ github.event.inputs.command }}
    PLUGIN_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    KERNEL_PUBLIC_KEY: ${{ secrets.KERNEL_PUBLIC_KEY }}
    LOG_LEVEL: "info"
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
    USE_WASM: "true"
```

## Configuration

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `stateId` | State Id | Yes | - |
| `eventName` | Event Name | Yes | - |
| `eventPayload` | Event Payload | Yes | - |
| `settings` | Settings | Yes | - |
| `authToken` | Auth Token | Yes | - |
| `ref` | Ref | Yes | - |
| `signature` | The kernel signature | Yes | - |
| `command` | Command from the Kernel | No | - |
| `PLUGIN_GITHUB_TOKEN` | GitHub Token for plugin operations | Yes | - |
| `KERNEL_PUBLIC_KEY` | Kernel public key for verification | Yes | - |
| `LOG_LEVEL` | Logging level | No | "info" |
| `SUPABASE_URL` | Supabase URL | Yes | - |
| `SUPABASE_KEY` | Supabase Key | Yes | - |
| `USE_WASM` | Whether to use WebAssembly for faster execution | No | "true" |

## License

MIT
