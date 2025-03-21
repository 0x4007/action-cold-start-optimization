# Utility Functions

This guide documents the utility functions provided by our WebAssembly-Optimized GitHub Actions framework. These functions help with common tasks and provide consistent solutions to frequent challenges.

## String Utilities

### String Processing

```typescript
import { StringUtils } from '@action-optimizer/sdk';

// Check if string contains any of the keywords
const hasBugKeywords = StringUtils.containsAny(
  issueTitle,
  ['bug', 'error', 'crash', 'failed']
);

// Check if string matches pattern
const isVersionNumber = StringUtils.matches(
  text,
  /^v\d+\.\d+\.\d+$/
);

// Truncate long string with ellipsis
const truncated = StringUtils.truncate(
  description,
  100,
  '...'
);
```

### Text Analysis

```typescript
// Get Levenshtein edit distance between strings
const distance = StringUtils.levenshteinDistance('kitten', 'sitting');
// Output: 3

// Find common prefix of multiple strings
const prefix = StringUtils.commonPrefix([
  'prefixed-item-1',
  'prefixed-item-2',
  'prefixed-other'
]);
// Output: 'prefixed-'

// Extract keywords from text
const keywords = StringUtils.extractKeywords(
  'Important bug in the login system needs immediate attention'
);
// Output: ['important', 'bug', 'login', 'system', 'immediate', 'attention']
```

### Template Handling

```typescript
// Compile template with placeholders
const template = StringUtils.compileTemplate(
  'Hello, {{ name }}! Your PR #{{ pr }} has {{ count }} comments.'
);

// Render template with values
const message = template({
  name: 'John',
  pr: 123,
  count: 5
});
// Output: 'Hello, John! Your PR #123 has 5 comments.'
```

## Object Utilities

### Object Manipulation

```typescript
import { ObjectUtils } from '@action-optimizer/sdk';

// Deep clone an object
const cloned = ObjectUtils.deepClone(complexObject);

// Merge objects deeply
const merged = ObjectUtils.deepMerge(
  { a: 1, b: { c: 2 } },
  { b: { d: 3 }, e: 4 }
);
// Output: { a: 1, b: { c: 2, d: 3 }, e: 4 }

// Get nested property safely (without errors for missing paths)
const value = ObjectUtils.get(
  data,
  'repository.owner.login',
  'default-value'
);

// Set nested property, creating path if needed
ObjectUtils.set(
  config,
  'advanced.settings.timeout',
  5000
);

// Pick specific properties from object
const userInfo = ObjectUtils.pick(
  userData,
  ['id', 'name', 'email']
);

// Omit specific properties from object
const publicData = ObjectUtils.omit(
  userData,
  ['password', 'token', 'privateKey']
);
```

### Object Comparison

```typescript
// Deep equality check
const isEqual = ObjectUtils.isEqual(obj1, obj2);

// Check if object is subset of another
const isSubset = ObjectUtils.isSubset(
  { a: 1, b: 2 },
  { a: 1, b: 2, c: 3 }
);
// Output: true

// Find differences between objects
const diff = ObjectUtils.diff(
  { a: 1, b: 2, c: 3 },
  { a: 1, b: 5, d: 4 }
);
// Output: { b: [2, 5], c: [3, undefined], d: [undefined, 4] }
```

### Object Transformation

```typescript
// Transform all values using a function
const doubled = ObjectUtils.mapValues(
  { a: 1, b: 2, c: 3 },
  value => value * 2
);
// Output: { a: 2, b: 4, c: 6 }

// Transform keys using a function
const prefixed = ObjectUtils.mapKeys(
  { a: 1, b: 2 },
  key => `prefix_${key}`
);
// Output: { prefix_a: 1, prefix_b: 2 }

// Flatten nested object with path delimiter
const flat = ObjectUtils.flatten(
  { a: { b: { c: 1 } }, d: 2 }
);
// Output: { 'a.b.c': 1, 'd': 2 }

// Unflatten object with path delimiter
const nested = ObjectUtils.unflatten(
  { 'a.b.c': 1, 'd': 2 }
);
// Output: { a: { b: { c: 1 } }, d: 2 }
```

## Array Utilities

### Array Manipulation

