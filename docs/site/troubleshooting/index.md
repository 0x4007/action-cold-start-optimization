# Troubleshooting Guide

This guide helps you diagnose and fix common issues when working with our WebAssembly-Optimized GitHub Actions framework.

## Common Issues

### Action Fails to Start

#### Symptoms
- GitHub Action shows "Failed" status without executing your code
- Error logs show initialization errors
- Action exits with code 1 immediately

#### Possible Causes and Solutions

1. **Missing Dependencies**
   - **Cause**: Required npm packages not included in your `package.json`
   - **Solution**: Make sure all dependencies are properly listed in your `package.json` and installed during the action workflow

   ```yml
   # Correct workflow example
   steps:
     - uses: actions/checkout@v3
     - uses: actions/setup-node@v3
       with:
         node-version: '16'
     - run: npm ci  # Install dependencies from package-lock.json
     - run: npm run build # Build your action
   ```

2. **Invalid Plugin Configuration**
   - **Cause**: Errors in your `plugin.config.js` or `plugin.config.ts` file
   - **Solution**: Validate your plugin configuration against the schema

   ```bash
   # Validate plugin configuration
   bun run validate-config
   ```

3. **WebAssembly Module Not Found**
   - **Cause**: Referenced WASM file can't be located
   - **Solution**: Check path configuration and ensure WASM files are included in your repository

   ```typescript
   // Correct WASM path configuration in plugin.config.ts
   wasm: {
     modules: [{
       name: "myModule",
       path: "./dist/wasm/module.wasm", // Relative to action root
       autoload: true
     }]
   }
   ```

### Cold Start Performance Issues

#### Symptoms
- Actions take a long time to start
- Timeouts on time-sensitive operations
- High latency between event and action response

#### Possible Causes and Solutions

1. **Too Many Dependencies**
   - **Cause**: Large dependency tree increasing load time
   - **Solution**: Trim unnecessary dependencies and use dynamic imports

   ```javascript
   // Only load heavy dependencies when needed
   async function processImages() {
     const imageProcessor = await import('heavy-image-library');
     return imageProcessor.process();
   }
   ```

2. **Inefficient WASM Loading**
   - **Cause**: Loading WASM modules unnecessarily or inefficiently
   - **Solution**: Use lazy loading and optimize WASM module size

   ```typescript
   // Only load WASM when needed
   let wasmModule = null;

   async function getWasmModule() {
     if (!wasmModule) {
       wasmModule = await WasmBridge.fromFile('./module.wasm');
     }
     return wasmModule;
   }
   ```

3. **Large Plugin Size**
   - **Cause**: Excessive code or assets increasing load time
   - **Solution**: Split code and use code-splitting techniques

   See our [Cold Start Optimization Guide](/performance/cold-start-optimization.md) for more detailed solutions.

### Memory-Related Crashes

#### Symptoms
- Action fails with "Out of memory" errors
- WASM throws memory access violations
- Process is killed by the GitHub Actions runner

#### Possible Causes and Solutions

1. **Memory Leaks in WASM**
   - **Cause**: Not freeing allocated memory in WebAssembly
   - **Solution**: Ensure proper memory management in your Rust/C++ code

   ```rust
   // In Rust, ensure resources are properly dropped
   #[wasm_bindgen]
   pub fn process_large_data(data: &[u8]) -> String {
       // Use scopes to ensure memory is freed
       {
           let temp_buffer = vec![0u8; 1024 * 1024];
           // Process data using temp_buffer
       } // temp_buffer is freed here

       // Return result
       "Success".to_string()
   }
   ```

2. **Buffer Overflows**
   - **Cause**: Writing beyond allocated memory boundaries
   - **Solution**: Add bounds checking and validate inputs

   ```rust
   // Check bounds before accessing memory
   #[wasm_bindgen]
   pub fn process_at_index(array_ptr: *mut u8, len: usize, index: usize) -> i32 {
       if index >= len {
           return -1; // Error code for out of bounds
       }

       // Safe to access memory
       unsafe {
           let array = std::slice::from_raw_parts_mut(array_ptr, len);
           array[index] = 42;
       }

       0 // Success
   }
   ```

3. **JavaScript Memory Pressure**
   - **Cause**: Creating too many objects without allowing garbage collection
   - **Solution**: Reduce object allocations and reuse objects when possible

   ```javascript
   // Reuse objects to reduce GC pressure
   const bufferPool = [];

   function getBuffer(size) {
     if (bufferPool.length > 0) {
       const buffer = bufferPool.pop();
       if (buffer.byteLength >= size) {
         return buffer;
       }
     }
     return new ArrayBuffer(size);
   }

   function releaseBuffer(buffer) {
     if (bufferPool.length < 10) { // Limit pool size
       bufferPool.push(buffer);
     }
   }
   ```

### GitHub API Rate Limiting

#### Symptoms
- Actions fail with 403 errors
- "API rate limit exceeded" errors in logs
- Intermittent failures on high-activity repositories

#### Possible Causes and Solutions

