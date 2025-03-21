# First Plugin Tutorial

Welcome to the first tutorial in our series! In this interactive tutorial, you'll create your first GitHub Action plugin using our WebAssembly-optimized framework. By the end, you'll have a functional issue responder that can automatically respond to new issues in your repository.

## What You'll Build

You'll create an issue responder plugin that:
- Automatically responds to newly opened issues
- Analyzes issue content for keywords
- Adds labels based on issue content
- Assigns issues to team members

## Tutorial Steps

This tutorial consists of the following steps:

1. Understanding the plugin structure
2. Implementing the issue-opened event handler
3. Adding issue labeling based on content
4. Creating a welcome comment
5. Testing with simulated events

## Prerequisites

Before starting this tutorial, make sure you:
- Have a GitHub account
- Understand basic JavaScript
- Have completed the [Getting Started](/getting-started/) guide

## Interactive Tutorial

Try our interactive tutorial below to build your first plugin step by step:

<div class="tutorial-container" data-tutorial-id="first-plugin">
  <!-- The interactive components will be inserted here by the JavaScript -->
</div>

## Step 1: Understanding the Plugin Structure

Every GitHub Action plugin starts with a basic project structure. In our framework, the structure consists of:

- A configuration file that defines your plugin's metadata and event handlers
- A source directory with your implementation
- Handler files for each GitHub event you want to respond to

Let's look at the configuration file first:

```js
// plugin.config.js
module.exports = {
  name: "my-first-plugin",
  version: "1.0.0",
  events: {
    issues: ["opened"]
  }
};
```

This configuration tells GitHub that our plugin should be triggered when issues are opened. Next, let's look at the entry point:

```js
// src/index.js
const handleIssueOpened = require("./handlers/issue-opened");

module.exports = function(context) {
  // Handle different events
  if (context.event.name === "issues" && context.event.action === "opened") {
    return handleIssueOpened(context);
  }
};
```

And finally, the handler file:

```js
// src/handlers/issue-opened.js
module.exports = async function handleIssueOpened(context) {
  console.log("Issue opened: " + context.payload.issue.title);

  // Your code will go here

  return {
    success: true
  };
};
```

Now that you understand the basic structure, let's implement the functionality in the interactive tutorial above.

## Next Steps

After completing this tutorial, you can proceed to:

- [Event Handling Tutorial](/tutorials/beginner/event-handling/) - Learn how to handle multiple GitHub webhook events
- [GitHub API Tutorial](/tutorials/beginner/github-api/) - Explore more ways to interact with the GitHub API