```typescript
import { ArrayUtils } from '@action-optimizer/sdk';

// Chunk array into groups of specified size
const chunks = ArrayUtils.chunk([1, 2, 3, 4, 5], 2);
// Output: [[1, 2], [3, 4], [5]]

// Create array of unique values
const unique = ArrayUtils.unique([1, 2, 2, 3, 1, 4]);
// Output: [1, 2, 3, 4]

// Flatten nested arrays
const flattened = ArrayUtils.flatten([1, [2, [3, 4], 5]]);
// Output: [1, 2, 3, 4, 5]

// Group array items by a key or function
const grouped = ArrayUtils.groupBy(
  [
    { type: 'A', value: 1 },
    { type: 'B', value: 2 },
    { type: 'A', value: 3 }
  ],
  item => item.type
);
// Output: { A: [{ type: 'A', value: 1 }, { type: 'A', value: 3 }], B: [{ type: 'B', value: 2 }] }

// Sort by multiple properties
const sorted = ArrayUtils.sortBy(
  [
    { name: 'John', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 25 }
  ],
  [
    { key: 'age', direction: 'asc' },
    { key: 'name', direction: 'asc' }
  ]
);
// Output: [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 25 }, { name: 'John', age: 30 }]
```

### Array Comparison

```typescript
// Find intersection of arrays
const common = ArrayUtils.intersection([1, 2, 3], [2, 3, 4]);
// Output: [2, 3]

// Find difference between arrays
const diff = ArrayUtils.difference([1, 2, 3, 4], [2, 4]);
// Output: [1, 3]

// Check if array includes any of the values
const hasAny = ArrayUtils.includesAny([1, 2, 3], [3, 4, 5]);
// Output: true

// Check if array includes all of the values
const hasAll = ArrayUtils.includesAll([1, 2, 3, 4], [2, 4]);
// Output: true
```

### Array Statistics

```typescript
// Calculate sum of array
const sum = ArrayUtils.sum([1, 2, 3, 4, 5]);
// Output: 15

// Calculate average of array
const avg = ArrayUtils.average([1, 2, 3, 4, 5]);
// Output: 3

// Find minimum value
const min = ArrayUtils.min([3, 1, 4, 2]);
// Output: 1

// Find maximum value
const max = ArrayUtils.max([3, 1, 4, 2]);
// Output: 4

// Calculate percentile
const p90 = ArrayUtils.percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90);
// Output: 9
```

## File Utilities

```typescript
import { FileUtils } from '@action-optimizer/sdk';

// Get file extension
const ext = FileUtils.getExtension('document.pdf');
// Output: 'pdf'

// Check if path is a particular file type
const isSourceFile = FileUtils.isFileType(
  'src/utils.ts',
  ['js', 'ts', 'jsx', 'tsx']
);
// Output: true

// Create a glob matcher
const matcher = FileUtils.createGlobMatcher('**/*.{js,ts}');
const isMatch = matcher('src/utils.ts');
// Output: true

// Parse file path into components
const parts = FileUtils.parsePath('/path/to/file.txt');
// Output: { dir: '/path/to', base: 'file.txt', name: 'file', ext: '.txt' }

// Get relative path
const rel = FileUtils.relativePath('/base/dir', '/base/dir/sub/file.txt');
// Output: 'sub/file.txt'
```

## GitHub Utilities

### Issue and PR Processing

```typescript
import { GitHubUtils } from '@action-optimizer/sdk';

// Extract references from text (e.g. #123, username/repo#456)
const refs = GitHubUtils.extractReferences(
  'Fixes #123 and username/repo#456'
);
// Output: [{ type: 'issue', repo: null, number: 123 }, { type: 'issue', repo: 'username/repo', number: 456 }]

// Parse GitHub user mentions
const mentions = GitHubUtils.extractMentions(
  'Hey @user1 and @user2, please review'
);
// Output: ['user1', 'user2']

// Check if commenter is a collaborator
const isCollaborator = await GitHubUtils.isCollaborator(
  context,
  'username'
);

// Get combined status of PR checks
const checksStatus = await GitHubUtils.getChecksStatus(
  context,
  123 // PR number
);
// Output: 'success', 'failure', 'pending', or 'mixed'
```

### Label Management

```typescript
// Add labels if they don't exist yet
await GitHubUtils.ensureLabels(
  context,
  [
    { name: 'bug', color: 'ff0000', description: 'Bug reports' },
    { name: 'enhancement', color: '0000ff', description: 'Feature requests' }
  ]
);

// Add labels to issue/PR if not present
await GitHubUtils.addLabelsIfMissing(
  context,
  issueNumber,
  ['bug', 'priority:high']
);

// Remove specific labels
await GitHubUtils.removeLabels(
  context,
  issueNumber,
  ['needs-triage']
);

// Replace labels matching pattern
await GitHubUtils.replaceLabelsMatching(
  context,
  issueNumber,
  /^priority:/, // Regex to match
  'priority:medium' // New label
);
```

