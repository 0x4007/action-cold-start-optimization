# WebAssembly Bridge API

The WebAssembly Bridge API provides the interface between JavaScript/TypeScript and WebAssembly modules in our framework. This guide documents the API methods, data passing techniques, and best practices for efficient JS-WASM communication.

## Overview

The WebAssembly Bridge serves as the communication layer between your JavaScript/TypeScript code and WebAssembly modules. It handles:

- Loading and initializing WASM modules
- Passing data between JavaScript and WASM
- Memory management
- Error handling and recovery
- Performance optimization

## Basic Usage

### Importing the Bridge

```typescript
// TypeScript
import { WasmBridge } from '@action-optimizer/sdk';

// JavaScript
const { WasmBridge } = require('@action-optimizer/sdk');
```

### Initializing the Bridge

```typescript
// Initialize with an existing WASM module
const bridge = new WasmBridge({
  module: wasmModule,
  memory: wasmMemory // Optional, will use module.memory if not provided
});

// Or load from a file path (initialized asynchronously)
const bridge = await WasmBridge.fromFile('./path/to/module.wasm');

// Or from a URL
const bridge = await WasmBridge.fromUrl('https://example.com/module.wasm');
```

### Calling WASM Functions

```typescript
// Simple function call
const result = bridge.call('add', 5, 3); // Calls the 'add' function in WASM

// Async function call
const asyncResult = await bridge.callAsync('processData', largeDataArray);
```

## API Reference

### Constructor

#### `new WasmBridge(options)`

Creates a new WebAssembly bridge instance.

**Parameters:**
- `options`: Bridge configuration object
  - `module`: WebAssembly module instance
  - `memory`: Optional WebAssembly memory instance
  - `importObject`: Optional import object for WebAssembly instantiation
  - `debug`: Boolean to enable debug mode (default: false)

**Returns:**
- A new `WasmBridge` instance

### Static Methods

#### `WasmBridge.fromFile(path, importObject?)`

Creates a bridge by loading a WASM module from a file.

**Parameters:**
- `path`: String path to the WASM file
- `importObject`: Optional import object

**Returns:**
- Promise resolving to a new `WasmBridge` instance

#### `WasmBridge.fromUrl(url, importObject?)`

Creates a bridge by loading a WASM module from a URL.

**Parameters:**
- `url`: URL to the WASM file
- `importObject`: Optional import object

**Returns:**
- Promise resolving to a new `WasmBridge` instance

#### `WasmBridge.fromBuffer(buffer, importObject?)`

Creates a bridge from a buffer containing WASM binary data.

**Parameters:**
- `buffer`: ArrayBuffer containing WASM binary
- `importObject`: Optional import object

**Returns:**
- Promise resolving to a new `WasmBridge` instance

### Instance Methods

#### `call(functionName, ...args)`

Calls a WASM function with the provided arguments.

**Parameters:**
- `functionName`: Name of the exported WASM function to call
- `...args`: Arguments to pass to the function

**Returns:**
- The result of the WASM function call

#### `callAsync(functionName, ...args)`

Calls a WASM function asynchronously, useful for long-running operations.

**Parameters:**
- `functionName`: Name of the exported WASM function to call
- `...args`: Arguments to pass to the function

**Returns:**
- Promise resolving to the result of the WASM function call

#### `getMemory()`

Gets the WebAssembly memory object.

**Returns:**
- WebAssembly.Memory instance

#### `getExports()`

Gets all exported functions from the WASM module.

**Returns:**
- Object containing all exports

#### `createBuffer(size)`

Creates a new buffer in the WASM memory.

**Parameters:**
- `size`: Size of buffer in bytes

**Returns:**
- Object with buffer information:
  - `ptr`: Pointer to the start of the buffer
  - `size`: Size of the buffer

#### `freeBuffer(ptr)`

Frees a previously allocated buffer.

**Parameters:**
- `ptr`: Pointer to the buffer to free

#### `writeToMemory(data, ptr, dataType?)`

Writes data to WASM memory.

**Parameters:**
- `data`: Data to write
- `ptr`: Pointer to memory location
- `dataType`: Optional type information (defaults to 'Uint8Array')

#### `readFromMemory(ptr, size, dataType?)`

Reads data from WASM memory.

