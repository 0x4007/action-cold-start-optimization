# Size Optimization

This guide covers techniques for optimizing the size of your GitHub Actions plugins using our WebAssembly-optimized framework. Smaller plugin sizes lead to faster downloads, reduced storage requirements, and improved cold start times.

## Understanding Size Components

Your plugin's size consists of several components:

1. **JavaScript/TypeScript Code**: Your plugin's source code and dependencies
2. **WebAssembly Modules**: Compiled WASM binaries
3. **Static Assets**: Any additional files included in your plugin

## Measuring Plugin Size

### Using Built-in Tools

Our framework provides built-in size analysis:

```bash
# Run size analysis
bun run analyze-size
```

This generates a detailed breakdown of your plugin's size components:

```
📊 Plugin Size Analysis
┌─────────────────────┬──────────┬───────────┐
│ Component           │ Size     │ % of Total│
├─────────────────────┼──────────┼───────────┤
│ JavaScript Bundle   │ 245.3 KB │ 68.2%     │
│ WebAssembly Modules │ 108.7 KB │ 30.3%     │
│ Static Assets       │   5.4 KB │  1.5%     │
├─────────────────────┼──────────┼───────────┤
│ Total               │ 359.4 KB │ 100.0%    │
└─────────────────────┴──────────┴───────────┘

📦 Dependency Breakdown
┌─────────────────────┬──────────┬───────────┐
│ Package             │ Size     │ % of JS   │
├─────────────────────┼──────────┼───────────┤
│ lodash              │  72.4 KB │ 29.5%     │
│ @octokit/rest      │  45.2 KB │ 18.4%     │
│ @octokit/graphql   │  28.1 KB │ 11.5%     │
│ your-plugin-code    │  22.6 KB │  9.2%     │
│ other-dependencies  │  77.0 KB │ 31.4%     │
└─────────────────────┴──────────┴───────────┘

⚠️ Size Optimization Opportunities:
- Large dependency: lodash (72.4 KB) - Consider using individual imports or alternatives
- WASM module optimization: Potential 25KB reduction with wasm-opt
- Unused code detected in src/utils/legacy-helpers.js (2.3 KB)
```

You can also use the `size-limit` utility for more granular analysis:

```bash
# Install size-limit
bun add -D @size-limit/preset-small-lib @size-limit/webpack

# Configure size-limit in package.json
# ...

# Run analysis
bun run size-limit
```

## JavaScript Size Optimization

### 1. Tree Shake Your Dependencies

Tree shaking removes unused code from your dependencies:

```javascript
// ❌ Importing entire libraries
import _ from 'lodash';

// ✅ Import only what you need
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
```

Configure your bundler to enable tree shaking:

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true, // Mark unused exports
    minimize: true,    // Enable minimization
    sideEffects: true  // Respect sideEffects flag
  }
};
```

### 2. Use Micro Libraries

Replace large, general-purpose libraries with smaller alternatives:

```javascript
// ❌ Large utility library (lodash ~72KB)
import { isEqual } from 'lodash';

// ✅ Micro alternative (fast-deep-equal ~1KB)
import isEqual from 'fast-deep-equal';

// ❌ Full date library (moment ~230KB)
import moment from 'moment';
const formattedDate = moment().format('YYYY-MM-DD');

// ✅ Lighter alternative (date-fns ~13KB for specific imports)
import { format } from 'date-fns';
const formattedDate = format(new Date(), 'yyyy-MM-dd');
```

Common replacements:

| Large Library | Size | Smaller Alternative | Size |
|---------------|------|---------------------|------|
| Moment.js | ~230KB | date-fns (individual imports) | ~2-4KB per function |
| Lodash (full) | ~72KB | lodash-es (individual imports) | ~1-2KB per function |
| Axios | ~32KB | ky, redaxios, or native fetch | ~4-8KB |
| jQuery | ~87KB | Native DOM APIs | 0KB (built-in) |

### 3. Custom Imports Plugin

Create a babel plugin to automatically transform imports:

```javascript
// babel-plugin-transform-imports.js
module.exports = function({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === 'lodash') {
          const specifiers = path.node.specifiers;
          const imports = specifiers.map(specifier => {
            const importName = specifier.imported.name;
            // Create individual import for each lodash function
            return t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(importName))],
              t.stringLiteral(`lodash/${importName}`)
            );
          });
          path.replaceWithMultiple(imports);
        }
      }
    }
  };
};
```

### 4. Use Dead Code Elimination

Configure your build to eliminate unused code:

```javascript
// .babelrc
{
  "presets": [
    ["@babel/preset-env", {
      "modules": false
    }]
  ],
  "plugins": [
    "@babel/plugin-transform-runtime"
  ]
}
```

Mark code for conditional includes:

```javascript
// Conditionally include debug code
if (process.env.NODE_ENV !== 'production') {
  // This code will be removed in production builds
  setupDebugTools();
  validateComponents();
}
```

### 5. Code Splitting

For larger plugins, use dynamic imports to load features on demand:

```javascript
// Only load GitHub API helpers when needed
async function analyzeRepository(context) {
  // Dynamically load the module when needed
  const { analyzeIssues } = await import('./github/issue-analysis.js');
  return analyzeIssues(context);
}