### Repository Navigation

```typescript
// Get default branch name
const defaultBranch = await GitHubUtils.getDefaultBranch(context);

// Check if file exists in repository
const exists = await GitHubUtils.fileExists(
  context,
  'path/to/file.md',
  'main' // Optional branch name
);

// Get file content from repository
const content = await GitHubUtils.getFileContent(
  context,
  'README.md',
  'main' // Optional branch name
);

// List directory contents
const files = await GitHubUtils.listDirectory(
  context,
  'src/components',
  'main' // Optional branch name
);
```

## Date and Time Utilities

```typescript
import { DateUtils } from '@action-optimizer/sdk';

// Format date for display
const formatted = DateUtils.format(
  new Date(),
  'YYYY-MM-DD HH:mm:ss'
);
// Output: '2025-03-21 17:30:45'

// Parse date from string
const date = DateUtils.parse(
  '2025-03-21',
  'YYYY-MM-DD'
);

// Calculate time difference in human readable format
const timeAgo = DateUtils.timeAgo(
  new Date(Date.now() - 3600000)
);
// Output: '1 hour ago'

// Check if date is within a time range
const isRecent = DateUtils.isWithin(
  someDate,
  { days: 7 } // Check if within last 7 days
);

// Add time to date
const futureDate = DateUtils.add(
  new Date(),
  { days: 3, hours: 5 }
);

// Get start/end of time period
const startOfWeek = DateUtils.startOf(new Date(), 'week');
const endOfMonth = DateUtils.endOf(new Date(), 'month');
```

## Validation Utilities

```typescript
import { ValidationUtils } from '@action-optimizer/sdk';

// Create a validator with rules
const validator = ValidationUtils.createValidator({
  name: { type: 'string', required: true, minLength: 2 },
  email: { type: 'string', format: 'email' },
  age: { type: 'number', min: 18, max: 120 },
  tags: { type: 'array', itemType: 'string', maxLength: 5 }
});

// Validate an object
const result = validator.validate({
  name: 'John',
  email: 'john@example.com',
  age: 30,
  tags: ['developer', 'github']
});
// Output: { valid: true, errors: [] }

// Individual validators
const isValidEmail = ValidationUtils.isEmail('user@example.com');
const isValidUrl = ValidationUtils.isUrl('https://github.com');
const isValidSemVer = ValidationUtils.isSemVer('1.2.3');
const isValidUuid = ValidationUtils.isUuid('550e8400-e29b-41d4-a716-446655440000');
```

## Performance Utilities

```typescript
import { PerformanceUtils } from '@action-optimizer/sdk';

// Measure execution time
const { result, duration } = await PerformanceUtils.measure(
  async () => {
    // Some expensive operation
    return await processData();
  }
);
console.log(`Operation took ${duration}ms`);

// Create a throttled function (max calls per time period)
const throttled = PerformanceUtils.throttle(
  (data) => {
    // Make API call with data
  },
  { limit: 5, interval: 1000 } // Max 5 calls per second
);

// Create a debounced function (wait until input stops changing)
const debouncedSearch = PerformanceUtils.debounce(
  (query) => {
    // Search with query
  },
  300 // Wait 300ms after last call
);

// Memorize expensive function results
const cachedFn = PerformanceUtils.memoize(
  (input) => {
    // Expensive calculation
    return expensiveComputation(input);
  },
  { maxSize: 100 } // Cache up to 100 results
);
```

## Error Handling Utilities

```typescript
import { ErrorUtils } from '@action-optimizer/sdk';

// Create typed error with metadata
const notFoundError = ErrorUtils.createError(
  'ResourceNotFound',
  'The requested resource was not found',
  { resourceId: 123, resourceType: 'Issue' }
);

// Safe error handling wrapper
const result = await ErrorUtils.tryOrNull(async () => {
  // Operation that might fail
  return await riskyOperation();
});
// Returns result or null if error occurred

// Retry function with exponential backoff
const result = await ErrorUtils.retry(
  async () => {
    // Operation that might occasionally fail
    return await unreliableOperation();
  },
  {
    retries: 3,
    minTimeout: 1000,
    factor: 2,
    onRetry: (error, attempt) => {
      console.log(`Retry ${attempt} after error: ${error.message}`);
    }
  }
);

// Safely parse JSON (returns null instead of throwing)
const data = ErrorUtils.parseJsonSafe('{"key": "value"}');
// Output: { key: 'value' }

const invalid = ErrorUtils.parseJsonSafe('not json');
// Output: null
```

