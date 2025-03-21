# GitHub API Integration Tutorial

Welcome to the GitHub API Integration tutorial! This tutorial will teach you how to interact with the GitHub API using our WebAssembly-optimized GitHub Actions framework. By the end of this tutorial, you'll be able to build plugins that perform complex operations with the GitHub API.

## What You'll Build

In this tutorial, you'll create a plugin that:
- Fetches repository data using the GitHub API
- Generates reports based on repository activity
- Optimizes API usage with rate limit awareness
- Creates visualizations of repository metrics

## Tutorial Steps

This tutorial consists of the following steps:

1. Working with the GitHub API client
2. Fetching repository data
3. Creating actionable reports
4. Optimizing API usage

## Prerequisites

Before starting this tutorial, make sure you:
- Have completed the [First Plugin Tutorial](/tutorials/beginner/first-plugin/)
- Understand basic GitHub workflow concepts
- Have a GitHub token with appropriate permissions

## Interactive Tutorial

Try our interactive tutorial below to build your GitHub API plugin:

<div class="tutorial-container" data-tutorial-id="github-api">
  <!-- The interactive components will be inserted here by the JavaScript -->
</div>

## Step 1: Working with the GitHub API Client

Every plugin context in our framework provides an `octokit` client for interacting with the GitHub API. The client is preconfigured with authentication and follows best practices for API usage.

Let's start by creating a scheduled plugin that will run on a cron schedule:

```js
// plugin.config.js
module.exports = {
  name: "github-api-plugin",
  version: "1.0.0",
  events: {
    schedule: ["cron:0 0 * * *"]  // Run daily at midnight
  }
};
```

Now let's set up our entry point:

```js
// src/index.js
const { generateReport } = require('./utils/report');

module.exports = async function(context) {
  // This will run on the scheduled time
  const report = await generateReport(context);

  // Create an issue with the report
  await context.octokit.issues.create({
    ...context.repo,
    title: `Daily Repository Report - ${new Date().toISOString().split('T')[0]}`,
    body: report
  });

  return { success: true };
};
```

## Step 2: Creating API Utilities

Let's create some utility functions to interact with the GitHub API:

```js
// src/utils/github-api.js
class GitHubApi {
  constructor(context) {
    this.context = context;
    this.octokit = context.octokit;
    this.repo = context.repo;
  }

  async getIssueStats() {
    const { data: issues } = await this.octokit.issues.listForRepo({
      ...this.repo,
      state: 'all',
      per_page: 100
    });

    return {
      open: issues.filter(issue => issue.state === 'open').length,
      closed: issues.filter(issue => issue.state === 'closed').length,
      total: issues.length
    };
  }

  async getPullRequestStats() {
    const { data: pulls } = await this.octokit.pulls.list({
      ...this.repo,
      state: 'all',
      per_page: 100
    });

    return {
      open: pulls.filter(pr => pr.state === 'open').length,
      closed: pulls.filter(pr => pr.state === 'closed').length,
      merged: pulls.filter(pr => pr.merged).length,
      total: pulls.length
    };
  }

  async getContributorStats() {
    const { data: contributors } = await this.octokit.repos.getContributorsStats({
      ...this.repo
    });

    // May return 202 if stats are being calculated
    if (!Array.isArray(contributors)) {
      return { total: 0, contributors: [] };
    }

    return {
      total: contributors.length,
      contributors: contributors.map(c => ({
        username: c.author.login,
        commits: c.total
      }))
    };
  }
}

module.exports = GitHubApi;
```

## Step 3: Generating Reports

Now let's create our report generator:

```js
// src/utils/report.js
const GitHubApi = require('./github-api');

exports.generateReport = async function(context) {
  const api = new GitHubApi(context);

  // Fetch stats in parallel
  const [issueStats, prStats, contributorStats] = await Promise.all([
    api.getIssueStats(),
    api.getPullRequestStats(),
    api.getContributorStats()
  ]);

  // Generate markdown report
  return `
# Daily Repository Report

## Issues
- **Open:** ${issueStats.open}
- **Closed:** ${issueStats.closed}
- **Total:** ${issueStats.total}

## Pull Requests
- **Open:** ${prStats.open}
- **Closed:** ${prStats.closed}
- **Merged:** ${prStats.merged}
- **Total:** ${prStats.total}

## Contributors
- **Total Contributors:** ${contributorStats.total}

### Top Contributors
${contributorStats.contributors
  .sort((a, b) => b.commits - a.commits)
  .slice(0, 5)
  .map(c => `- @${c.username} (${c.commits} commits)`)
  .join('\n')}
`;
};
```

## Step 4: Optimizing API Usage

The GitHub API has rate limits, so it's important to optimize your API usage. Here's an example of how to handle rate limits:

```js
// src/utils/rate-limit.js
exports.checkRateLimit = async function(context) {
  const { data } = await context.octokit.rateLimit.get();

  const { rate } = data;
  const remaining = rate.remaining;
  const limit = rate.limit;

  const percentageLeft = (remaining / limit) * 100;

  if (percentageLeft < 10) {
    console.warn(`WARNING: API rate limit running low! ${remaining}/${limit} (${percentageLeft.toFixed(1)}%) requests remaining`);
  }

  return { remaining, limit, percentageLeft };
};
```

Then update your main function to check rate limits:

```js
// src/index.js (updated)
const { generateReport } = require('./utils/report');
const { checkRateLimit } = require('./utils/rate-limit');

module.exports = async function(context) {
  // Check rate limit before proceeding
  const rateLimit = await checkRateLimit(context);

  if (rateLimit.percentageLeft < 5) {
    // Not enough API calls remaining, exit gracefully
    return {
      success: false,
      message: `Insufficient API rate limit remaining: ${rateLimit.remaining}/${rateLimit.limit}`
    };
  }

  // Proceed with generating and posting the report
  const report = await generateReport(context);

  await context.octokit.issues.create({
    ...context.repo,
    title: `Daily Repository Report - ${new Date().toISOString().split('T')[0]}`,
    body: report
  });

  return { success: true };
};
```

## Performance Benefits

Our WebAssembly-optimized framework provides several advantages when working with the GitHub API:

1. **Efficient Memory Management**: Optimized memory usage for API response handling
2. **Parallel API Requests**: Non-blocking, concurrent API calls
3. **Reduced Cold Start Time**: Faster initialization of API clients
4. **Optimized JSON Parsing**: WASM-accelerated JSON processing for API responses

Try the interactive tutorial above to see these benefits in action!

## Next Steps

After completing this tutorial, you might want to explore:

- [Advanced Event Handling](/tutorials/advanced/advanced-events/) - Combine API usage with event-driven workflows
- [Custom UI Plugins](/tutorials/advanced/custom-ui/) - Create plugins with interactive dashboards
- [WASM Performance Tuning](/tutorials/advanced/wasm-performance/) - Optimize API operations with WebAssembly