// Lazy-load visualizations
async function visualizeResults(data) {
  // Only load charting library when needed
  const { createChart } = await import('./viz/charts.js');
  return createChart(data);
}
```

## WebAssembly Size Optimization

### 1. Optimize Rust Code Size

Configure your Cargo.toml for size optimization:

```toml
[profile.release]
opt-level = 'z'     # Optimize for size
lto = true          # Link time optimization
codegen-units = 1   # Smaller code generation units
panic = 'abort'     # Smaller panic handler
strip = true        # Strip symbols

# Optional: Use a smaller allocator
[dependencies]
wee_alloc = "0.4.5"
```

Initialize a smaller allocator:

```rust
// Use a smaller allocator
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
```

### 2. Minimize Exported Functions

Only export the functions you need:

```rust
// ❌ Exporting implementation details
#[wasm_bindgen]
pub fn internal_helper() { /* ... */ }

#[wasm_bindgen]
pub fn main_function() { /* ... */ }

// ✅ Only export necessary public interface
// Not exported, only used internally
fn internal_helper() { /* ... */ }

#[wasm_bindgen]
pub fn main_function() { /* ... */ }
```

### 3. Use wasm-opt for Post-Processing

Apply wasm-opt from the binaryen toolchain:

```bash
# Install binaryen
npm install -g binaryen

# Optimize for size
wasm-opt -Oz -o optimized.wasm input.wasm

# Optimize specific functions
wasm-opt -Oz --optimize-for-js -o optimized.wasm input.wasm
```

Configure your plugin to use wasm-opt automatically:

```javascript
// plugin.config.ts
const config = {
  // Basic configuration...

  build: {
    wasmOpt: {
      enabled: true,
      level: 'z',      // -Oz for max size optimization
      features: ['--enable-bulk-memory']
    }
  }
};
```

### 4. Avoid String Encoding/Decoding

Minimize string conversions between JS and WASM:

```rust
// ❌ Expensive string conversions
#[wasm_bindgen]
pub fn process_text(input: &str) -> String {
    // Process and return a string
    format!("Processed: {}", input)
}

// ✅ Use numeric types where possible
#[wasm_bindgen]
pub fn calculate_score(values: &[u32]) -> u32 {
    values.iter().sum()
}
```

For complex data, use more efficient serialization:

```rust
// Using more efficient binary serialization
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Analysis {
    score: u32,
    categories: Vec<String>,
}

#[wasm_bindgen]
pub fn analyze_data(data_ptr: *const u8, data_len: usize) -> *const u8 {
    // Parse input
    let input_bytes = unsafe { std::slice::from_raw_parts(data_ptr, data_len) };
    let input: Input = bincode::deserialize(input_bytes).unwrap();

    // Process data...
    let result = Analysis { /*...*/ };

    // Serialize result to binary format
    let result_bytes = bincode::serialize(&result).unwrap();

    // Return pointer to result bytes (managed elsewhere)
    return_bytes(&result_bytes)
}
```

## Bundle Optimization

### 1. Configure Bundle Minification

Use terser for JavaScript minification:

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // Basic configuration...
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            passes: 2,
            unsafe: true,
            pure_getters: true,
            drop_console: true,
          },
          mangle: true,
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
};
```

### 2. Use Asset Compression

Compress your plugin assets:

```javascript
// webpack.config.js
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  // Basic configuration...
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|wasm)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};
```

### 3. Chunk Optimization

Split your bundle intelligently:

```javascript
// webpack.config.js
module.exports = {
  // Basic configuration...
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 5,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
};
```

## Plugin-Specific Optimizations

### 1. Conditional Feature Loading

Load components conditionally based on event types:

```javascript
// plugin.config.ts
const config = {
  // Basic configuration...
  features: {
    issueAnalysis: {
      events: ['issues.opened', 'issues.edited'],
      module: './src/features/issue-analysis.js'
    },
    prAnalysis: {
      events: ['pull_request.opened', 'pull_request.synchronize'],
      module: './src/features/pr-analysis.js'
    }
  }
};

// Main entry point
export default async function(event, context) {
  const eventName = context.eventName;

  // Only load the needed feature module
  if (eventName.startsWith('issues.')) {
    const { analyzeIssue } = await import('./features/issue-analysis.js');
    return analyzeIssue(event, context);
  } else if (eventName.startsWith('pull_request.')) {
    const { analyzePR } = await import('./features/pr-analysis.js');
    return analyzePR(event, context);
  }

  return { status: 'ignored' };
}
```