1. **Too Many API Calls**
   - **Cause**: Making excessive API requests without proper throttling
   - **Solution**: Implement request batching and caching

   ```javascript
   // Batch GitHub API requests
   async function getIssueLabels(issueNumbers) {
     const batchSize = 10;
     const results = [];

     for (let i = 0; i < issueNumbers.length; i += batchSize) {
       const batch = issueNumbers.slice(i, i + batchSize);
       const promises = batch.map(num =>
         context.octokit.issues.get({...context.repo, issue_number: num})
       );

       const responses = await Promise.all(promises);
       results.push(...responses.map(r => r.data));

       // Add delay between batches to avoid rate limiting
       if (i + batchSize < issueNumbers.length) {
         await new Promise(resolve => setTimeout(resolve, 1000));
       }
     }

     return results;
   }
   ```

2. **Inefficient API Usage**
   - **Cause**: Using multiple API calls when a single call would suffice
   - **Solution**: Use GraphQL for complex data requests

   ```javascript
   // Use GraphQL to get data in a single request
   async function getIssueDataEfficient(issueNumber) {
     const query = `
       query($owner: String!, $repo: String!, $number: Int!) {
         repository(owner: $owner, name: $repo) {
           issue(number: $number) {
             title
             body
             labels(first: 10) { nodes { name } }
             assignees(first: 5) { nodes { login } }
           }
         }
       }
     `;

     const variables = {
       owner: context.repo.owner,
       repo: context.repo.repo,
       number: issueNumber
     };

     const result = await context.octokit.graphql(query, variables);
     return result.repository.issue;
   }
   ```

3. **Missing Conditional Requests**
   - **Cause**: Not using ETags for conditional requests
   - **Solution**: Implement ETag caching to reduce rate limit impact

   ```javascript
   // Use ETags to reduce API calls
   const etags = {};

   async function fetchWithETag(url) {
     const options = {
       headers: {}
     };

     if (etags[url]) {
       options.headers['If-None-Match'] = etags[url];
     }

     const response = await context.octokit.request(`GET ${url}`, options);

     if (response.headers.etag) {
       etags[url] = response.headers.etag;
     }

     return response.data;
   }
   ```

## Debugging Techniques

### Enabling Debug Logs

Our framework includes extensive logging capabilities that can be enabled to help diagnose issues:

```yaml
# Enable debug logging in GitHub Actions workflow
name: My Action Workflow

on: [push, pull_request]

jobs:
  run-action:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run my action
        uses: ./
        with:
          debug: true  # Enable debug mode
          log-level: "verbose"  # Set log level
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

In local development, you can enable debugging with environment variables:

```bash
# Set debug environment variables
export ACTION_DEBUG=true
export ACTION_LOG_LEVEL=verbose

# Run your action locally
bun run dev
```

### Local Testing with Mock Events

Test your action locally using our built-in mock event system:

```bash
# Test with a mock issue event
bun run test-action --event=issues.opened --payload=./tests/fixtures/mock-events/issue-opened.json
```

Create mock event payloads for testing:

```json
// tests/fixtures/mock-events/issue-opened.json
{
  "action": "opened",
  "issue": {
    "number": 123,
    "title": "Test Issue",
    "body": "This is a test issue",
    "user": {
      "login": "testuser"
    },
    "labels": []
  },
  "repository": {
    "name": "test-repo",
    "owner": {
      "login": "test-org"
    }
  }
}
```

### Inspecting WebAssembly Execution

For debugging WebAssembly issues, use our WASM inspection tools:

```javascript
// Enable WASM debugging
import { WasmBridge } from '@action-optimizer/sdk';

async function debugWasm() {
  const bridge = await WasmBridge.fromFile('./module.wasm', {
    debug: true,
    traceMemory: true,
    breakOnError: true
  });

  // Log all function calls
  bridge.on('call', (funcName, args) => {
    console.log(`Calling ${funcName} with:`, args);
  });

  // Log memory allocations
  bridge.on('allocate', (ptr, size) => {
    console.log(`Allocated ${size} bytes at ${ptr}`);
  });

  // Execute function with tracing
  return bridge.call('analyzeText', 'Hello World');
}
```

You can also use the WebAssembly Binary Toolkit (WABT) to inspect WASM modules:

```bash
# Convert WASM to readable text format
wasm2wat ./dist/module.wasm -o module.wat

