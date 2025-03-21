# Quick Start Guide

This guide will walk you through creating a simple GitHub Action plugin using our WebAssembly-Optimized SDK. By the end, you'll have a working plugin that automatically greets users who open new issues.

## Prerequisites

Ensure you have the following installed:
- Node.js (v16+)
- npm or bun (recommended)
- Git

## Step 1: Create a New Plugin Project

First, let's create a new plugin project using our CLI tool:

```bash
# Create a new directory for your plugin
mkdir issue-greeter
cd issue-greeter

# Initialize the plugin using our CLI
npx @wasm-actions/create-plugin
```

Follow the prompts to configure your plugin:

1. **Plugin Name**: `issue-greeter`
2. **Description**: `A GitHub Action that greets users when they open an issue`
3. **Author**: Your name
4. **Development Tier**: `JavaScript` (Tier 1)
5. **Events**: Select `issues.opened`
6. **Additional Features**: None for now

The CLI will create the necessary files and install dependencies.

## Step 2: Understand the Generated Files

Let's take a look at the files that were generated:

```
issue-greeter/
├── package.json           # Project configuration
├── plugin.config.js       # Plugin configuration
├── src/
│   ├── index.js           # Main entry point
│   └── handlers/
│       └── issue-opened.js # Handler for issue.opened event
└── README.md              # Plugin documentation
```

## Step 3: Configure the Plugin

The `plugin.config.js` file defines your plugin's metadata, inputs, and outputs. It should look something like this:

```javascript
module.exports = {
  name: "issue-greeter",
  description: "A GitHub Action that greets users when they open an issue",
  author: "Your Name",
  events: ["issues.opened"],
  inputs: {
    greeting: {
      description: "The greeting to use",
      required: false,
      default: "Thanks for opening an issue!"
    }
  },
  outputs: {
    result: {
      description: "The result of the action"
    }
  },
  branding: {
    icon: "message-circle",
    color: "blue"
  }
};
```

Let's add another input to customize our greeting message:

```javascript
module.exports = {
  name: "issue-greeter",
  description: "A GitHub Action that greets users when they open an issue",
  author: "Your Name",
  events: ["issues.opened"],
  inputs: {
    greeting: {
      description: "The greeting to use",
      required: false,
      default: "Thanks for opening an issue!"
    },
    include_emoji: {
      description: "Whether to include emoji in the greeting",
      required: false,
      default: "true"
    }
  },
  outputs: {
    result: {
      description: "The result of the action"
    }
  },
  branding: {
    icon: "message-circle",
    color: "blue"
  }
};
```

## Step 4: Implement the Event Handler

Now, let's implement the event handler for the `issues.opened` event in `src/handlers/issue-opened.js`:

```javascript
const { sdk } = require("@wasm-actions/sdk");

/**
 * Handler for the issues.opened event
 * @param {Object} event - The event object
 * @param {Object} context - The context object
 * @returns {Object} - The result object
 */
module.exports = async function handleIssueOpened(event, context) {
  // Get the issue from the event payload
  const { issue } = event.payload;

  // Get the inputs
  const greeting = context.inputs.greeting || "Thanks for opening an issue!";
  const includeEmoji = context.inputs.include_emoji === "true";

  // Create the greeting message
  let message = `${greeting} @${issue.user.login}`;

  // Add emoji if enabled
  if (includeEmoji) {
    message = `👋 ${message} 🎉`;
  }

  // Log some information
  console.log(`Issue #${issue.number} was opened by ${issue.user.login}`);
  console.log(`Title: ${issue.title}`);

  try {
    // Comment on the issue
    await context.octokit.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      body: message
    });

    console.log(`Commented on issue #${issue.number}`);

    return {
      result: `Greeted user ${issue.user.login} on issue #${issue.number}`
    };
  } catch (error) {
    console.error(`Error commenting on issue: ${error.message}`);
    throw error;
  }
};
```

This handler:
1. Extracts the issue from the event payload
2. Gets the custom greeting and emoji preference from inputs
3. Creates a personalized greeting message
4. Posts a comment on the issue using the GitHub API

## Step 5: Test Your Plugin Locally

You can test your plugin locally using our development server, which simulates GitHub webhook events:

```bash
npx @wasm-actions/dev-server
```

This will start a local server and open a dashboard in your browser. You can:

1. Click "Start Plugin" to run your plugin
2. Select the "issues.opened" event
3. Customize the event payload if needed
4. Click "Trigger Event" to simulate the event

The dashboard will show the logs and output from your plugin, allowing you to verify that it works correctly.

## Step 6: Build Your Plugin

Once you're satisfied with your plugin, build it for production:

```bash
npx @wasm-actions/build
```

This will:
1. Generate an `action.yml` file from your plugin configuration
2. Create an optimized build in the `dist` directory
3. Bundle all dependencies

## Step 7: Use Your Plugin in a GitHub Workflow

To use your plugin in a GitHub repository, create a workflow file in the `.github/workflows` directory:

```yaml
# .github/workflows/greet-issues.yml
name: Greet Issues

on:
  issues:
    types: [opened]

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Greet Issue Opener
        uses: yourusername/issue-greeter@v1
        with:
          greeting: "Thank you for reporting this issue!"
          include_emoji: "true"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Step 8: Publish Your Plugin

To make your plugin available to others, push it to a GitHub repository:

```bash
# Initialize a git repository if needed
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repository and push to it
git remote add origin https://github.com/yourusername/issue-greeter.git
git push -u origin main
```

Then, create a release on GitHub:

1. Go to your repository on GitHub
2. Navigate to "Releases"
3. Click "Create a new release"
4. Set the tag version (e.g., `v1.0.0`)
5. Add a title and description
6. Publish the release

Your plugin is now published and can be used by others in their GitHub workflows!

## Next Steps

Now that you've created your first plugin, you can:

1. Add more features to your plugin
2. Implement handlers for additional events
3. Explore the [API Reference](/api/) to learn about advanced features
4. Check out the [Performance Guide](/performance/) to optimize your plugin

For more information on setting up a proper development environment, see the [Development Environment](./development-environment.md) guide.
