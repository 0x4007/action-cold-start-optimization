#!/usr/bin/env bun

/**
 * Interactive CLI tool to create a new plugin from a template
 * Enhanced version of create-plugin.js with interactive prompts and more features
 *
 * Usage: bun scripts/tools/create-plugin-interactive.ts
 */

import inquirer from 'inquirer';
import { Command } from 'commander';
import chalk from 'chalk';
import ejs from 'ejs';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current script
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..', '..');
const TEMPLATES_DIR = resolve(ROOT_DIR, 'templates');

// Define template types
const TEMPLATES = {
  js: {
    name: 'JavaScript',
    description: 'Simple JavaScript plugin (no TypeScript or Rust)',
    path: 'js',
  },
  ts: {
    name: 'TypeScript',
    description: 'TypeScript plugin with WASM integration',
    path: 'ts',
  },
  rust: {
    name: 'Rust + TypeScript',
    description: 'Full stack plugin with Rust and TypeScript',
    path: 'rust',
  },
};

// Define common plugin features
const FEATURES = {
  issueManagement: {
    name: 'Issue Management',
    description: 'Handle issue events (opened, closed, etc.)',
    handlers: ['issue-opened.js', 'issue-closed.js', 'issue-labeled.js'],
    tsHandlers: ['issue-opened.ts', 'issue-closed.ts', 'issue-labeled.ts'],
  },
  pullRequestReview: {
    name: 'Pull Request Review',
    description: 'Handle pull request events (opened, review, etc.)',
    handlers: ['pull-request-opened.js', 'pull-request-review.js'],
    tsHandlers: ['pull-request-opened.ts', 'pull-request-review.ts'],
  },
  repositoryManagement: {
    name: 'Repository Management',
    description: 'Handle repository events (push, release, etc.)',
    handlers: ['push.js', 'release.js'],
    tsHandlers: ['push.ts', 'release.ts'],
  },
  externalIntegration: {
    name: 'External Integration',
    description: 'Integrate with external services (Slack, Jira, etc.)',
    handlers: ['external-service.js'],
    tsHandlers: ['external-service.ts'],
  },
};

// Define plugin configuration templates
const CONFIG_TEMPLATES = {
  js: `module.exports = {
  name: '{{pluginName}}',
  description: '{{pluginDescription}}',
  author: '{{authorName}}',

  action: {
    icon: '{{icon}}',
    color: '{{color}}',
    inputs: {
      // Add your custom inputs here
    }
  },

  // Event handlers
  events: {
    {{#events}}
    '{{event}}': './src/handlers/{{handler}}',
    {{/events}}
  }
};`,
  ts: `export default {
  name: '{{pluginName}}',
  description: '{{pluginDescription}}',
  author: '{{authorName}}',

  action: {
    icon: '{{icon}}',
    color: '{{color}}',
    inputs: {
      // Add your custom inputs here
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
    {{#events}}
    '{{event}}': './src/handlers/{{handler}}',
    {{/events}}
  }
};`,
};