## Integration with Other Libraries

Our utility functions seamlessly integrate with other libraries in the ecosystem:

```typescript
// With WebAssembly Bridge
import { WasmBridge, StringUtils, ArrayUtils } from '@action-optimizer/sdk';

async function analyzeText() {
  const bridge = await WasmBridge.fromFile('./text-analyzer.wasm');

  // Use string utils to preprocess text
  const text = StringUtils.normalizeWhitespace(rawText);

  // Call WASM function
  const results = bridge.call('analyzeText', text);

  // Use array utils to process results
  return ArrayUtils.sortBy(results, [
    { key: 'relevance', direction: 'desc' }
  ]);
}

// With GitHub Event Handling
import { GitHubUtils } from '@action-optimizer/sdk';

export default async function(event, context) {
  if (context.eventName === 'issues.opened') {
    const issueBody = event.payload.issue.body;

    // Extract references from issue body
    const references = GitHubUtils.extractReferences(issueBody);

    // Process each referenced issue
    for (const ref of references) {
      if (!ref.repo) {
        // Handle references to issues in same repo
        await processReference(context, ref.number);
      }
    }
  }
}
```

## Best Practices

### Effective Use of Utility Functions

1. **Prefer Built-in Utilities**: Our utilities are optimized for the GitHub Actions environment and tested for compatibility.

   ```typescript
   // ❌ Don't reinvent the wheel
   function customChunker(array, size) {
     const result = [];
     for (let i = 0; i < array.length; i += size) {
       result.push(array.slice(i, i + size));
     }
     return result;
   }

   // ✅ Use built-in utilities
   const chunks = ArrayUtils.chunk(array, size);
   ```

2. **Chain Utilities for Complex Operations**: Combine utility functions for powerful transformations.

   ```typescript
   const results = ArrayUtils.sortBy(
     ArrayUtils.unique(
       ArrayUtils.flatten(nestedArrays)
     ),
     [{ key: 'priority', direction: 'desc' }]
   );
   ```

3. **Avoid Excessive Utility Usage**: While utilities are convenient, excessive chaining can hurt readability.

   ```typescript
   // ❌ Too many nested utilities
   const value = ObjectUtils.get(
     ObjectUtils.pick(
       ObjectUtils.deepClone(data),
       ['user', 'settings']
     ),
     'user.preferences.theme',
     'default'
   );

   // ✅ Break into steps for clarity
   const userData = ObjectUtils.pick(data, ['user', 'settings']);
   const theme = ObjectUtils.get(userData, 'user.preferences.theme', 'default');
   ```

### Performance Considerations

1. **Be Mindful of Deep Operations**: Functions like `deepClone` and `deepMerge` can be expensive for large objects.

   ```typescript
   // ❌ Unnecessary deep clone
   const user = ObjectUtils.deepClone(userData);
   user.lastActive = new Date();

   // ✅ Shallow copy is sufficient
   const user = { ...userData, lastActive: new Date() };
   ```

2. **Use Memoization for Expensive Operations**: Cache results of pure functions that are called repeatedly.

   ```typescript
   const getComplexData = PerformanceUtils.memoize(
     (userId) => {
       // Expensive data retrieval and processing
       return complexDataOperation(userId);
     },
     { maxSize: 50 }
   );
   ```

3. **Batch GitHub API Operations**: Use the utility functions that batch operations to minimize API calls.

   ```typescript
   // Process issues in batches
   const issueNumbers = [101, 102, 103, 104, 105];
   const batches = ArrayUtils.chunk(issueNumbers, 2);

   for (const batch of batches) {
     await Promise.all(batch.map(num => processIssue(context, num)));
     // Add delay between batches
     await new Promise(resolve => setTimeout(resolve, 1000));
   }
   ```

## Troubleshooting

### Common Issues

1. **TypeError: Cannot read property 'X' of undefined**
   - Use `ObjectUtils.get` with a default value to safely access nested properties

2. **"Maximum call stack size exceeded" error**
   - Check for circular references when using deep operations like `deepClone`
   - Break recursive operations into smaller batches

3. **Unexpected utility behavior with custom objects**
   - Some utilities may not work as expected with objects that have custom prototypes
   - Convert to plain objects first: `const plainObj = JSON.parse(JSON.stringify(customObj))`

## Further Reading

- [Core SDK Reference](/api/core-sdk.md)
- [WebAssembly Bridge API](/api/wasm-bridge.md)
- [Configuration System](/api/configuration.md)
- [Performance Optimization Guide](/performance/cold-start-optimization.md)
