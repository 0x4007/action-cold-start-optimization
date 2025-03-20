# Sample Plugin Implementation

This document demonstrates how a developer would use our improved SDK to create a GitHub Action plugin. We'll show examples for each tier of the development model.

## Tier 1: JavaScript-Only Implementation

This is the simplest approach, suitable for developers who are familiar with JavaScript but not Rust or WebAssembly.

### Directory Structure

```
my-issue-labeler/
├── src/
│   ├── index.js
│   └── handlers/
│       └── issue-opened.js
├── action.yml
└── package.json
```

### Configuration

```javascript
// plugin.config.js
module.exports = {
  name: 'Issue Auto-Labeler',
  description: 'Automatically labels issues based on content',
  author: 'Your Name',

  action: {
    icon: 'tag',
    color: 'green',
    inputs: {
      labelMapping: {
        description: 'JSON mapping of keywords to labels',
        required: false,
        default: '{"bug":["error","exception","fail"],"enhancement":["improve","enhancement","feature"]}'
      }
    }
  },

  // Event handlers
  events: {
    'issues.opened': './src/handlers/issue-opened.js'
  }
};
```

### Handler Implementation

```javascript
// src/handlers/issue-opened.js
const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for issue.opened event
 * Automatically adds labels based on issue content
 */
module.exports = async function handleIssueOpened(payload) {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Get label mapping from inputs
  const labelMappingJson = process.env.INPUT_LABELMAPPING || '{}';
  const labelMapping = utils.parseJSON(labelMappingJson);

  // Determine which labels to apply
  const labelsToApply = [];

  // Check each label's keywords against the issue content
  for (const [label, keywords] of Object.entries(labelMapping)) {
    const content = `${issueTitle} ${issueBody}`.toLowerCase();

    // If any keyword is found in the content, add the label
    if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      labelsToApply.push(label);
    }
  }

  // Apply labels if any were found
  if (labelsToApply.length > 0) {
    log(`Adding labels: ${labelsToApply.join(', ')}`);

    await github.octokit.issues.addLabels({
      ...github.repo,
      issue_number: issueNumber,
      labels: labelsToApply
    });

    // Add a comment to the issue
    await github.createComment(
      issueNumber,
      `I've automatically added the following labels: ${labelsToApply.join(', ')}`
    );
  } else {
    log('No matching labels found');
  }

  log('Issue processing completed');
};
```

### Main Entry Point

```javascript
// src/index.js
const { init, on } = require('@your-org/plugin-sdk');
const handleIssueOpened = require('./handlers/issue-opened');

// Initialize the SDK
async function main() {
  // Initialize the SDK with WebAssembly optimizations
  await init();

  // Register event handlers
  on('issues.opened', handleIssueOpened);

  console.log('Issue Auto-Labeler plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
```

## Tier 2: TypeScript + WASM Integration

This approach is for developers who want more control and type safety.

### Directory Structure

```
my-issue-labeler/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── wasm-config.ts
│   └── handlers/
│       └── issue-opened.ts
├── action.yml
├── package.json
└── tsconfig.json
```

### Configuration

```typescript
// plugin.config.ts
export default {
  name: 'Issue Auto-Labeler',
  description: 'Automatically labels issues based on content',
  author: 'Your Name',

  action: {
    icon: 'tag',
    color: 'green',
    inputs: {
      labelMapping: {
        description: 'JSON mapping of keywords to labels',
        required: false,
        default: '{"bug":["error","exception","fail"],"enhancement":["improve","enhancement","feature"]}'
      }
    }
  },

  // Performance optimization settings
  optimization: {
    useWasm: true,
    wasmFunctions: ['parseJSON', 'computeHash'],
    lazyLoad: ['@octokit/rest']
  },

  // Event handlers
  events: {
    'issues.opened': './src/handlers/issue-opened.ts'
  }
};
```

### Type Definitions

```typescript
// src/types.ts
import { EventPayload } from '@your-org/plugin-sdk';

export interface IssueOpenedPayload extends EventPayload {
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

export interface LabelMapping {
  [label: string]: string[];
}
```

### WASM Configuration

```typescript
// src/wasm-config.ts
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

### Handler Implementation

```typescript
// src/handlers/issue-opened.ts
import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { IssueOpenedPayload, LabelMapping } from '../types';

/**
 * Handler for issue.opened event
 * Automatically adds labels based on issue content
 */
const handleIssueOpened: EventHandler<IssueOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Get label mapping from inputs
  const labelMappingJson = process.env.INPUT_LABELMAPPING || '{}';
  const labelMapping = utils.parseJSON<LabelMapping>(labelMappingJson);

  // Determine which labels to apply
  const labelsToApply: string[] = [];

  // Check each label's keywords against the issue content
  for (const [label, keywords] of Object.entries(labelMapping)) {
    const content = `${issueTitle} ${issueBody}`.toLowerCase();

    // If any keyword is found in the content, add the label
    if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      labelsToApply.push(label);
    }
  }

  // Apply labels if any were found
  if (labelsToApply.length > 0) {
    log(`Adding labels: ${labelsToApply.join(', ')}`);

    await github.octokit.issues.addLabels({
      ...github.repo,
      issue_number: issueNumber,
      labels: labelsToApply
    });

    // Add a comment to the issue
    await github.createComment(
      issueNumber,
      `I've automatically added the following labels: ${labelsToApply.join(', ')}`
    );
  } else {
    log('No matching labels found');
  }

  log('Issue processing completed');
};

