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

// Check if the plugin directory provided is a full path or just a name
let pluginPath = options.pluginDir;
if (!path.isAbsolute(pluginPath) && !pluginPath.startsWith('./') && !pluginPath.startsWith('../')) {
  // If it's just a name, assume it's in the plugins directory
  pluginPath = path.join('plugins', pluginPath);
}

const PLUGIN_DIR = path.resolve(process.cwd(), pluginPath);
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

// Read the dashboard HTML template from file
const templatePath = path.join(__dirname, 'dashboard-template.html');
let dashboardHtml = '';

try {
  dashboardHtml = fs.readFileSync(templatePath, 'utf8');
  console.log(chalk.green(`Loaded dashboard template from ${templatePath}`));
} catch (error) {
  console.error(chalk.red(`Error loading dashboard template: ${error.message}`));
  dashboardHtml = `<!DOCTYPE html>
  <html>
  <head><title>Error</title></head>
  <body>
    <h1>Error loading template</h1>
    <p>Please make sure the dashboard-template.html file exists.</p>
  </body>
  </html>`;
}

// Write the dashboard HTML to the public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), dashboardHtml);

// Basic validation of the JavaScript in the template
try {
  const scriptMatch = dashboardHtml.match(/<script>([\s\S]*?)<\/script>/);
  const scriptContent = scriptMatch ? scriptMatch[1] : '';

  // This won't catch all errors, but it can catch syntax errors
  new Function(scriptContent);
} catch (error) {
  console.warn(chalk.yellow(`Warning: JavaScript in HTML template may have errors: ${error.message}`));
}

// Sample event payloads
const eventPayloads: Record<string, any> = {
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

// Plugin process and metadata
let pluginProcess: any = null;

interface PluginConfigInfo {
  name: string;
  version?: string | null;
  features?: string[];
  icon?: string | null;
  color?: string | null;
  packageJson?: any;
}

interface PluginMetadata {
  startTime: Date | null;
  endTime: Date | null;
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  eventCount: number;
  configInfo: PluginConfigInfo | null;
}

let pluginMetadata: PluginMetadata = {
  startTime: null,
  endTime: null,
  exitCode: null,
  signal: null,
  stdout: '',
  stderr: '',
  eventCount: 0,
  configInfo: null  // Will store plugin config info
};

// Helper function to extract plugin config information
function getPluginConfigInfo(): PluginConfigInfo {
  try {
    const configPath = path.join(PLUGIN_DIR, 'plugin.config.js');
    const configTsPath = path.join(PLUGIN_DIR, 'plugin.config.ts');
    const packagePath = path.join(PLUGIN_DIR, 'package.json');

    const info: PluginConfigInfo = {
      name: path.basename(PLUGIN_DIR),
      version: null,
      features: [],
      icon: null,
      color: null,
      packageJson: null
    };

    // Try to get info from package.json
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      info.version = packageJson.version;
      info.packageJson = packageJson;
    }

    // Try to extract from config files
    if (fs.existsSync(configPath)) {
      const config = require(configPath);
      Object.assign(info, {
        name: config.name || info.name,
        features: config.features || info.features,
        icon: config.icon || info.icon,
        color: config.color || info.color
      });
    } else if (fs.existsSync(configTsPath)) {
      // For TS files we can't directly require, so we read as text and extract basic info
      const configContent = fs.readFileSync(configTsPath, 'utf8');
      const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);
      if (nameMatch) info.name = nameMatch[1];

      const featuresMatch = configContent.match(/features:\s*\[(.*?)\]/s);
      if (featuresMatch) {
        const featuresStr = featuresMatch[1];
        const featuresItems = featuresStr.match(/['"]([^'"]+)['"]/g);
        if (featuresItems) {
          info.features = featuresItems.map(item => item.replace(/['"]/g, ''));
        }
      }
    }

    return info;
  } catch (error) {
    console.error(chalk.red(`Error getting plugin config info: ${error.message}`));
    return { name: path.basename(PLUGIN_DIR) };
  }
}

// Start the plugin
function startPlugin() {
  if (pluginProcess) {
    console.log(chalk.yellow('Plugin is already running'));
    return;
  }

  // Reset metadata for new run
  pluginMetadata = {
    startTime: new Date(),
    endTime: null,
    exitCode: null,
    signal: null,
    stdout: '',
    stderr: '',
    eventCount: 0,
    configInfo: getPluginConfigInfo()
  };

  console.log(chalk.green(`Starting plugin from ${PLUGIN_DIR}`));

  // Execute the plugin
  pluginProcess = exec(`cd ${PLUGIN_DIR} && bun run src/index.js`, (error: any, stdout: string, stderr: string) => {
    if (error) {
      console.error(chalk.red(`Plugin execution error: ${error.message}`));
      io.emit('plugin-log', { message: `Execution error: ${error.message}`, type: 'error' });
      pluginMetadata.stderr += stderr;
      return;
    }

    if (stderr) {
      console.error(chalk.red(`Plugin stderr: ${stderr}`));
      io.emit('plugin-log', { message: `stderr: ${stderr}`, type: 'error' });
      pluginMetadata.stderr += stderr;
    }

    console.log(chalk.green(`Plugin stdout: ${stdout}`));
    io.emit('plugin-log', { message: stdout, type: 'info' });
    pluginMetadata.stdout += stdout;
  });

  // Handle plugin process events
  if (pluginProcess) {
    pluginProcess.on('exit', (code: number | null, signal: string | null) => {
      pluginMetadata.endTime = new Date();
      pluginMetadata.exitCode = code;
      pluginMetadata.signal = signal;

      const duration = pluginMetadata.endTime && pluginMetadata.startTime ?
        (pluginMetadata.endTime.getTime() - pluginMetadata.startTime.getTime()) / 1000 : 0; // in seconds

      console.log(chalk.yellow(`Plugin process exited with code ${code}${signal ? `, signal: ${signal}` : ''}`));
      io.emit('plugin-log', {
        message: `Plugin process exited with code ${code}${signal ? `, signal: ${signal}` : ''} after ${duration.toFixed(2)}s`,
        type: 'info'
      });

      // Send complete metadata to the UI
      io.emit('plugin-stopped', pluginMetadata);
      pluginProcess = null;
    });
  }

  io.emit('plugin-started', {
    startTime: pluginMetadata.startTime,
    configInfo: pluginMetadata.configInfo
  });
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
  io.emit('plugin-stopped', pluginMetadata);
}

// Trigger an event
function triggerEvent(eventName: string, payload: any) {
  console.log(chalk.blue(`Triggering event: ${eventName}`));
  io.emit('plugin-log', { message: `Triggering event: ${eventName}`, type: 'info' });
  io.emit('event-triggered', { event: eventName });

  // Increment event count in metadata
  pluginMetadata.eventCount++;

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
  socket.on('trigger-event', (data: { event: string, payload?: any }) => {
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
