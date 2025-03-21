# Memory Usage Optimization

This guide covers techniques for optimizing memory usage in your GitHub Actions plugins using our WebAssembly-optimized framework.

## Understanding Memory Usage

Memory is a critical resource in GitHub Actions. Effective memory management ensures your plugins run efficiently, avoid out-of-memory errors, and maintain performance as they scale to larger repositories or more complex tasks.

Key memory concepts in our framework:

1. **JavaScript Heap**: Memory used by JavaScript objects, functions, and closures
2. **WebAssembly Memory**: Linear memory used by WASM modules
3. **Buffer Allocations**: Memory used for data processing and transfer between JS and WASM
4. **GitHub API Cache**: Memory used to cache API responses

## Measuring Memory Usage

### Using Built-in Tools

Our framework provides built-in memory profiling:

```javascript
// Enable memory metrics
import { MemoryProfiler } from '@action-optimizer/sdk';

async function runPlugin(event, context) {
  // Start memory profiling
  const profiler = new MemoryProfiler();
  profiler.start();

  // Your plugin logic
  const result = await processEvent(event, context);

  // Get memory usage stats
  const memoryStats = profiler.getStats();
  console.log('Memory usage:', memoryStats);

  return result;
}
```

The `memoryStats` object provides detailed information:

```javascript
{
  // JavaScript memory
  jsHeapTotal: 24.5,       // Total JS heap size (MB)
  jsHeapUsed: 18.3,        // Used JS heap size (MB)
  jsExternalMemory: 3.2,   // External memory size (MB)

  // WebAssembly memory
  wasmMemory: {
    total: 8.0,            // Total WASM memory (MB)
    used: 5.4              // Used WASM memory (MB)
  },

  // Peak usage
  peakTotalMemory: 37.8,   // Peak total memory (MB)
  peakJsHeap: 22.6,        // Peak JS heap (MB)
  peakWasmMemory: 7.2,     // Peak WASM memory (MB)

  // Allocations
  allocations: {
    count: 1256,           // Number of allocations
    totalSize: 15.3,       // Total allocated size (MB)
    largestSize: 2.1       // Largest single allocation (MB)
  },

  // Garbage collection
  gc: {
    count: 12,             // Number of GC events
    totalTime: 341         // Total GC time (ms)
  }
}
```

### Debugging Memory Issues

For deeper investigation, you can use the memory snapshots feature:

```javascript
// Take memory snapshots
profiler.takeSnapshot('before-processing');

await processLargeDataset(data);

profiler.takeSnapshot('after-processing');

// Compare snapshots
const diff = profiler.compareSnapshots('before-processing', 'after-processing');
console.log('Memory difference:', diff);
```

## JavaScript Memory Optimization

### 1. Avoid Closures in Hot Paths

Closures can lead to memory leaks if not properly managed:

```javascript
// ❌ Potential memory leak with closure
function processItems(items) {
  let results = [];

  items.forEach(item => {
    // This closure captures 'results' array
    processAsync(item).then(result => {
      results.push(result);  // Modifies closed-over variable
    });
  });

  // Return happens before async operations complete
  return results;  // Likely empty or incomplete
}

// ✅ Better approach using Promise.all
async function processItems(items) {
  // No closure keeping 'results' alive longer than needed
  const results = await Promise.all(
    items.map(item => processAsync(item))
  );

  return results;
}
```

### 2. Reuse Objects and Buffers

Create object pools for frequently created and discarded objects:

```javascript
// Object pool for message processing
const messagePool = [];
const MAX_POOL_SIZE = 100;

function getMessage() {
  if (messagePool.length > 0) {
    return messagePool.pop();
  }
  return { content: '', metadata: {}, processed: false };
}

function releaseMessage(message) {
  // Clear message data
  message.content = '';
  message.metadata = {};
  message.processed = false;

  // Return to pool if not full
  if (messagePool.length < MAX_POOL_SIZE) {
    messagePool.push(message);
  }
}

// Usage
function processMessage(rawMessage) {
  const message = getMessage();
  message.content = rawMessage.content;
  message.metadata = rawMessage.metadata;

  // Process message
  doSomethingWith(message);

  // Return to pool
  releaseMessage(message);
}
```

### 3. Limit Cache Sizes

Always set maximum sizes for caches:

```javascript
// ❌ Unbounded cache can grow indefinitely
const resultCache = new Map();

function getCachedResult(key) {
  if (!resultCache.has(key)) {
    const result = computeExpensiveResult(key);
    resultCache.set(key, result);  // Cache grows without limits
  }
  return resultCache.get(key);
}

// ✅ LRU cache with size limit
import { LRUCache } from '@action-optimizer/sdk';

const resultCache = new LRUCache({
  maxSize: 100,  // Maximum entries
  maxAge: 30000  // Maximum age in ms (30 seconds)
});

function getCachedResult(key) {
  if (!resultCache.has(key)) {
    const result = computeExpensiveResult(key);
    resultCache.set(key, result);
  }
  return resultCache.get(key);
}
```

### 4. Use Streams for Large Data

Process large datasets using streams instead of loading everything into memory:

```javascript
// ❌ Loading entire file into memory
async function processLargeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');  // Loads entire file
  const lines = content.split('\n');

  for (const line of lines) {
    processLine(line);
  }
}

// ✅ Processing file as a stream
async function processLargeFile(filePath) {
  const fileStream = fs.createReadStream(filePath, {
    encoding: 'utf8',
    highWaterMark: 64 * 1024  // 64KB chunks
  });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    processLine(line);
  }
}
```

## WebAssembly Memory Optimization

### 1. Efficient Memory Management

Properly allocate and free memory in your Rust or C++ code:

```rust
// Rust example with proper memory management
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn process_data(data: &[u8]) -> Vec<u8> {
    // Memory is automatically managed by Rust
    let mut result = Vec::with_capacity(data.len());

    // Process data
    for byte in data {
        result.push(byte * 2);
    }

    // Rust automatically frees memory when result goes out of scope
    // after its ownership is transferred to JavaScript
    result
}
```

For manual memory management:

```rust
// Using memory allocator in Rust
#[wasm_bindgen]
pub struct Buffer {
    ptr: *mut u8,
    size: usize,
}

#[wasm_bindgen]
impl Buffer {
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize) -> Buffer {
        let ptr = unsafe { libc::malloc(size) as *mut u8 };
        Buffer { ptr, size }
    }

    #[wasm_bindgen]
    pub fn ptr(&self) -> u32 {
        self.ptr as u32
    }

    #[wasm_bindgen]
    pub fn size(&self) -> usize {
        self.size
    }

    #[wasm_bindgen]
    pub fn free(&mut self) {
        unsafe {
            if !self.ptr.is_null() {
                libc::free(self.ptr as *mut libc::c_void);
                self.ptr = std::ptr::null_mut();
                self.size = 0;
            }
        }
    }
}

// Drop implementation to prevent memory leaks
impl Drop for Buffer {
    fn drop(&mut self) {
        self.free();
    }
}
```

### 2. Reuse WebAssembly Memory

Our SDK provides memory management helpers:

```javascript
// Initialize a memory manager
import { WasmMemoryManager } from '@action-optimizer/sdk';

// Create memory manager with WebAssembly module
const memoryManager = new WasmMemoryManager(wasmModule);

// Create a buffer in WASM memory
const buffer = memoryManager.createBuffer(1024); // 1KB buffer

// Write data to the buffer
memoryManager.writeToBuffer(buffer, new Uint8Array([1, 2, 3, 4]));

// Use the buffer in a WASM function call
const result = wasmModule.processBuffer(buffer.ptr, buffer.size);

// Reuse the same buffer for another operation
memoryManager.writeToBuffer(buffer, new Uint8Array([5, 6, 7, 8]));
const result2 = wasmModule.processBuffer(buffer.ptr, buffer.size);

// Free the buffer when done
memoryManager.freeBuffer(buffer);
```

### 3. Batch Processing in WebAssembly

Process data in batches to control memory usage:

```javascript
// Break large processing into batches
async function processLargeDataset(dataset) {
  const batchSize = 1000;
  const results = [];

  // Create a reusable buffer
  const buffer = memoryManager.createBuffer(batchSize * ITEM_SIZE);

  for (let i = 0; i < dataset.length; i += batchSize) {
    const batch = dataset.slice(i, i + batchSize);

    // Write batch to buffer
    memoryManager.writeArrayToBuffer(buffer, batch);

    // Process batch
    const batchResults = wasmModule.processBatch(
      buffer.ptr,
      batch.length
    );

    results.push(...batchResults);

    // Allow GC and other processing between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Free buffer when done
  memoryManager.freeBuffer(buffer);

  return results;
}
```

### 4. Right-size WebAssembly Memory

