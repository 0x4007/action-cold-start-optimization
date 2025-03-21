# Installation

This guide will walk you through the process of installing and setting up the WebAssembly-Optimized GitHub Actions SDK in your development environment.

## Requirements

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **bun** (recommended)
- **Git**

For Tier 2 and Tier 3 development, you'll also need:

- **TypeScript** (v4.5.0 or higher) - for Tier 2
- **Rust** and **wasm-pack** - for Tier 3 (optional)

## Installing the SDK

### Using npm

```bash
npm install @wasm-actions/sdk
```

### Using bun (recommended)

```bash
bun add @wasm-actions/sdk
```

## Setting Up a New Plugin Project

The easiest way to create a new plugin project is to use our interactive CLI tool:

```bash
npx @wasm-actions/create-plugin
```

Or with bun:

```bash
bunx @wasm-actions/create-plugin
```

This will guide you through a series of prompts to configure your plugin:

1. Plugin name
2. Development tier (JavaScript, TypeScript, or Rust)
3. GitHub event triggers
4. Additional features

## Manual Setup

If you prefer to set up your project manually, follow these steps:

### 1. Create a new directory for your plugin

```bash
mkdir my-github-action
cd my-github-action
```

### 2. Initialize a package.json file

```bash
npm init -y
```

Or with bun:

```bash
bun init
```

### 3. Install the SDK

```bash
npm install @wasm-actions/sdk
```

Or with bun:

```bash
bun add @wasm-actions/sdk
```

### 4. Create the plugin configuration file

Create a file named `plugin.config.js` in the root of your project:

```javascript
module.exports = {
  name: "my-github-action",
  description: "My awesome GitHub Action",
  author: "Your Name",
  events: ["issues.opened", "pull_request.opened"],
  inputs: {
    greeting: {
      description: "The greeting to use",
      required: true,
      default: "Hello"
    }
  },
  outputs: {
    result: {
      description: "The result of the action"
    }
  },
  icon: "code",
  color: "blue"
};
```

### 5. Create your first event handler

Create a directory structure for your handlers:

```bash
mkdir -p src/handlers
```

Create a file for your event handler, for example `src/handlers/issues-opened.js`:

```javascript
const { sdk } = require("@wasm-actions/sdk");

module.exports = async function handleIssueOpened(event, context) {
  const { issue } = event.payload;

  console.log(`Issue #${issue.number} was opened: ${issue.title}`);

  // Example: Add a comment to the issue
  const greeting = context.inputs.greeting || "Hello";

  await context.octokit.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue.number,
    body: `${greeting}, @${issue.user.login}! Thanks for opening this issue!`
  });

  return {
    result: `Commented on issue #${issue.number}`
  };
};
```

### 6. Create the main entry point

Create a file named `src/index.js` in the root of your project:

```javascript
const { sdk } = require("@wasm-actions/sdk");
const handleIssueOpened = require("./handlers/issues-opened");

// Register event handlers
sdk.registerHandler("issues.opened", handleIssueOpened);

// Initialize the SDK
sdk.init();
```

## Building Your Plugin

To build your plugin for use in GitHub Actions:

```bash
npx @wasm-actions/build
```

Or with bun:

```bash
bunx @wasm-actions/build
```

This will create an optimized build in the `dist` directory, including the necessary `action.yml` file for GitHub Actions.

## Next Steps

After installation, move on to [Basic Concepts](./basic-concepts.md) to understand the core components of the SDK, or jump ahead to the [Quick Start](./quick-start.md) guide to create your first plugin.