// Handler templates
const HANDLER_TEMPLATES = {
  js: {
    'issue-opened.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for issue.opened event
 */
module.exports = async function handleIssueOpened(payload) {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Add your custom logic here

  log('Issue processing completed');
};`,
    'issue-closed.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for issue.closed event
 */
module.exports = async function handleIssueClosed(payload) {
  const { github, utils, log } = getContext();

  log('Processing closed issue');

  // Get the issue details
  const issueNumber = payload.issue.number;

  // Add your custom logic here

  log('Issue processing completed');
};`,
    'issue-labeled.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for issue.labeled event
 */
module.exports = async function handleIssueLabeled(payload) {
  const { github, utils, log } = getContext();

  log('Processing labeled issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const label = payload.label.name;

  // Add your custom logic here

  log('Issue processing completed');
};`,
    'pull-request-opened.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for pull_request.opened event
 */
module.exports = async function handlePullRequestOpened(payload) {
  const { github, utils, log } = getContext();

  log('Processing new pull request');

  // Get the PR details
  const prNumber = payload.pull_request.number;
  const prTitle = payload.pull_request.title;
  const prBody = payload.pull_request.body || '';

  // Add your custom logic here

  log('Pull request processing completed');
};`,
    'pull-request-review.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for pull_request_review.submitted event
 */
module.exports = async function handlePullRequestReview(payload) {
  const { github, utils, log } = getContext();

  log('Processing pull request review');

  // Get the PR details
  const prNumber = payload.pull_request.number;
  const reviewState = payload.review.state;

  // Add your custom logic here

  log('Pull request review processing completed');
};`,
    'push.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for push event
 */
module.exports = async function handlePush(payload) {
  const { github, utils, log } = getContext();

  log('Processing push event');

  // Get the push details
  const ref = payload.ref;
  const commits = payload.commits || [];

  // Add your custom logic here

  log('Push processing completed');
};`,
    'release.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for release event
 */
module.exports = async function handleRelease(payload) {
  const { github, utils, log } = getContext();

  log('Processing release event');

  // Get the release details
  const tagName = payload.release.tag_name;
  const releaseName = payload.release.name;

  // Add your custom logic here

  log('Release processing completed');
};`,
    'external-service.js': `const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for external service integration
 * This can be triggered by any event
 */
module.exports = async function handleExternalService(payload) {
  const { github, utils, log } = getContext();

  log('Processing external service integration');

  // Add your custom logic here
  // Example: Send notification to Slack, create Jira ticket, etc.

  log('External service processing completed');
};`,
  },
  ts: {
    'issue-opened.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { IssueOpenedPayload } from '../types';

/**
 * Handler for issue.opened event
 */
const handleIssueOpened: EventHandler<IssueOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Add your custom logic here

  log('Issue processing completed');
};

export default handleIssueOpened;`,
    'issue-closed.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { IssueClosedPayload } from '../types';

/**
 * Handler for issue.closed event
 */
const handleIssueClosed: EventHandler<IssueClosedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing closed issue');

  // Get the issue details
  const issueNumber = payload.issue.number;

  // Add your custom logic here

  log('Issue processing completed');
};

export default handleIssueClosed;`,
    'issue-labeled.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { IssueLabeledPayload } from '../types';

/**
 * Handler for issue.labeled event
 */
const handleIssueLabeled: EventHandler<IssueLabeledPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing labeled issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const label = payload.label.name;

  // Add your custom logic here

  log('Issue processing completed');
};

export default handleIssueLabeled;`,
    'pull-request-opened.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { PullRequestOpenedPayload } from '../types';

/**
 * Handler for pull_request.opened event
 */
const handlePullRequestOpened: EventHandler<PullRequestOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing new pull request');

  // Get the PR details
  const prNumber = payload.pull_request.number;
  const prTitle = payload.pull_request.title;
  const prBody = payload.pull_request.body || '';

  // Add your custom logic here

  log('Pull request processing completed');
};

export default handlePullRequestOpened;`,
    'pull-request-review.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { PullRequestReviewPayload } from '../types';

/**
 * Handler for pull_request_review.submitted event
 */
const handlePullRequestReview: EventHandler<PullRequestReviewPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing pull request review');

  // Get the PR details
  const prNumber = payload.pull_request.number;
  const reviewState = payload.review.state;

  // Add your custom logic here

  log('Pull request review processing completed');
};

export default handlePullRequestReview;`,
    'push.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { PushPayload } from '../types';

/**
 * Handler for push event
 */
const handlePush: EventHandler<PushPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing push event');

  // Get the push details
  const ref = payload.ref;
  const commits = payload.commits || [];

  // Add your custom logic here

  log('Push processing completed');
};

export default handlePush;`,
    'release.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { ReleasePayload } from '../types';

/**
 * Handler for release event
 */
const handleRelease: EventHandler<ReleasePayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing release event');

  // Get the release details
  const tagName = payload.release.tag_name;
  const releaseName = payload.release.name;

  // Add your custom logic here

  log('Release processing completed');
};

export default handleRelease;`,
    'external-service.ts': `import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { EventPayload } from '@your-org/plugin-sdk';

/**
 * Handler for external service integration
 * This can be triggered by any event
 */
const handleExternalService: EventHandler = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing external service integration');

  // Add your custom logic here
  // Example: Send notification to Slack, create Jira ticket, etc.

  log('External service processing completed');
};

export default handleExternalService;`,
  },
};