**Parameters:**
- `ptr`: Pointer to memory location
- `size`: Number of bytes to read
- `dataType`: Optional type information (defaults to 'Uint8Array')

**Returns:**
- Data read from memory

#### `passString(str)`

Passes a JavaScript string to WASM memory.

**Parameters:**
- `str`: String to pass

**Returns:**
- Object with:
  - `ptr`: Pointer to string in memory
  - `len`: Length of the string in bytes

#### `readString(ptr, len)`

Reads a string from WASM memory.

**Parameters:**
- `ptr`: Pointer to string in memory
- `len`: Length of the string in bytes

**Returns:**
- JavaScript string

#### `passArray(array, elementType?)`

Passes a JavaScript array to WASM memory.

**Parameters:**
- `array`: Array to pass
- `elementType`: Type of array elements (default: 'i32')

**Returns:**
- Object with:
  - `ptr`: Pointer to array in memory
  - `len`: Length of the array

#### `readArray(ptr, len, elementType?)`

Reads an array from WASM memory.

**Parameters:**
- `ptr`: Pointer to array in memory
- `len`: Number of elements in the array
- `elementType`: Type of array elements (default: 'i32')

**Returns:**
- JavaScript array

#### `passObject(obj)`

Serializes and passes a JavaScript object to WASM memory.

**Parameters:**
- `obj`: Object to pass

**Returns:**
- Object with:
  - `ptr`: Pointer to serialized object in memory
  - `len`: Length of the serialized data

#### `readObject(ptr, len)`

Reads and deserializes an object from WASM memory.

**Parameters:**
- `ptr`: Pointer to serialized object in memory
- `len`: Length of the serialized data

**Returns:**
- JavaScript object

## Memory Management

### Automatic Memory Management

The WebAssembly Bridge provides automatic memory management for most operations:

```typescript
// The bridge automatically handles memory allocation and cleanup
const result = bridge.call('processText', 'Hello, World!');
```

### Manual Memory Management

For performance-critical applications or when handling large data volumes, manual memory management provides more control:

```typescript
// Manually allocate a buffer
const { ptr, size } = bridge.createBuffer(1024);

// Write data to the buffer
bridge.writeToMemory(myData, ptr);

// Call WASM function with the pointer
const result = bridge.call('processBuffer', ptr, myData.length);

// Free the buffer when done
bridge.freeBuffer(ptr);
```

## Data Type Mapping

The WebAssembly Bridge handles type conversions between JavaScript and WebAssembly:

| JavaScript Type | WebAssembly Type |
|-----------------|------------------|
| Number (integer) | i32, i64 |
| Number (float) | f32, f64 |
| Boolean | i32 (0/1) |
| String | i32 (pointer), i32 (length) |
| TypedArray | i32 (pointer), i32 (length) |
| Array | i32 (pointer), i32 (length) |
| Object | i32 (pointer), i32 (length) |

## Error Handling

The WebAssembly Bridge provides robust error handling:

```typescript
try {
  const result = bridge.call('riskyFunction', input);
  // Process result
} catch (error) {
  if (error instanceof WasmBridge.WasmError) {
    // Handle WASM-specific error
    console.error(`WASM error: ${error.message}, code: ${error.code}`);
  } else {
    // Handle other errors
    console.error(`Error calling WASM function: ${error.message}`);
  }
}
```

## Performance Optimization

### Reusing Memory

For repeated operations, reuse memory to avoid allocation overhead:

```typescript
// Allocate buffer once
const buffer = bridge.createBuffer(MAX_SIZE);

// Reuse for multiple operations
for (const item of items) {
  bridge.writeToMemory(item.data, buffer.ptr);
  const result = bridge.call('processItem', buffer.ptr, item.data.length);
  // Process result
}

// Free when completely done
bridge.freeBuffer(buffer.ptr);
```

### Batch Processing

Process multiple items in a single WASM call when possible:

```typescript
// ❌ Inefficient: Multiple WASM calls
for (const text of texts) {
  results.push(bridge.call('analyzeText', text));
}

// ✅ Efficient: Single WASM call with all data
const allResults = bridge.call('analyzeTexts', texts);
```

## Examples

### Basic Numerical Computation