### 2. WASM Feature Selection

Compile different WASM modules with only the needed features:

```rust
// Cargo.toml
[features]
default = ["text-analysis"]
text-analysis = []
code-analysis = []
image-processing = []

// Build different modules
# Basic version
cargo build --release --no-default-features

# With text analysis
cargo build --release --features text-analysis

# With code analysis
cargo build --release --features code-analysis
```

Configure your plugin to use the right modules:

```javascript
// plugin.config.ts
const config = {
  // Basic configuration...

  wasm: {
    modules: [
      {
        name: "textAnalyzer",
        path: "./wasm/text-analyzer.wasm",
        events: ["issues.opened", "issues.edited"],
        autoload: false
      },
      {
        name: "codeAnalyzer",
        path: "./wasm/code-analyzer.wasm",
        events: ["pull_request.opened", "pull_request.synchronize"],
        autoload: false
      }
    ]
  }
};
```

## Implementation Tiers and Size

Our framework supports different implementation tiers, each with trade-offs between features and size:

| Tier | Features | Approx. Size | Best For |
|------|----------|--------------|----------|
| JavaScript (Basic) | Core functionality | 50-150KB | Simple automation, basic responses |
| TypeScript (Standard) | Type safety, better organization | 100-250KB | Most GitHub Actions plugins |
| WASM-Enhanced | Performance critical operations in WebAssembly | 200-500KB | Processing repositories with large amounts of data |
| Full Rust+WASM | Maximum performance, advanced features | 500KB-1MB | Enterprise-grade plugins with complex analysis |

Choose the appropriate tier based on your plugin's requirements:

```javascript
// plugin.config.ts
const config = {
  // Basic configuration...

  tier: 'standard', // 'basic', 'standard', 'wasm-enhanced', or 'full-rust'

  // Tier-specific optimizations
  tierOptions: {
    standard: {
      treeshake: true,
      minify: true
    },
    'wasm-enhanced': {
      wasmOpt: true,
      lazyLoad: true
    }
  }
};
```

## Monitoring Size Growth

### 1. Size Limits

Set up size budgets in your project:

```json
// package.json
{
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "100 KB"
    },
    {
      "path": "dist/wasm/*.wasm",
      "limit": "150 KB"
    }
  ]
}
```

### 2. Size Tracking in CI

Track size changes over time in your CI pipeline:

```yaml
# .github/workflows/size-check.yml
name: Size Check

on:
  pull_request:
    branches: [main]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm ci
      - run: npm run build
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Real-World Examples

### Example 1: JavaScript Optimization

A simple issue labeler reduced from 180KB to 45KB:

| Component | Before | After | Technique |
|-----------|--------|-------|-----------|
| lodash | 72KB | 8KB | Replaced with individual imports |
| moment | 230KB | 0KB | Replaced with native Date API |
| octokit | 45KB | 32KB | Removed unused endpoint imports |
| Custom code | 5KB | 5KB | (unchanged) |
| **Total** | **352KB** | **45KB** | **87% reduction** |

### Example 2: WASM Optimization

A code complexity analyzer reduced from 850KB to 320KB:

| Component | Before | After | Technique |
|-----------|--------|-------|-----------|
| JavaScript | 150KB | 120KB | Tree shaking, micro-libraries |
| WASM module | 700KB | 200KB | wasm-opt, feature selection |
| **Total** | **850KB** | **320KB** | **62% reduction** |

## Best Practices Summary

1. **Measure First**: Use size analysis to identify the largest components
2. **Import Selectively**: Use specific imports instead of entire libraries
3. **Choose Micro-Libraries**: Replace large dependencies with smaller alternatives
4. **Optimize Rust Code**: Configure for size in Cargo.toml
5. **Apply Post-Processing**: Use wasm-opt for WebAssembly size reduction
6. **Enable Tree Shaking**: Configure build system properly
7. **Implement Code Splitting**: Load features on demand
8. **Track Size Growth**: Set up size budgets and CI checks

## Troubleshooting Size Issues

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Unexpectedly large bundle | Dependencies not being tree-shaken | Check imports, configure bundler correctly |
| Large WASM binary | Debug symbols, unoptimized Rust | Apply wasm-opt, configure Cargo.toml for size |
| Size regression | New dependency added | Audit dependencies, consider alternatives |
| Code splitting not working | Incorrect dynamic import syntax | Review dynamic imports, check bundler config |
| Slow cold start despite size optimization | Initialization overhead | See [Cold Start Optimization](/performance/cold-start-optimization.md) |

## Further Reading

- [Cold Start Optimization Guide](/performance/cold-start-optimization.md)
- [Memory Usage Optimization](/performance/memory-usage.md)
- [Benchmarking Guide](/performance/benchmarking.md)
- [WebAssembly Bridge API](/api/wasm-bridge.md)
