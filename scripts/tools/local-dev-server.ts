#!/usr/bin/env bun

/**
 * Local development server for testing plugins
 * Usage: bun run dev:server --plugin-dir my-plugin
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import chokidar from 'chokidar';
import chalk from 'chalk';
import { program } from 'commander';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
program
  .option('-p, --port <number>', 'Port to run the server on', '3000')
  .option('-d, --plugin-dir <path>', 'Path to the plugin directory', 'my-plugin')
  .option('-e, --event <name>', 'Event to simulate', 'issue.opened')
  .option('-w, --watch', 'Watch for file changes and reload', false)
  .parse(process.argv);

const options = program.opts();
const PORT = parseInt(options.port, 10);
const PLUGIN_DIR = path.resolve(process.cwd(), options.pluginDir);
const EVENT_NAME = options.event;
const WATCH_MODE = options.watch;

// Check if the plugin directory exists
if (!fs.existsSync(PLUGIN_DIR)) {
  console.error(chalk.red(`Plugin directory not found: ${PLUGIN_DIR}`));
  process.exit(1);
}

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple HTML dashboard
const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plugin Development Server</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2 {
      color: #0366d6;
    }
    .card {
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .event-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    .event-button {
      background: #0366d6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .event-button:hover {
      background: #0255b3;
    }
    pre {
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 16px;
      overflow: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
    }
    .log-container {
      height: 300px;
      overflow-y: auto;
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 16px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
    }
    .log-entry {
      margin: 4px 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .log-info {
      color: #0366d6;
    }
    .log-error {
      color: #d73a49;
    }
    .log-success {
      color: #22863a;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #e1e4e8;
      margin-bottom: 16px;
    }
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .tab.active {
      border-bottom: 2px solid #0366d6;
      font-weight: bold;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .payload-editor {
      width: 100%;
      height: 300px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
      padding: 8px;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
    }
    .status {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .status.running {
      background: #22863a;
    }
    .status.stopped {
      background: #d73a49;
    }
  </style>
</head>
<body>
  <h1>Plugin Development Server</h1>
  <div class="card">
    <h2>Plugin: <span id="plugin-name">Loading...</span></h2>
    <p>Status: <span class="status stopped" id="status-indicator"></span> <span id="status-text">Stopped</span></p>
    <button id="start-button" class="event-button">Start Plugin</button>
    <button id="stop-button" class="event-button" style="background: #d73a49; display: none;">Stop Plugin</button>
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="events">Events</div>
    <div class="tab" data-tab="logs">Logs</div>
    <div class="tab" data-tab="payload">Payload Editor</div>
  </div>

  <div class="tab-content active" id="events-tab">
    <h2>Trigger Events</h2>
    <div class="event-list" id="event-list">
      <button class="event-button" data-event="issue.opened">issue.opened</button>
      <button class="event-button" data-event="issue.closed">issue.closed</button>
      <button class="event-button" data-event="issue.labeled">issue.labeled</button>
      <button class="event-button" data-event="pull_request.opened">pull_request.opened</button>
      <button class="event-button" data-event="pull_request.review">pull_request.review</button>
      <button class="event-button" data-event="push">push</button>
      <button class="event-button" data-event="release">release</button>
      <button class="event-button" data-event="external.service">external.service</button>
    </div>
  </div>

  <div class="tab-content" id="logs-tab">
    <h2>Logs</h2>
    <div class="log-container" id="log-container"></div>
  </div>

  <div class="tab-content" id="payload-tab">
    <h2>Payload Editor</h2>
    <p>Customize the event payload:</p>
    <textarea id="payload-editor" class="payload-editor"></textarea>
    <button id="save-payload" class="event-button" style="margin-top: 10px;">Save Payload</button>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    let pluginProcess = null;
    let currentEvent = 'issue.opened';
    let customPayloads = {};

    // Default payloads
    const defaultPayloads = {
      'issue.opened': {
        issue: {
          number: 1,
          title: 'Test Issue',
          body: 'This is a test issue created by the development server.',
          labels: []
        },
        repository: {
          owner: {
            login: 'test-user'
          },
          name: 'test-repo'
        }
      },
      'external.service': {
        issue: {
          number: 1,
          title: 'Test Issue for External Service',
          body: 'This is a test issue for external service integration.',
          labels: []
        },
        repository: {
          owner: {
            login: 'test-user'
          },
          name: 'test-repo'
        }
      }
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      // Tab switching
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

          tab.classList.add('active');
          document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
        });
      });

      // Event buttons
      document.querySelectorAll('.event-button[data-event]').forEach(button => {
        button.addEventListener('click', () => {
          currentEvent = button.dataset.event;
          triggerEvent(currentEvent);
        });
      });

      // Start/Stop buttons
      document.getElementById('start-button').addEventListener('click', startPlugin);
      document.getElementById('stop-button').addEventListener('click', stopPlugin);

      // Payload editor
      const payloadEditor = document.getElementById('payload-editor');
      payloadEditor.value = JSON.stringify(defaultPayloads['issue.opened'] || {}, null, 2);

      document.getElementById('save-payload').addEventListener('click', () => {
        try {
          const payload = JSON.parse(payloadEditor.value);
          customPayloads[currentEvent] = payload;
          addLogEntry('Payload saved for event: ' + currentEvent, 'success');
        } catch (error) {
          addLogEntry('Invalid JSON: ' + error.message, 'error');
        }
      });

      // Socket events
      socket.on('connect', () => {
        addLogEntry('Connected to development server', 'info');
      });

      socket.on('plugin-info', (info) => {
        document.getElementById('plugin-name').textContent = info.name;
      });

      socket.on('plugin-started', () => {
        updatePluginStatus(true);
        addLogEntry('Plugin started', 'success');
      });

      socket.on('plugin-stopped', () => {
        updatePluginStatus(false);
        addLogEntry('Plugin stopped', 'info');
      });

      socket.on('plugin-log', (log) => {
        addLogEntry(log.message, log.type);
      });

      socket.on('event-triggered', (data) => {
        addLogEntry(`Event triggered: ${data.event}`, 'info');
      });

      // Request plugin info
      socket.emit('get-plugin-info');
    });

    function updatePluginStatus(running) {
      const indicator = document.getElementById('status-indicator');
      const text = document.getElementById('status-text');
      const startButton = document.getElementById('start-button');
      const stopButton = document.getElementById('stop-button');

      if (running) {
        indicator.className = 'status running';
        text.textContent = 'Running';
        startButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
      } else {
        indicator.className = 'status stopped';
        text.textContent = 'Stopped';
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
      }
    }

    function startPlugin() {
      socket.emit('start-plugin');
    }

    function stopPlugin() {
      socket.emit('stop-plugin');
    }

    function triggerEvent(event) {
      const payload = customPayloads[event] || defaultPayloads[event] || {};
      socket.emit('trigger-event', { event, payload });

      // Update payload editor with current event's payload
      const payloadEditor = document.getElementById('payload-editor');
      payloadEditor.value = JSON.stringify(customPayloads[event] || defaultPayloads[event] || {}, null, 2);

      // Switch to logs tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('.tab[data-tab="logs"]').classList.add('active');
      document.getElementById('logs-tab').classList.add('active');
    }

    function addLogEntry(message, type = 'info') {
      const logContainer = document.getElementById('log-container');
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      logContainer.appendChild(entry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  </script>
</body>
</html>
`;

// Write the dashboard HTML to the public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), dashboardHtml);

// Sample event payloads
const eventPayloads = {
  'issue.opened': {
    issue: {
      number: 1,
      title: 'Test Issue',
      body: 'This is a test issue created by the development server.',
      labels: []
    },
    repository: {
      owner: {
        login: 'test-user'
      },
      name: 'test-repo'
    }
  },
  'external.service': {
    issue: {
      number: 1,
      title: 'Test Issue for External Service',
      body: 'This is a test issue for external service integration.',
      labels: []
    },
    repository: {
      owner: {
        login: 'test-user'
      },
      name: 'test-repo'
    }
  }
};

// Plugin process
let pluginProcess = null;

// Start the plugin
function startPlugin() {
  if (pluginProcess) {
    console.log(chalk.yellow('Plugin is already running'));
    return;
  }

  console.log(chalk.green(`Starting plugin from ${PLUGIN_DIR}`));

  // Execute the plugin
  pluginProcess = exec(`cd ${PLUGIN_DIR} && bun run src/index.js`, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red(`Plugin execution error: ${error.message}`));
      io.emit('plugin-log', { message: `Execution error: ${error.message}`, type: 'error' });
      return;
    }

    if (stderr) {
      console.error(chalk.red(`Plugin stderr: ${stderr}`));
      io.emit('plugin-log', { message: `stderr: ${stderr}`, type: 'error' });
    }

    console.log(chalk.green(`Plugin stdout: ${stdout}`));
    io.emit('plugin-log', { message: stdout, type: 'info' });
  });

  // Handle plugin process events
  pluginProcess.on('exit', (code) => {
    console.log(chalk.yellow(`Plugin process exited with code ${code}`));
    io.emit('plugin-log', { message: `Plugin process exited with code ${code}`, type: 'info' });
    io.emit('plugin-stopped');
    pluginProcess = null;
  });

  io.emit('plugin-started');
}

// Stop the plugin
function stopPlugin() {
  if (!pluginProcess) {
    console.log(chalk.yellow('No plugin is running'));
    return;
  }

  console.log(chalk.yellow('Stopping plugin'));
  pluginProcess.kill();
  pluginProcess = null;
  io.emit('plugin-stopped');
}

// Trigger an event
function triggerEvent(eventName, payload) {
  console.log(chalk.blue(`Triggering event: ${eventName}`));
  io.emit('plugin-log', { message: `Triggering event: ${eventName}`, type: 'info' });
  io.emit('event-triggered', { event: eventName });

  // In a real implementation, this would send the event to the plugin
  // For now, we'll just log it
  console.log(chalk.blue(`Event payload: ${JSON.stringify(payload, null, 2)}`));
  io.emit('plugin-log', { message: `Event payload: ${JSON.stringify(payload, null, 2)}`, type: 'info' });
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log(chalk.green('Client connected'));

  // Send plugin info
  socket.on('get-plugin-info', () => {
    try {
      const configPath = path.join(PLUGIN_DIR, 'plugin.config.js');
      const configTsPath = path.join(PLUGIN_DIR, 'plugin.config.ts');

      let pluginName = path.basename(PLUGIN_DIR);

      if (fs.existsSync(configPath)) {
        const config = require(configPath);
        pluginName = config.name || pluginName;
      } else if (fs.existsSync(configTsPath)) {
        // For TypeScript config, we can't require it directly
        // So we'll just use the directory name
      }

      socket.emit('plugin-info', { name: pluginName });
    } catch (error) {
      console.error(chalk.red(`Error getting plugin info: ${error.message}`));
      socket.emit('plugin-info', { name: path.basename(PLUGIN_DIR) });
    }
  });

  // Start plugin
  socket.on('start-plugin', () => {
    startPlugin();
  });

  // Stop plugin
  socket.on('stop-plugin', () => {
    stopPlugin();
  });

  // Trigger event
  socket.on('trigger-event', (data) => {
    const { event, payload } = data;
    triggerEvent(event, payload || eventPayloads[event] || {});
  });
});

// Watch for file changes
if (WATCH_MODE) {
  console.log(chalk.blue(`Watching for changes in ${PLUGIN_DIR}`));

  const watcher = chokidar.watch(`${PLUGIN_DIR}/src/**/*.{js,ts}`, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher.on('change', (path) => {
    console.log(chalk.blue(`File changed: ${path}`));
    io.emit('plugin-log', { message: `File changed: ${path}`, type: 'info' });

    // Restart the plugin if it's running
    if (pluginProcess) {
      stopPlugin();
      setTimeout(() => {
        startPlugin();
      }, 1000);
    }
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(chalk.green(`Development server running at http://localhost:${PORT}`));
  console.log(chalk.green(`Plugin directory: ${PLUGIN_DIR}`));
  console.log(chalk.green(`Default event: ${EVENT_NAME}`));
  console.log(chalk.green(`Watch mode: ${WATCH_MODE ? 'enabled' : 'disabled'}`));
  console.log(chalk.blue('Open your browser to view the dashboard'));
});