# Examine the output
cat module.wat
```

### Runtime Diagnostics

Capture runtime diagnostics using our metrics API:

```javascript
export default async function(event, context) {
  // Enable metrics collection
  context.metrics.enable();

  // Your plugin logic here
  const result = await processEvent(event);

  // Get performance metrics
  const metrics = context.metrics.getMetrics();
  console.log('Performance metrics:', JSON.stringify(metrics, null, 2));

  return result;
}
```

## Error Reference

Below is a reference of common error codes and their solutions:

| Error Code | Description | Solution |
|------------|-------------|----------|
| `WASM_INIT_FAILED` | Failed to initialize WebAssembly module | Check WASM file path and format |
| `MEMORY_ALLOCATION_FAILED` | Failed to allocate memory in WASM | Increase memory limits or reduce memory usage |
| `API_RATE_LIMIT` | GitHub API rate limit exceeded | Implement request batching and caching |
| `INVALID_EVENT_PAYLOAD` | Event payload does not match expected format | Validate event payload against schema |
| `MODULE_NOT_FOUND` | Required module could not be found | Check import paths and dependencies |
| `PERMISSION_DENIED` | Action lacks permission for operation | Ensure proper GitHub token permissions |
| `TIMEOUT` | Operation exceeded time limit | Optimize long-running operations |
| `TYPE_ERROR` | Type mismatch in function call | Ensure correct types when passing data between JS and WASM |

### Error: WASM_INIT_FAILED

This error occurs when a WebAssembly module fails to initialize.

**Causes:**
- Incorrect file path
- Corrupted WASM binary
- Missing WASM imports
- Incompatible WASM features

**Solutions:**
1. Verify file path in `plugin.config.ts`
2. Rebuild WASM module with compatible features
3. Check WASM module imports match JavaScript provided imports
4. Try a smaller, simpler WASM module to isolate the issue

**Example Fix:**
```typescript
// Check WASM module path
const wasmPath = path.resolve(__dirname, './wasm/module.wasm');
if (!fs.existsSync(wasmPath)) {
  throw new Error(`WASM module not found at: ${wasmPath}`);
}

// Provide correct imports
const importObject = {
  env: {
    memory: new WebAssembly.Memory({ initial: 10 }),
    log: (ptr, len) => {
      // Handle logging
    }
  }
};

// Initialize with correct imports
const bridge = await WasmBridge.fromFile(wasmPath, importObject);
```

### Error: MEMORY_ALLOCATION_FAILED

This error indicates a failure to allocate required memory in WebAssembly.

**Causes:**
- WebAssembly memory limit too low
- Memory leak in WASM code
- Attempting to allocate too much memory at once

**Solutions:**
1. Increase initial and maximum memory for WASM module
2. Find and fix memory leaks in Rust/C++ code
3. Implement chunking for large data processing

**Example Fix:**
```typescript
// Increase memory limits
const memory = new WebAssembly.Memory({
  initial: 100,  // 100 pages (6.4MB)
  maximum: 1000  // 1000 pages (64MB)
});

// Process large data in chunks
function processLargeData(data) {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const results = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    results.push(wasmModule.processChunk(chunk));
  }

  return combineResults(results);
}
```

## Logging and Diagnostics

### Log Levels

Our framework supports multiple log levels to control verbosity:

| Level | Description | Usage |
|-------|-------------|-------|
| `error` | Critical errors only | Production environments |
| `warn` | Warnings and errors | Standard environments |
| `info` | General information | Development environments |
| `debug` | Detailed debugging | Local development |
| `trace` | Extremely verbose | Advanced debugging |

Configure log levels in your plugin configuration:

```typescript
// plugin.config.ts
const config = {
  name: "my-plugin",
  version: "1.0.0",

  // Logging configuration
  logging: {
    level: "info", // Default log level
    format: "json", // Log format (json or text)
    destination: "stdout", // Where to send logs

    // Custom log settings for specific components
    components: {
      "wasm-bridge": "debug",
      "github-api": "warn"
    }
  }
};
```

### Structured Logging

For better analysis, use structured logging:

```javascript
// Structured logging
const logger = context.logger;

logger.info('Processing event', {
  eventName: context.eventName,
  action: event.payload.action,
  repository: context.repo,
  timestamp: new Date().toISOString()
});

// Log errors with context
try {
  await processIssue(issue);
} catch (error) {
  logger.error('Failed to process issue', {
    issueNumber: issue.number,
    error: error.message,
    stack: error.stack,
    context: 'issue-processing'
  });
}
```

### Performance Tracing

Enable performance tracing to diagnose bottlenecks:

```javascript
// Start performance tracing
context.trace.start('process-event');

// Add trace points
context.trace.mark('begin-analysis');
const result = analyzeEvent(event);
context.trace.mark('end-analysis');

// Add specific spans
context.trace.startSpan('api-call');
await callGitHubApi();
context.trace.endSpan('api-call');

// End trace and get results
context.trace.end('process-event');
const traceData = context.trace.getTraceData();

// Output trace data
console.log(JSON.stringify(traceData, null, 2));
```

### Diagnostic Commands

Our CLI includes diagnostic commands to help troubleshoot issues:

```bash
# Verify environment
bun run diagnose-env

# Check plugin configuration
bun run validate-config

# Test WASM modules
bun run test-wasm

# Benchmark performance
bun run benchmark

# Analyze bundle size
bun run analyze-bundle
```

## Getting Help

If you're still experiencing issues after trying the solutions in this guide:

1. Check our [GitHub Discussions](https://github.com/your-org/your-repo/discussions) for similar issues
2. Search for related issues in our [Issue Tracker](https://github.com/your-org/your-repo/issues)
3. Join our [Discord community](https://discord.gg/your-discord) for real-time help
4. Contact support at support@your-domain.com

When reporting issues, please include:

- A minimal reproduction of the issue
- Full error logs with debug mode enabled
- Your plugin configuration
- Details about your environment (Node.js version, OS, etc.)
