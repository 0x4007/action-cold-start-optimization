# Event Handling Tutorial

Welcome to the Event Handling tutorial! In this interactive guide, you'll learn how to handle multiple GitHub events in your WebAssembly-optimized GitHub Action plugin. Building on the First Plugin tutorial, you'll expand your plugin to respond to various events with appropriate handlers.

## What You'll Build

In this tutorial, you'll create a plugin that:
- Handles multiple GitHub events (issues and pull requests)
- Implements event routing logic
- Creates shared utility functions
- Tests with various event types

## Tutorial Steps

This tutorial consists of the following steps:

1. Setting up event configuration
2. Implementing event routing
3. Creating shared utilities
4. Testing multiple event types

## Prerequisites

Before starting this tutorial, make sure you:
- Have completed the [First Plugin Tutorial](/tutorials/beginner/first-plugin/)
- Understand the basic plugin structure
- Have a GitHub account for testing

## Interactive Tutorial

Try our interactive tutorial below to build your event handling plugin:

::: tip Loading Tutorial
If you don't see the interactive tutorial below, please ensure JavaScript is enabled in your browser.
:::

::: raw
<div class="tutorial-container" data-tutorial-id="event-handling"></div>

<script>
// Inline script to ensure tutorial properly initializes
document.addEventListener('DOMContentLoaded', function() {
  const initTutorial = function() {
    const container = document.querySelector('.tutorial-container');
    if (container && container.children.length === 0) {
      console.log('Initializing tutorial from inline script');
      if (window.initializeTutorialContainer) {
        window.initializeTutorialContainer(container);
      }
    }
  };

  // Try immediately
  initTutorial();

  // And again after short delay
  setTimeout(initTutorial, 1000);
});
</script>
:::

## Step 1: Setting Up Event Configuration

To handle multiple events, we first need to update the plugin configuration to listen for additional event types:

```js
// plugin.config.js
module.exports = {
  name: "event-handler",
  version: "1.0.0",
  events: {
    issues: ["opened", "edited"],
    pull_request: ["opened", "synchronized"]
  }
};
```

This configuration tells GitHub that our plugin should be triggered when:
- Issues are opened or edited
- Pull requests are opened or synchronized (updated)

## Step 2: Implementing Event Routing

Next, let's create a more robust entry point that can route different events to their appropriate handlers:

```js
// src/index.js
const handlers = require('./handlers');

module.exports = function(context) {
  const { event } = context;

  // Route to the appropriate handler based on event type
  if (event.name === 'issues') {
    if (event.action === 'opened') {
      return handlers.issueOpened(context);
    } else if (event.action === 'edited') {
      return handlers.issueEdited(context);
    }
  } else if (event.name === 'pull_request') {
    if (event.action === 'opened' || event.action === 'synchronized') {
      return handlers.pullRequestUpdated(context);
    }
  }

  return {
    success: true,
    message: `No handler for ${event.name}.${event.action}`
  };
};
```

## Step 3: Creating Shared Utilities

As your plugin grows, you'll want to share code between handlers. Let's create utility functions for this purpose:

```js
// src/utils/github.js
exports.addLabels = async function(context, issueNumber, labels) {
  await context.octokit.issues.addLabels({
    ...context.repo,
    issue_number: issueNumber,
    labels
  });
  return labels;
};

exports.createComment = async function(context, issueNumber, body) {
  const result = await context.octokit.issues.createComment({
    ...context.repo,
    issue_number: issueNumber,
    body
  });
  return result.data;
};
```

## Step 4: Handler Implementation

Now we can implement our handlers using these shared utilities:

```js
// src/handlers/index.js
const github = require('../utils/github');

exports.issueOpened = async function(context) {
  const issue = context.payload.issue;
  await github.addLabels(context, issue.number, ['triage']);
  await github.createComment(context, issue.number, 'Thanks for opening this issue!');
  return { success: true };
};

exports.issueEdited = async function(context) {
  // Handle issue edit events
  return { success: true };
};

exports.pullRequestUpdated = async function(context) {
  // Handle PR open/update events
  const pr = context.payload.pull_request;
  await github.addLabels(context, pr.number, ['needs-review']);
  return { success: true };
};
```

## Performance Benefits

Handling multiple events efficiently is a key advantage of our WebAssembly-optimized framework. The WebAssembly binary:

1. Loads handlers on-demand
2. Shares common code between handlers
3. Optimizes memory usage for multiple event types
4. Reduces cold start time even with complex routing logic

Try making additional changes in the interactive tutorial to see how you can expand this event handling system!

## Next Steps

After completing this tutorial, you can proceed to:

- [GitHub API Tutorial](/tutorials/beginner/github-api/) - Learn how to work with the GitHub API in depth
- [WebAssembly Integration Tutorial](/tutorials/advanced/wasm-integration/) - Explore how to integrate Rust with your JavaScript handlers