```typescript
// JavaScript/TypeScript
import { WasmBridge } from '@action-optimizer/sdk';

async function initMath() {
  const bridge = await WasmBridge.fromFile('./math.wasm');

  // Call a simple WASM function
  const sum = bridge.call('add', 5, 3);
  console.log(`Sum: ${sum}`); // Output: Sum: 8

  // Call a more complex function
  const fibResult = bridge.call('fibonacci', 10);
  console.log(`Fibonacci(10): ${fibResult}`); // Output: Fibonacci(10): 55
}
```

### Text Processing

```typescript
// JavaScript/TypeScript
import { WasmBridge } from '@action-optimizer/sdk';

async function analyzeIssue(issueTitle, issueBody) {
  const bridge = await WasmBridge.fromFile('./text-analyzer.wasm');

  // Pass issue content to WASM for analysis
  const result = bridge.call('analyzeIssueContent', issueTitle, issueBody);

  return {
    sentiment: result.sentiment,
    category: result.category,
    urgency: result.urgency,
    keywords: result.keywords
  };
}
```

### Working with Complex Data

```typescript
// JavaScript/TypeScript
import { WasmBridge } from '@action-optimizer/sdk';

async function processCodeChanges(changes) {
  const bridge = await WasmBridge.fromFile('./code-analyzer.wasm');

  // Pass complex object to WASM
  const analysisResult = bridge.call('analyzeChanges', changes);

  return {
    complexity: analysisResult.complexity,
    riskyPatterns: analysisResult.riskyPatterns,
    suggestions: analysisResult.suggestions
  };
}
```

## WebAssembly Bridge Configuration

The WebAssembly Bridge can be configured in your `plugin.config.ts` file:

```typescript
// plugin.config.ts
import { PluginConfig } from '@action-optimizer/sdk';

const config: PluginConfig = {
  // Basic plugin configuration
  name: "my-plugin",
  version: "1.0.0",

  // WASM configuration
  wasm: {
    modules: [
      {
        name: "textAnalyzer",
        path: "./wasm/text-analyzer.wasm",
        memorySize: 16, // Initial memory in pages (64KB each)
        functions: [
          "analyzeText",
          "categorizeIssue",
          "extractKeywords"
        ],
        autoload: true // Load on plugin startup
      },
      {
        name: "codeAnalyzer",
        path: "./wasm/code-analyzer.wasm",
        memorySize: 32,
        functions: [
          "analyzeChanges",
          "calculateComplexity"
        ],
        autoload: false // Load on demand
      }
    ],
    // Global WASM options
    sharedMemory: false,
    debug: false
  }
};

export default config;
```

## Rust Integration

When working with Rust to create WebAssembly modules, use the `wasm-bindgen` crate to simplify integration:

```rust
// Rust (lib.rs)
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn analyze_text(text: &str) -> String {
    // Text analysis logic
    let sentiment = calculate_sentiment(text);
    let category = determine_category(text);

    // Return JSON result
    format!("{{\"sentiment\":{},\"category\":\"{}\"}}",
            sentiment, category)
}

#[wasm_bindgen]
pub fn calculate_complexity(code: &str) -> i32 {
    // Code complexity analysis
    // ...
    42 // Return complexity score
}
```

## Best Practices

1. **Minimize Crossing the JS-WASM Boundary**: Each call has overhead, so batch operations when possible
2. **Use Appropriate Data Types**: Numeric types have the least overhead
3. **Consider Memory Management**: For large data or frequent operations, manual memory management can improve performance
4. **Error Handling**: Always implement error handling for WASM operations
5. **Lazy Loading**: Load WASM modules on demand to improve startup performance
6. **Benchmark Both Ways**: Some operations are faster in JS, others in WASM - benchmark to find the sweet spot

## Troubleshooting

### Common Issues

1. **Memory Access Violations**
   - Problem: "Memory access out of bounds" errors
   - Solution: Ensure buffer sizes are adequate and pointers are valid

2. **Type Mismatches**
   - Problem: Unexpected results due to type conversion issues
   - Solution: Explicitly specify types when passing data between JS and WASM

3. **Performance Degradation**
   - Problem: Slow operations despite using WASM
   - Solution: Minimize boundary crossings and use appropriate data structures

## Further Reading

- [WASM Utils Documentation](/api/wasm-utils.md)
- [Cold Start Optimization Guide](/performance/cold-start-optimization.md)
- [Memory Usage Optimization](/performance/memory-usage.md)
- [Creating Rust WASM Modules Guide](/guides/rust-integration.md)