// Types template for TypeScript
const TYPES_TEMPLATE = `import { EventPayload } from '@your-org/plugin-sdk';

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

export interface IssueClosedPayload extends EventPayload {
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

export interface IssueLabeledPayload extends EventPayload {
  issue: {
    number: number;
    title: string;
    body?: string;
    labels: Array<{
      name: string;
    }>;
  };
  label: {
    name: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

export interface PullRequestOpenedPayload extends EventPayload {
  pull_request: {
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

export interface PullRequestReviewPayload extends EventPayload {
  pull_request: {
    number: number;
    title: string;
    body?: string;
  };
  review: {
    state: 'approved' | 'commented' | 'changes_requested';
    body?: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

export interface PushPayload extends EventPayload {
  ref: string;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

export interface ReleasePayload extends EventPayload {
  release: {
    tag_name: string;
    name: string;
    body?: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}
`;

// Index template for handlers
const INDEX_HANDLERS_TEMPLATE = {
  js: `// Export all handlers
module.exports = {
  {{#handlers}}
  '{{event}}': require('./{{handler}}'),
  {{/handlers}}
};`,
  ts: `// Export all handlers
{{#handlers}}
export { default as {{handlerName}} } from './{{handler}}';
{{/handlers}}

// Export named handlers for use in index.ts
export const handlers = {
  {{#handlers}}
  '{{event}}': {{handlerName}},
  {{/handlers}}
};`,
};

// Main index template
const INDEX_TEMPLATE = {
  js: `const { init, on } = require('@your-org/plugin-sdk');
const handlers = require('./handlers');

// Initialize the SDK
async function main() {
  // Initialize the SDK with WebAssembly optimizations
  await init();

  // Register event handlers
  for (const [event, handler] of Object.entries(handlers)) {
    on(event, handler);
  }

  console.log('{{pluginName}} plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});`,
  ts: `import { init, on } from '@your-org/plugin-sdk';
{{#hasWasmConfig}}
import { wasmConfig } from './wasm-config';
{{/hasWasmConfig}}
import { handlers } from './handlers';

// Initialize the SDK
async function main() {
  // Initialize the SDK with WebAssembly optimizations
  {{#hasWasmConfig}}
  await init({ wasm: wasmConfig });
  {{/hasWasmConfig}}
  {{^hasWasmConfig}}
  await init();
  {{/hasWasmConfig}}

  // Register event handlers
  for (const [event, handler] of Object.entries(handlers)) {
    on(event, handler);
  }

  console.log('{{pluginName}} plugin initialized');
}

// Start the plugin
main().catch(error => {
  console.error('Plugin initialization failed:', error);
  process.exit(1);
});`,
};

// Helper function to render a template with variables
function renderTemplate(template: string, variables: Record<string, any>): string {
  // Simple template rendering (replace EJS with a more robust solution if needed)
  let result = template;

  // Handle conditionals
  const conditionalRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
  result = result.replace(conditionalRegex, (match, condition, content) => {
    return variables[condition] ? content : '';
  });

  // Handle negative conditionals
  const negativeConditionalRegex = /{{^(\w+)}}([\s\S]*?){{\/\1}}/g;
  result = result.replace(negativeConditionalRegex, (match, condition, content) => {
    return !variables[condition] ? content : '';
  });

  // Handle arrays
  const arrayRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
  result = result.replace(arrayRegex, (match, arrayName, content) => {
    if (Array.isArray(variables[arrayName])) {
      return variables[arrayName].map((item: any) => {
        let itemContent = content;
        for (const [key, value] of Object.entries(item)) {
          itemContent = itemContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return itemContent;
      }).join('');
    }
    return '';
  });

  // Handle simple variables
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  }

  return result;
}