Adjust your WebAssembly memory settings for your workload:

```typescript
// plugin.config.ts
const config = {
  // Basic configuration...

  wasm: {
    modules: [
      {
        name: "smallModule",
        path: "./wasm/small-module.wasm",
        memorySize: 1,  // 1 page (64KB) for small operations
        autoload: true
      },
      {
        name: "mediumModule",
        path: "./wasm/medium-module.wasm",
        memorySize: 16,  // 16 pages (1MB) for medium operations
        autoload: false
      },
      {
        name: "largeModule",
        path: "./wasm/large-module.wasm",
        memorySize: 256,  // 256 pages (16MB) for large data processing
        autoload: false
      }
    ]
  }
};
```

## GitHub API Optimization

### 1. Minimize API Response Storage

Only store what you need from API responses:

```javascript
// ❌ Storing entire response objects
async function getOpenIssues(context) {
  const response = await context.octokit.issues.listForRepo({
    ...context.repo,
    state: 'open'
  });

  // Stores all issue data including unnecessary fields
  return response.data;
}

// ✅ Extracting only needed fields
async function getOpenIssues(context) {
  const response = await context.octokit.issues.listForRepo({
    ...context.repo,
    state: 'open'
  });

  // Extract only the fields we need
  return response.data.map(issue => ({
    number: issue.number,
    title: issue.title,
    author: issue.user.login,
    labels: issue.labels.map(label => label.name)
  }));
}
```

### 2. Implement Pagination Properly

Process large datasets page by page instead of all at once:

```javascript
// ❌ Fetching all pages at once
async function getAllIssues(context) {
  const issues = await context.octokit.paginate(
    context.octokit.issues.listForRepo,
    {
      ...context.repo,
      per_page: 100
    }
  );

  // All issues are loaded into memory at once
  return processIssues(issues);
}

// ✅ Processing pages one at a time
async function getAllIssues(context) {
  const results = [];

  // Process each page as it arrives
  await context.octokit.paginate(
    context.octokit.issues.listForRepo,
    {
      ...context.repo,
      per_page: 100
    },
    (response, done) => {
      // Process the current page
      const pageResults = processIssuePage(response.data);
      results.push(...pageResults);

      // Optionally stop pagination early
      if (someCondition) {
        done();
      }

      return response.data;
    }
  );

  return results;
}
```

### 3. Use Conditional Requests

Take advantage of GitHub's ETag support to reduce payload sizes:

```javascript
// Implement ETag caching
const etagCache = new Map();

async function getRepoDataWithEtag(context, repo) {
  const cacheKey = `${repo.owner}/${repo.repo}`;
  const cachedData = etagCache.get(cacheKey);

  const options = {
    headers: {}
  };

  // Add If-None-Match header if we have an ETag
  if (cachedData && cachedData.etag) {
    options.headers['If-None-Match'] = cachedData.etag;
  }

  try {
    const response = await context.octokit.repos.get({
      owner: repo.owner,
      repo: repo.repo,
      ...options
    });

    // Update cache with new data and ETag
    etagCache.set(cacheKey, {
      data: response.data,
      etag: response.headers.etag
    });

    return response.data;
  } catch (error) {
    if (error.status === 304 && cachedData) {
      // Not modified, use cached data
      return cachedData.data;
    }
    throw error;
  }
}
```

## Memory Optimization Patterns

### 1. Producer-Consumer Pattern

For processing large datasets:

```javascript
async function processLargeDataset(items) {
  // Create a queue with limited size
  const queue = new BoundedQueue(100);

  // Start producer (doesn't wait for consumers)
  const producer = (async () => {
    for (const item of items) {
      await queue.enqueue(item);
    }
    await queue.complete();
  })();

  // Start consumers
  const consumers = Array(3).fill(0).map(async () => {
    let result = [];
    while (!queue.isDone()) {
      const item = await queue.dequeue();
      if (item) {
        const processed = await processItem(item);
        result.push(processed);
      }
    }
    return result;
  });

  // Wait for all consumers to finish
  const results = await Promise.all(consumers);
  await producer;

  // Combine results
  return results.flat();
}
```

### 2. Incremental Processing

Break large tasks into smaller chunks:

