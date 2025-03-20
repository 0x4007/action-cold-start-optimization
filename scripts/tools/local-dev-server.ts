#!/usr/bin/env bun

/**
 * Local Development Server for GitHub Action Plugins
 *
 * This server provides:
 * - Webhook event simulation
 * - Mock GitHub API responses
 * - Hot reloading for rapid development
 * - Request/response logging
 *
 * Usage: bun scripts/tools/local-dev-server.ts [options]
 */

import express from 'express';
import { Command } from 'commander';
import chalk from 'chalk';
import { spawn, ChildProcess } from 'child_process';
import { watch } from 'chokidar';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Get the directory of the current script
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..', '..');

// Default event templates
const EVENT_TEMPLATES = {
  'issue.opened': {
    name: 'Issue Opened',
    payload: {
      action: 'opened',
      issue: {
        number: 1,
        title: 'Test Issue',
        body: 'This is a test issue created by the local development server.',
        labels: [],
        user: {
          login: 'test-user',
        },
      },
      repository: {
        owner: {
          login: 'test-owner',
        },
        name: 'test-repo',
      },
    },
  },
  'issue.closed': {
    name: 'Issue Closed',
    payload: {
      action: 'closed',
      issue: {
        number: 1,
        title: 'Test Issue',
        body: 'This is a test issue that was closed.',
        labels: [],
        user: {
          login: 'test-user',
        },
      },
      repository: {
        owner: {
          login: 'test-owner',
        },
        name: 'test-repo',
      },
    },
  },
  'pull_request.opened': {
    name: 'Pull Request Opened',
    payload: {
      action: 'opened',
      pull_request: {
        number: 1,
        title: 'Test Pull Request',
        body: 'This is a test pull request created by the local development server.',
        labels: [],
        user: {
          login: 'test-user',
        },
      },
      repository: {
        owner: {
          login: 'test-owner',
        },
        name: 'test-repo',
      },
    },
  },
  'pull_request_review.submitted': {
    name: 'Pull Request Review Submitted',
    payload: {
      action: 'submitted',
      pull_request: {
        number: 1,
        title: 'Test Pull Request',
        body: 'This is a test pull request.',
        user: {
          login: 'test-user',
        },
      },
      review: {
        state: 'approved',
        body: 'LGTM!',
        user: {
          login: 'reviewer',
        },
      },
      repository: {
        owner: {
          login: 'test-owner',
        },
        name: 'test-repo',
      },
    },
  },
  'push': {
    name: 'Push',
    payload: {
      ref: 'refs/heads/main',
      commits: [
        {
          id: '123456789abcdef',
          message: 'Test commit',
          author: {
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ],
      repository: {
        owner: {
          login: 'test-owner',
        },
        name: 'test-repo',
      },
    },
  },
  'release.published': {
    name: 'Release Published',
    payload: {
      action: 'published',
      release: {
        tag_name: 'v1.0.0',
        name: 'Test Release',
        body: 'This is a test release created by the local development server.',
      },
      repository: {
        owner: {
          login: 'test-owner',
        },
        name: 'test-repo',
      },
    },
  },
};

// Mock GitHub API responses
const MOCK_API_RESPONSES = {
  // Get repository
  'GET /repos/:owner/:repo': {
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    owner: {
      login: 'test-owner',
    },
    html_url: 'https://github.com/test-owner/test-repo',
    description: 'Test repository for local development',
    stargazers_count: 10,
    watchers_count: 10,
    forks_count: 5,
    open_issues_count: 3,
  },
  // Get issue
  'GET /repos/:owner/:repo/issues/:issue_number': {
    number: 1,
    title: 'Test Issue',
    body: 'This is a test issue created by the local development server.',
    labels: [],
    user: {
      login: 'test-user',
    },
    state: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Create issue comment
  'POST /repos/:owner/:repo/issues/:issue_number/comments': {
    id: 1,
    body: 'Comment created by the local development server.',
    user: {
      login: 'test-user',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Add labels to issue
  'POST /repos/:owner/:repo/issues/:issue_number/labels': {
    status: 200,
  },
  // Get pull request
  'GET /repos/:owner/:repo/pulls/:pull_number': {
    number: 1,
    title: 'Test Pull Request',
    body: 'This is a test pull request created by the local development server.',
    labels: [],
    user: {
      login: 'test-user',
    },
    state: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Create pull request comment
  'POST /repos/:owner/:repo/pulls/:pull_number/comments': {
    id: 1,
    body: 'Comment created by the local development server.',
    user: {
      login: 'test-user',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Plugin process management
let pluginProcess: ChildProcess | null = null;
let isRestarting = false;
let pluginPath: string;

// Start the plugin process
function startPluginProcess(pluginPath: string, env: Record<string, string> = {}): ChildProcess {
  console.log(chalk.blue(`Starting plugin process from ${pluginPath}...`));

  // Set up environment variables
  const processEnv = {
    ...process.env,
    ...env,
    // Add standard GitHub Action inputs
    STATE_ID: 'test-state-id',
    EVENT_NAME: env.EVENT_NAME || 'test-event',
    EVENT_PAYLOAD: env.EVENT_PAYLOAD || '{}',
    SETTINGS: env.SETTINGS || '{}',
    AUTH_TOKEN: 'test-auth-token',
    REF: 'refs/heads/main',
    SIGNATURE: 'test-signature',
    COMMAND: '',
    PLUGIN_GITHUB_TOKEN: 'test-github-token',
    KERNEL_PUBLIC_KEY: 'test-kernel-public-key',
    LOG_LEVEL: 'debug',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_KEY: 'test-supabase-key',
    USE_WASM: 'true',
  };

  // Start the process
  const child = spawn('bun', ['run', pluginPath], {
    env: processEnv,
    stdio: 'pipe',
  });

  // Handle process output
  child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(chalk.green('[Plugin]'), output);

    // Emit to connected clients
    io.emit('plugin:log', {
      type: 'stdout',
      data: output,
    });
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(chalk.red('[Plugin Error]'), output);

    // Emit to connected clients
    io.emit('plugin:log', {
      type: 'stderr',
      data: output,
    });
  });

  // Handle process exit
  child.on('close', (code) => {
    console.log(chalk.yellow(`Plugin process exited with code ${code}`));

    // Emit to connected clients
    io.emit('plugin:status', {
      status: 'stopped',
      code,
    });

    // Restart if not intentionally stopping
    if (!isRestarting) {
      console.log(chalk.blue('Plugin crashed. Restarting...'));
      pluginProcess = startPluginProcess(pluginPath, env);
    }
  });

  // Emit to connected clients
  io.emit('plugin:status', {
    status: 'running',
  });

  return child;
}

// Restart the plugin process
function restartPluginProcess(pluginPath: string, env: Record<string, string> = {}): void {
  if (pluginProcess) {
    isRestarting = true;
    console.log(chalk.blue('Restarting plugin process...'));

    // Kill the existing process
    pluginProcess.kill();

    // Start a new process
    setTimeout(() => {
      pluginProcess = startPluginProcess(pluginPath, env);
      isRestarting = false;
    }, 1000);
  } else {
    pluginProcess = startPluginProcess(pluginPath, env);
  }
}

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(join(ROOT_DIR, 'public')));

// Mock GitHub API
app.all('/api/github/*', (req, res) => {
  const path = req.path.replace('/api/github', '');
  const method = req.method;

  // Log the request
  console.log(chalk.blue(`[GitHub API] ${method} ${path}`));
  console.log(chalk.gray('Request Body:'), req.body);

  // Find a matching mock response
  const mockKey = `${method} ${path}`;
  let mockResponse = MOCK_API_RESPONSES[mockKey as keyof typeof MOCK_API_RESPONSES];

  // If no exact match, try to find a pattern match
  if (!mockResponse) {
    for (const [pattern, response] of Object.entries(MOCK_API_RESPONSES)) {
      const patternParts = pattern.split(' ');
      const methodPattern = patternParts[0];
      const pathPattern = patternParts.slice(1).join(' ');

      if (method === methodPattern) {
        const pathRegex = new RegExp(
          '^' + pathPattern.replace(/:[^/]+/g, '([^/]+)') + '$'
        );

        if (pathRegex.test(path)) {
          mockResponse = response;
          break;
        }
      }
    }
  }

  // Return the mock response or a 404
  if (mockResponse) {
    // Add a delay to simulate network latency
    setTimeout(() => {
      res.json(mockResponse);

      // Log the response
      console.log(chalk.green('[GitHub API] Response:'), mockResponse);

      // Emit to connected clients
      io.emit('api:request', {
        method,
        path,
        body: req.body,
        response: mockResponse,
      });
    }, 200);
  } else {
    res.status(404).json({
      message: `No mock response found for ${method} ${path}`,
    });

    // Log the error
    console.error(chalk.red(`[GitHub API] No mock response found for ${method} ${path}`));

    // Emit to connected clients
    io.emit('api:request', {
      method,
      path,
      body: req.body,
      error: `No mock response found for ${method} ${path}`,
    });
  }
});

// Webhook event endpoint
app.post('/api/webhook', (req, res) => {
  const { event, payload } = req.body;

  // Log the webhook event
  console.log(chalk.blue(`[Webhook] Received ${event} event`));
  console.log(chalk.gray('Payload:'), payload);

  // Emit to connected clients
  io.emit('webhook:event', {
    event,
    payload,
  });

  // Trigger the plugin with the event
  if (pluginProcess) {
    restartPluginProcess(
      pluginPath,
      {
        EVENT_NAME: event,
        EVENT_PAYLOAD: JSON.stringify(payload),
      }
    );
  }

  res.json({
    status: 'success',
    message: `Webhook event ${event} processed`,
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(chalk.blue(`[Socket.IO] Client connected: ${socket.id}`));

  // Send available event templates
  socket.emit('events:templates', EVENT_TEMPLATES);

  // Handle webhook event trigger
  socket.on('webhook:trigger', ({ event, payload }) => {
    console.log(chalk.blue(`[Socket.IO] Triggering webhook event: ${event}`));

    // Trigger the plugin with the event
    if (pluginProcess) {
      restartPluginProcess(
        pluginPath,
        {
          EVENT_NAME: event,
          EVENT_PAYLOAD: JSON.stringify(payload),
        }
      );
    }

    // Emit to all clients
    io.emit('webhook:event', {
      event,
      payload,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(chalk.yellow(`[Socket.IO] Client disconnected: ${socket.id}`));
  });
});

// Create the dashboard HTML
function createDashboardHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Action Plugin Development Server</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f6f8fa;
      color: #24292e;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #24292e;
      color: white;
      padding: 20px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .card {
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-header {
      border-bottom: 1px solid #e1e4e8;
      padding-bottom: 10px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h2 {
      margin: 0;
      font-size: 18px;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #e1e4e8;
      margin-bottom: 15px;
    }
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .tab.active {
      border-bottom-color: #0366d6;
      font-weight: bold;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .log-container {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 10px;
      height: 300px;
      overflow-y: auto;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .log-entry {
      margin-bottom: 5px;
      line-height: 1.5;
    }
    .log-stdout {
      color: #24292e;
    }
    .log-stderr {
      color: #d73a49;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    select, textarea, input {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e1e4e8;
      background-color: #f6f8fa;
      font-size: 14px;
    }
    textarea {
      height: 200px;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    }
    button {
      background-color: #2ea44f;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
    }
    button:hover {
      background-color: #2c974b;
    }
    .api-request {
      margin-bottom: 10px;
      padding: 10px;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
    .api-request-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .api-request-method {
      font-weight: bold;
      color: #0366d6;
    }
    .api-request-path {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    }
    .api-request-body, .api-request-response {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-top: 5px;
    }
    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-running {
      background-color: #2ea44f;
      color: white;
    }
    .status-stopped {
      background-color: #d73a49;
      color: white;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>GitHub Action Plugin Development Server</h1>
    </div>
  </header>

  <div class="container">
    <div class="card">
      <div class="card-header">
        <h2>Plugin Status</h2>
        <div class="status status-stopped" id="plugin-status">Stopped</div>
      </div>
      <div class="tabs">
        <div class="tab active" data-tab="logs">Logs</div>
        <div class="tab" data-tab="api-requests">API Requests</div>
        <div class="tab" data-tab="webhook-events">Webhook Events</div>
      </div>
      <div class="tab-content active" data-tab-content="logs">
        <div class="log-container" id="log-container"></div>
      </div>
      <div class="tab-content" data-tab-content="api-requests">
        <div class="log-container" id="api-requests-container"></div>
      </div>
      <div class="tab-content" data-tab-content="webhook-events">
        <div class="log-container" id="webhook-events-container"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Trigger Webhook Event</h2>
      </div>
      <div class="form-group">
        <label for="event-type">Event Type</label>
        <select id="event-type">
          <!-- Event types will be populated by JavaScript -->
        </select>
      </div>
      <div class="form-group">
        <label for="event-payload">Event Payload</label>
        <textarea id="event-payload"></textarea>
      </div>
      <button id="trigger-event">Trigger Event</button>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // Connect to Socket.IO
    const socket = io();

    // DOM elements
    const logContainer = document.getElementById('log-container');
    const apiRequestsContainer = document.getElementById('api-requests-container');
    const webhookEventsContainer = document.getElementById('webhook-events-container');
    const pluginStatus = document.getElementById('plugin-status');
    const eventTypeSelect = document.getElementById('event-type');
    const eventPayloadTextarea = document.getElementById('event-payload');
    const triggerEventButton = document.getElementById('trigger-event');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));

        tab.classList.add('active');
        const tabContent = document.querySelector(\`[data-tab-content="\${tab.dataset.tab}"]\`);
        tabContent.classList.add('active');
      });
    });

    // Plugin logs
    socket.on('plugin:log', ({ type, data }) => {
      const logEntry = document.createElement('div');
      logEntry.classList.add('log-entry');
      logEntry.classList.add(\`log-\${type}\`);
      logEntry.textContent = data;

      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
    });

    // Plugin status
    socket.on('plugin:status', ({ status, code }) => {
      pluginStatus.textContent = status === 'running' ? 'Running' : \`Stopped (Code: \${code})\`;
      pluginStatus.className = \`status status-\${status}\`;
    });

    // API requests
    socket.on('api:request', (data) => {
      const requestDiv = document.createElement('div');
      requestDiv.classList.add('api-request');

      const headerDiv = document.createElement('div');
      headerDiv.classList.add('api-request-header');

      const methodSpan = document.createElement('span');
      methodSpan.classList.add('api-request-method');
      methodSpan.textContent = data.method;

      const pathSpan = document.createElement('span');
      pathSpan.classList.add('api-request-path');
      pathSpan.textContent = data.path;

      headerDiv.appendChild(methodSpan);
      headerDiv.appendChild(pathSpan);
      requestDiv.appendChild(headerDiv);

      if (data.body && Object.keys(data.body).length > 0) {
        const bodyDiv = document.createElement('div');
        bodyDiv.classList.add('api-request-body');
        bodyDiv.textContent = \`Request: \${JSON.stringify(data.body, null, 2)}\`;
        requestDiv.appendChild(bodyDiv);
      }

      if (data.response) {
        const responseDiv = document.createElement('div');
        responseDiv.classList.add('api-request-response');
        responseDiv.textContent = \`Response: \${JSON.stringify(data.response, null, 2)}\`;
        requestDiv.appendChild(responseDiv);
      }

      if (data.error) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('api-request-response');
        errorDiv.style.color = '#d73a49';
        errorDiv.textContent = \`Error: \${data.error}\`;
        requestDiv.appendChild(errorDiv);
      }

      apiRequestsContainer.appendChild(requestDiv);
      apiRequestsContainer.scrollTop = apiRequestsContainer.scrollHeight;
    });

    // Webhook events
    socket.on('webhook:event', (data) => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('api-request');

      const headerDiv = document.createElement('div');
      headerDiv.classList.add('api-request-header');

      const eventSpan = document.createElement('span');
      eventSpan.classList.add('api-request-method');
      eventSpan.textContent = data.event;

      headerDiv.appendChild(eventSpan);
      eventDiv.appendChild(headerDiv);

      const payloadDiv = document.createElement('div');
      payloadDiv.classList.add('api-request-body');
      payloadDiv.textContent = JSON.stringify(data.payload, null, 2);
      eventDiv.appendChild(payloadDiv);

      webhookEventsContainer.appendChild(eventDiv);
      webhookEventsContainer.scrollTop = webhookEventsContainer.scrollHeight;
    });

    // Event templates
    socket.on('events:templates', (templates) => {
      eventTypeSelect.innerHTML = '';

      for (const [event, template] of Object.entries(templates)) {
        const option = document.createElement('option');
        option.value = event;
        option.textContent = \`\${template.name} (\${event})\`;
        eventTypeSelect.appendChild(option);
      }

      // Set initial payload
      updateEventPayload();
    });

    // Update event payload when event type changes
    function updateEventPayload() {
      const selectedEvent = eventTypeSelect.value;
      const template = socket._callbacks.$['events:templates'][0].arguments[0][selectedEvent];

      if (template) {
        eventPayloadTextarea.value = JSON.stringify(template.payload, null, 2);
      }
    }

    eventTypeSelect.addEventListener('change', updateEventPayload);

    // Trigger webhook event
    triggerEventButton.addEventListener('click', () => {
      const event = eventTypeSelect.value;
      let payload;

      try {
        payload = JSON.parse(eventPayloadTextarea.value);
      } catch (error) {
        alert(\`Invalid JSON payload: \${error.message}\`);
        return;
      }

      socket.emit('webhook:trigger', { event, payload });
    });
  </script>
</body>
</html>
  `;
}

// Main function
async function main() {
  const program = new Command();

  program
    .name('local-dev-server')
    .description('Local Development Server for GitHub Action Plugins')
    .version('1.0.0')
    .option('-p, --port <port>', 'Port to run the server on', '3000')
    .option('-d, --plugin-dir <dir>', 'Path to the plugin directory', 'test-plugins/my-plugin')
    .option('-f, --plugin-file <file>', 'Path to the plugin entry file', 'src/index.js')
    .option('-w, --watch', 'Watch for file changes and restart the plugin', true)
    .parse(process.argv);

  const options = program.opts();
  const port = parseInt(options.port, 10);
  const pluginDir = resolve(process.cwd(), options.pluginDir);
  const pluginFile = options.pluginFile;
  pluginPath = join(pluginDir, pluginFile);

  // Check if the plugin exists
  if (!existsSync(pluginPath)) {
    console.error(chalk.red(`Plugin file not found: ${pluginPath}`));
    console.error(chalk.yellow('Please specify a valid plugin path with --plugin-dir and --plugin-file'));
    process.exit(1);
  }

  // Create the dashboard HTML
  const dashboardHtml = createDashboardHtml();
  writeFileSync(join(ROOT_DIR, 'public', 'index.html'), dashboardHtml);

  // Start the server
  httpServer.listen(port, () => {
    console.log(chalk.green(`Local Development Server running at http://localhost:${port}`));
    console.log(chalk.blue(`Plugin: ${pluginPath}`));

    // Start the plugin process
    pluginProcess = startPluginProcess(pluginPath);

    // Watch for file changes
    if (options.watch) {
      console.log(chalk.blue(`Watching for changes in ${pluginDir}...`));

      const watcher = watch(pluginDir, {
        ignored: /(^|[\/\\])\../, // Ignore dotfiles
        persistent: true,
      });

      watcher.on('change', (path) => {
        console.log(chalk.yellow(`File changed: ${path}`));
        restartPluginProcess(pluginPath);
      });
    }
  });

  // Handle process exit
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down...'));

    if (pluginProcess) {
      pluginProcess.kill();
    }

    httpServer.close(() => {
      console.log(chalk.green('Server stopped'));
      process.exit(0);
    });
  });
}

main().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