// Helper function to create a file from a template
function createFileFromTemplate(
  templateContent: string,
  outputPath: string,
  variables: Record<string, any>
): void {
  const content = renderTemplate(templateContent, variables);
  writeFileSync(outputPath, content, 'utf8');
  console.log(`Created ${outputPath}`);
}

// Helper function to copy a directory recursively
function copyDirectory(source: string, destination: string): void {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const entries = readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      copyFileSync(sourcePath, destinationPath);
    }
  }
}

// Main function
async function main() {
  const program = new Command();

  program
    .name('create-plugin-interactive')
    .description('Interactive CLI tool to create a new plugin from a template')
    .version('1.0.0')
    .option('-n, --non-interactive', 'Run in non-interactive mode with default values')
    .parse(process.argv);

  const options = program.opts();

  console.log(chalk.blue('=== WebAssembly-Optimized GitHub Actions Plugin Generator ==='));
  console.log(chalk.gray('This tool will help you create a new plugin from a template.\n'));

  let answers: any;

  if (options.nonInteractive) {
    // Use default values in non-interactive mode
    answers = {
      pluginName: 'my-plugin',
      pluginDescription: 'A GitHub Action plugin',
      authorName: 'Your Name',
      template: 'js',
      features: ['issueManagement'],
      destination: 'my-plugin',
      icon: 'code',
      color: 'blue',
    };
  } else {
    // Interactive mode with prompts
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'pluginName',
        message: 'What is the name of your plugin?',
        default: 'my-plugin',
      },
      {
        type: 'input',
        name: 'pluginDescription',
        message: 'Provide a short description of your plugin:',
        default: 'A GitHub Action plugin',
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'What is your name (for the author field)?',
        default: 'Your Name',
      },
      {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: Object.entries(TEMPLATES).map(([key, value]) => ({
          name: `${value.name} - ${value.description}`,
          value: key,
        })),
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which features would you like to include?',
        choices: Object.entries(FEATURES).map(([key, value]) => ({
          name: `${value.name} - ${value.description}`,
          value: key,
        })),
      },
      {
        type: 'input',
        name: 'destination',
        message: 'Where would you like to create the plugin?',
        default: (answers: any) => answers.pluginName.toLowerCase().replace(/\s+/g, '-'),
      },
      {
        type: 'list',
        name: 'icon',
        message: 'Choose an icon for your GitHub Action:',
        choices: [
          'code',
          'play',
          'check',
          'x',
          'alert',
          'shield',
          'comment',
          'eye',
          'tag',
          'git-branch',
          'git-pull-request',
          'git-merge',
          'git-commit',
          'star',
          'zap',
        ],
      },
      {
        type: 'list',
        name: 'color',
        message: 'Choose a color for your GitHub Action:',
        choices: [
          'blue',
          'green',
          'red',
          'orange',
          'purple',
          'yellow',
          'gray',
          'black',
          'white',
        ],
      },
    ]);
  }

  // Validate destination
  const destinationPath = resolve(process.cwd(), answers.destination);
  if (existsSync(destinationPath)) {
    console.error(chalk.red(`Destination '${answers.destination}' already exists`));
    process.exit(1);
  }

  // Create destination directory
  mkdirSync(destinationPath, { recursive: true });
  mkdirSync(join(destinationPath, 'src'), { recursive: true });
  mkdirSync(join(destinationPath, 'src', 'handlers'), { recursive: true });

  // Get template path
  const templatePath = resolve(TEMPLATES_DIR, TEMPLATES[answers.template as keyof typeof TEMPLATES].path);
  if (!existsSync(templatePath)) {
    console.error(chalk.red(`Template '${answers.template}' not found at ${templatePath}`));
    process.exit(1);
  }

  // Copy template files
  console.log(chalk.blue('\nCopying template files...'));
  copyDirectory(templatePath, destinationPath);

  // Process selected features
  const selectedFeatures = answers.features as string[];
  const isTypeScript = answers.template === 'ts' || answers.template === 'rust';

  // Prepare event handlers
  const eventHandlers: { event: string; handler: string; handlerName: string }[] = [];

  for (const feature of selectedFeatures) {
    const featureInfo = FEATURES[feature as keyof typeof FEATURES];

    if (isTypeScript) {
      for (const handler of featureInfo.tsHandlers) {
        const event = handler.replace('.ts', '').replace(/-/g, '_');
        const handlerName = event.replace(/_/g, '');
        eventHandlers.push({
          event,
          handler,
          handlerName,
        });

        // Create handler file
        const handlerTemplate = HANDLER_TEMPLATES.ts[handler as keyof typeof HANDLER_TEMPLATES.ts];
        if (handlerTemplate) {
          createFileFromTemplate(
            handlerTemplate,
            join(destinationPath, 'src', 'handlers', handler),
            {}
          );
        }
      }
    } else {
      for (const handler of featureInfo.handlers) {
        const event = handler.replace('.js', '').replace(/-/g, '_');
        const handlerName = event.replace(/_/g, '');
        eventHandlers.push({
          event,
          handler,
          handlerName,
        });

        // Create handler file
        const handlerTemplate = HANDLER_TEMPLATES.js[handler as keyof typeof HANDLER_TEMPLATES.js];
        if (handlerTemplate) {
          createFileFromTemplate(
            handlerTemplate,
            join(destinationPath, 'src', 'handlers', handler),
            {}
          );
        }
      }
    }
  }

  // Create index.js/ts for handlers
  if (isTypeScript) {
    createFileFromTemplate(
      INDEX_HANDLERS_TEMPLATE.ts,
      join(destinationPath, 'src', 'handlers', 'index.ts'),
      { handlers: eventHandlers }
    );
  } else {
    createFileFromTemplate(
      INDEX_HANDLERS_TEMPLATE.js,
      join(destinationPath, 'src', 'handlers', 'index.js'),
      { handlers: eventHandlers }
    );
  }

  // Create main index.js/ts
  if (isTypeScript) {
    createFileFromTemplate(
      INDEX_TEMPLATE.ts,
      join(destinationPath, 'src', 'index.ts'),
      {
        pluginName: answers.pluginName,
        hasWasmConfig: answers.template === 'ts'
      }
    );

    // Create types.ts
    createFileFromTemplate(
      TYPES_TEMPLATE,
      join(destinationPath, 'src', 'types.ts'),
      {}
    );
  } else {
    createFileFromTemplate(
      INDEX_TEMPLATE.js,
      join(destinationPath, 'src', 'index.js'),
      { pluginName: answers.pluginName }
    );
  }

  // Create plugin.config.js/ts
  const configTemplate = isTypeScript ? CONFIG_TEMPLATES.ts : CONFIG_TEMPLATES.js;
  const configFileName = isTypeScript ? 'plugin.config.ts' : 'plugin.config.js';

  createFileFromTemplate(
    configTemplate,
    join(destinationPath, configFileName),
    {
      pluginName: answers.pluginName,
      pluginDescription: answers.pluginDescription,
      authorName: answers.authorName,
      icon: answers.icon,
      color: answers.color,
      events: eventHandlers,
    }
  );

  // Install dependencies
  console.log(chalk.blue('\nInstalling dependencies...'));
  try {
    // First, make sure the SDK is built
    execSync('npm run build:sdk', { stdio: 'inherit' });

    // Then install dependencies in the new plugin
    execSync('bun install', { cwd: destinationPath, stdio: 'inherit' });
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not install dependencies automatically.'));
    console.warn(chalk.yellow('You may need to run "bun install" manually in the plugin directory.'));
  }

  console.log(chalk.green('\nPlugin created successfully!'));
  console.log(chalk.blue('\nNext steps:'));
  console.log(`1. Update the plugin configuration in ${join(answers.destination, configFileName)}`);
  console.log(`2. Implement your event handlers in ${join(answers.destination, 'src/handlers')}`);
  console.log(`3. Build and test your plugin:`);
  console.log(chalk.gray(`   cd ${answers.destination}`));
  console.log(chalk.gray('   bun run build'));
}

main().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