```javascript
async function analyzeRepository(context) {
  const results = {
    issues: null,
    pullRequests: null,
    codeStats: null
  };

  // Process in chunks with breaks between
  await processChunk(async () => {
    results.issues = await analyzeIssues(context);
  });

  await processChunk(async () => {
    results.pullRequests = await analyzePullRequests(context);
  });

  await processChunk(async () => {
    results.codeStats = await analyzeCode(context);
  });

  return results;
}

// Helper to process chunks with forced GC opportunity
async function processChunk(fn) {
  // Run the chunk
  await fn();

  // Allow for GC between chunks
  await new Promise(resolve => setTimeout(resolve, 10));

  // Optionally force GC if available
  if (global.gc) {
    global.gc();
  }
}
```

### 3. Streaming JSON Processing

Parse large JSON payloads incrementally:

```javascript
// Using a streaming JSON parser for large files
import { JSONParser } from 'stream-json/Parser';
import { streamArray } from 'stream-json/streamers/StreamArray';
import fs from 'fs';

async function processLargeJson(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    const pipeline = fs.createReadStream(filePath)
      .pipe(new JSONParser())
      .pipe(streamArray());

    pipeline.on('data', data => {
      const item = data.value;
      // Process each JSON array item individually
      const processed = processItem(item);
      results.push(processed);
    });

    pipeline.on('end', () => {
      resolve(results);
    });

    pipeline.on('error', err => {
      reject(err);
    });
  });
}
```

## Optimizing for Different Resource Tiers

Adjust your strategy based on the GitHub Actions resource tier:

### 1. Standard (2-core, 8GB RAM)

```typescript
// Configuration for standard resources
const config = {
  // Basic configuration...

  optimization: {
    memory: {
      maxCacheSize: 50,        // Smaller caches
      reuseBuffers: true
    },
    execution: {
      batchSize: 25,           // Smaller batch size
      parallelLimit: 2         // Fewer parallel operations
    }
  }
};
```

### 2. Larger Runners (4-core, 16GB RAM)

```typescript
// Configuration for larger resources
const config = {
  // Basic configuration...

  optimization: {
    memory: {
      maxCacheSize: 200,       // Larger caches
      reuseBuffers: true
    },
    execution: {
      batchSize: 100,          // Larger batch size
      parallelLimit: 4         // More parallel operations
    }
  }
};
```

## Detecting Memory Issues

Our framework includes mechanisms to detect potential memory issues:

```javascript
// Configure memory monitoring
import { configureMemoryMonitoring } from '@action-optimizer/sdk';

configureMemoryMonitoring({
  warningThreshold: 0.7,      // Warning at 70% memory usage
  criticalThreshold: 0.85,    // Critical warning at 85%
  checkInterval: 5000,        // Check every 5 seconds
  onWarning: (stats) => {
    console.warn('Memory usage high:', stats);
    // Optionally take action to reduce memory pressure
  },
  onCritical: (stats) => {
    console.error('Memory usage critical:', stats);
    // Take emergency action (cancel non-essential operations)
  }
});
```

## Best Practices Summary

1. **Measure Before Optimizing**: Use memory profiling to identify actual bottlenecks
2. **Reuse Objects and Buffers**: Implement object pools for frequently created items
3. **Process Data Incrementally**: Break large tasks into smaller chunks
4. **Limit Cache Sizes**: Always set maximum limits on caches
5. **Use Streams**: Process large data as streams rather than loading it all at once
6. **Optimize GitHub API Usage**: Only store necessary fields from API responses
7. **Right-size WebAssembly Memory**: Configure appropriate memory limits for your modules
8. **Implement Proper Pagination**: Process GitHub API results page by page
9. **Release Resources Promptly**: Free buffers and other resources when done
10. **Monitor Memory Usage**: Use the framework's memory monitoring capabilities

## Troubleshooting Memory Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| Action fails with "JavaScript heap out of memory" | JavaScript memory limit exceeded | Use incremental processing, reduce batch sizes |
| Increasing memory usage over time | Memory leak in object references | Check for closed-over variables, implement object pooling |
| WebAssembly memory errors | Buffer overflow or memory not freed | Ensure proper memory management in Rust/C++ code |
| Performance degradation over time | Excessive GC activity | Reduce object churn, implement object reuse |
| Action fails on large repositories | Loading too much data at once | Implement pagination and streaming processing |

## Further Reading

- [Cold Start Optimization Guide](/performance/cold-start-optimization.md)
- [Size Optimization Guide](/performance/size-optimization.md)
- [Benchmarking Guide](/performance/benchmarking.md)
- [WebAssembly Bridge API](/api/wasm-bridge.md)