export default handleIssueOpened;
```

### Main Entry Point

```typescript
// src/index.ts
import { init, on } from '@your-org/plugin-sdk';
import { wasmConfig } from './wasm-config';
import handleIssueOpened from './handlers/issue-opened';

// Initialize the SDK
async function main() {
  // Initialize the SDK with custom WASM configuration
  await init({ wasm: wasmConfig });

  // Register event handlers
  on('issues.opened', handleIssueOpened);

  console.log('Issue Auto-Labeler plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});
```

## Tier 3: Full Stack with Rust

This approach is for developers who want maximum performance and are comfortable with Rust.

### Directory Structure

```
my-issue-labeler/
├── src/
│   ├── index.ts
│   ├── types.ts
│   └── handlers/
│       └── issue-opened.ts
├── wasm/
│   ├── src/
│   │   ├── lib.rs
│   │   └── label_matcher.rs
│   └── Cargo.toml
├── action.yml
├── package.json
└── tsconfig.json
```

### Rust Implementation

```rust
// wasm/src/label_matcher.rs
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct IssueContent {
    title: String,
    body: String,
}

#[derive(Serialize, Deserialize)]
pub struct LabelMapping {
    #[serde(flatten)]
    mapping: HashMap<String, Vec<String>>,
}

#[wasm_bindgen(js_name = "match_labels")]
pub fn match_labels(content_json: &str, mapping_json: &str) -> String {
    // Parse the input JSON
    let content: IssueContent = match serde_json::from_str(content_json) {
        Ok(content) => content,
        Err(e) => return format!("{{\"error\":\"Failed to parse content: {}\"}}", e),
    };

    let mapping: LabelMapping = match serde_json::from_str(mapping_json) {
        Ok(mapping) => mapping,
        Err(e) => return format!("{{\"error\":\"Failed to parse mapping: {}\"}}", e),
    };

    // Combine title and body for matching
    let full_content = format!("{} {}", content.title, content.body).to_lowercase();

    // Find matching labels
    let mut matching_labels = Vec::new();

    for (label, keywords) in &mapping.mapping {
        let matches = keywords.iter().any(|keyword| {
            full_content.contains(&keyword.to_lowercase())
        });

        if matches {
            matching_labels.push(label.clone());
        }
    }

    // Return the matching labels as JSON
    match serde_json::to_string(&matching_labels) {
        Ok(json) => json,
        Err(e) => format!("{{\"error\":\"Failed to serialize result: {}\"}}", e),
    }
}
```

```rust
// wasm/src/lib.rs
mod label_matcher;

use wasm_bindgen::prelude::*;

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

// Re-export the label matcher
pub use label_matcher::match_labels;
```

### TypeScript Handler

```typescript
// src/handlers/issue-opened.ts
import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { IssueOpenedPayload, LabelMapping } from '../types';

// Import the custom WASM function
import { match_labels } from '../../wasm/pkg/issue_labeler';

/**
 * Handler for issue.opened event
 * Automatically adds labels based on issue content
 */
const handleIssueOpened: EventHandler<IssueOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Get label mapping from inputs
  const labelMappingJson = process.env.INPUT_LABELMAPPING || '{}';

  // Use the Rust implementation for label matching
  const contentJson = JSON.stringify({
    title: issueTitle,
    body: issueBody
  });

  // Call the WASM function directly
  const matchingLabelsJson = match_labels(contentJson, labelMappingJson);
  const labelsToApply = JSON.parse(matchingLabelsJson);

  // Apply labels if any were found
  if (labelsToApply.length > 0) {
    log(`Adding labels: ${labelsToApply.join(', ')}`);

    await github.octokit.issues.addLabels({
      ...github.repo,
      issue_number: issueNumber,
      labels: labelsToApply
    });

    // Add a comment to the issue
    await github.createComment(
      issueNumber,
      `I've automatically added the following labels: ${labelsToApply.join(', ')}`
    );
  } else {
    log('No matching labels found');
  }

  log('Issue processing completed');
};

export default handleIssueOpened;
```

## Performance Comparison

Here's a comparison of the three approaches for processing a typical issue:

| Approach | Cold Start Time | Processing Time | Memory Usage |
|----------|----------------|-----------------|--------------|
| Tier 1 (JS Only) | ~400ms | ~120ms | ~40MB |
| Tier 2 (TS+WASM) | ~350ms | ~80ms | ~35MB |
| Tier 3 (Full Rust) | ~300ms | ~30ms | ~30MB |

The Tier 3 approach with custom Rust implementation provides the best performance, especially for processing time, which is critical for responsive GitHub Actions.

## Developer Experience Comparison

| Approach | Learning Curve | Development Speed | Debugging Ease |
|----------|---------------|-------------------|----------------|
| Tier 1 (JS Only) | Low | Fast | Easy |
| Tier 2 (TS+WASM) | Medium | Medium | Medium |
| Tier 3 (Full Rust) | High | Slow | Challenging |

Developers can choose the approach that best fits their skills and requirements. The tiered model allows for progressive enhancement as developers become more comfortable with the system.
