# Issue Responder Example

This example demonstrates a simple issue responder plugin that automatically responds to new GitHub issues based on their content. The plugin analyzes issue titles and bodies for specific keywords, then adds comments, labels, and assigns team members accordingly.

## Implementation Tiers

This example is available in three implementation tiers:

1. [JavaScript Simple](#javascript-implementation) - A basic implementation using only JavaScript
2. [TypeScript Advanced](#typescript-implementation) - Enhanced with TypeScript and basic WebAssembly integration
3. [Rust Optimized](#rust-implementation) - Maximized performance with custom Rust components

## JavaScript Implementation

The JavaScript implementation provides a simple, accessible way to create an issue responder without requiring TypeScript or Rust knowledge.

### Directory Structure

```
my-issue-responder/
├── package.json
├── plugin.config.js
└── src/
    ├── index.js
    └── handlers/
        └── issue-opened.js
```

### Implementation

#### plugin.config.js

```javascript
module.exports = {
  name: "issue-responder",
  version: "1.0.0",
  description: "A plugin that responds to new issues",
  author: "Your Name",
  events: ["issues.opened"],
  outputs: {
    response: {
      description: "The response message",
    }
  }
};
```

#### src/index.js

```javascript
const issueOpenedHandler = require('./handlers/issue-opened');

/**
 * Entry point for the plugin
 * @param {object} event - The GitHub event object
 * @param {object} context - The action context
 * @returns {object} The action result
 */
module.exports = async (event, context) => {
  const eventName = context.eventName;

  switch (eventName) {
    case 'issues.opened':
      return await issueOpenedHandler(event, context);
    default:
      return {
        message: `Event ${eventName} not supported`,
      };
  }
};
```

#### src/handlers/issue-opened.js

```javascript
/**
 * Handles the 'issues.opened' event
 * @param {object} event - The GitHub event object
 * @param {object} context - The action context
 * @returns {object} The action result
 */
module.exports = async (event, context) => {
  const { issue } = event.payload;
  const { title, body, user } = issue;

  // Initialize response data
  const labels = [];
  const assignees = [];
  let commentBody = `Thanks for opening this issue, @${user.login}!`;

  // Check for bug reports
  if (title.toLowerCase().includes('bug') || body.toLowerCase().includes('bug')) {
    labels.push('bug');
    assignees.push('bug-team-member');
    commentBody += '\n\nI\'ve labeled this as a bug and notified our bug team.';
  }

  // Check for feature requests
  if (title.toLowerCase().includes('feature') || body.toLowerCase().includes('feature request')) {
    labels.push('enhancement');
    assignees.push('feature-team-member');
    commentBody += '\n\nI\'ve categorized this as a feature request and notified the feature team.';
  }

  // Check for questions
  if (title.toLowerCase().includes('how') || title.toLowerCase().includes('?')) {
    labels.push('question');
    commentBody += '\n\nThis appears to be a question. Have you checked our documentation?';
  }

  // Create a comment on the issue
  await context.octokit.issues.createComment({
    ...context.repo,
    issue_number: issue.number,
    body: commentBody
  });

  // Add labels if needed
  if (labels.length > 0) {
    await context.octokit.issues.addLabels({
      ...context.repo,
      issue_number: issue.number,
      labels
    });
  }

  // Assign issue if needed
  if (assignees.length > 0) {
    await context.octokit.issues.addAssignees({
      ...context.repo,
      issue_number: issue.number,
      assignees
    });
  }

  return {
    response: `Processed issue #${issue.number}: added ${labels.length} labels and assigned to ${assignees.length} people.`
  };
};
```

### Performance Characteristics

The JavaScript implementation is:
- Quick to implement
- Easy to understand and modify
- Sufficient for simple use cases
- Limited in processing performance for large repositories or complex rules

**Cold Start Time**: ~300ms
**Memory Usage**: ~60MB
**Bundle Size**: ~5KB

## TypeScript Implementation

The TypeScript implementation adds type safety and improves maintainability, along with some basic WebAssembly optimizations for text processing.

[View TypeScript Implementation Details](#)

## Rust Implementation

The Rust implementation maximizes performance by offloading content analysis to WebAssembly, resulting in significantly faster processing and reduced memory usage.

[View Rust Implementation Details](#)

## Performance Comparison

The following chart compares the performance characteristics of each implementation tier:

| Metric | JavaScript | TypeScript | Rust |
|--------|------------|------------|------|
| Cold Start Time | 300ms | 320ms | 280ms |
| Issue Processing Time | 250ms | 200ms | 50ms |
| Memory Usage | 60MB | 65MB | 35MB |
| Bundle Size | 5KB | 7KB | 12KB (includes WASM) |

## Customizing the Example

You can customize this example by:

1. Modifying the keyword detection logic in the handler
2. Adding additional checks for different issue types
3. Customizing responses based on repository-specific needs
4. Adding integration with external services

## Using the Example

To use this example:

1. Copy the example files to your project
2. Install dependencies:
   ```bash
   npm install @actions/core @actions/github
   ```
3. Configure your GitHub token in your repository secrets
4. Deploy the action to your repository
5. Configure the workflow in your `.github/workflows` directory

## Further Reading

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Event Types Reference](/api/event-system.md)
- [Context Object Documentation](/api/context-object.md)
- [Performance Optimization Guide](/performance/cold-start-optimization.md)
