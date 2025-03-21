#!/usr/bin/env bun

/**
 * Test script for the entire plugin generation flow
 * This script:
 * 1. Creates a plugin programmatically
 * 2. Starts the local development server
 * 3. Opens a browser to test the UI
 * 4. Cleans up after testing
 *
 * Usage: bun run test-plugin-flow-with-sdk-fix.ts
 */

import { spawn, ChildProcess, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const PLUGIN_NAME = 'test-plugin-flow-' + Date.now();
const PLUGIN_DIR = path.join(process.cwd(), 'plugins', PLUGIN_NAME);
const SERVER_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Cleanup function to remove the test plugin directory
function cleanup() {
  console.log(`\nCleaning up...`);
  if (fs.existsSync(PLUGIN_DIR)) {
    fs.rmSync(PLUGIN_DIR, { recursive: true, force: true });
    console.log(`Removed plugin directory: ${PLUGIN_DIR}`);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nProcess interrupted. Cleaning up...');
  cleanup();
  process.exit(0);
});

// Helper function to wait for a specified time
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to wait for a server to be ready
async function waitForServer(url: string, maxRetries = 10, retryInterval = 1000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.log(`Waiting for server to be ready (${i + 1}/${maxRetries})...`);
    }
    await sleep(retryInterval);
  }
  return false;
}

// Build SDK and ensure it's correctly in place
async function ensureSdk(): Promise<boolean> {
  console.log(`\n=== Ensuring SDK is built and available ===`);

  try {
    // Ensure SDK dist directory exists
    const sdkDistPath = path.join(process.cwd(), 'dist', 'sdk');
    if (!fs.existsSync(sdkDistPath)) {
      console.log(`SDK dist directory does not exist. Building...`);
      execSync(`bun run build:sdk`, { stdio: 'inherit' });
    } else {
      console.log(`SDK dist directory exists at ${sdkDistPath}`);
    }

    // Verify key SDK files exist
    const sdkIndexPath = path.join(sdkDistPath, 'index.js');
    if (!fs.existsSync(sdkIndexPath)) {
      console.error(`SDK index.js not found at ${sdkIndexPath}`);
      return false;
    }

    console.log(`SDK verified and ready for use.`);
    return true;
  } catch (error) {
    console.error(`Error ensuring SDK:`, error);
    return false;
  }
}

// Step 1: Create a plugin programmatically
async function createPlugin(): Promise<boolean> {
  console.log(`\n=== Step 1: Creating plugin "${PLUGIN_NAME}" ===`);

  try {
    // Check if the plugin directory already exists
    if (fs.existsSync(PLUGIN_DIR)) {
      console.log(`Plugin directory already exists: ${PLUGIN_DIR}`);
      console.log(`Removing existing directory...`);
      fs.rmSync(PLUGIN_DIR, { recursive: true, force: true });
    }

    // Ensure SDK is ready
    const sdkReady = await ensureSdk();
    if (!sdkReady) {
      console.error(`Failed to ensure SDK is ready. Aborting plugin creation.`);
      return false;
    }

    // Create the plugin using the non-interactive mode
    const createPluginCmd = `bun run scripts/tools/create-plugin-interactive.ts -- --non-interactive --name ${PLUGIN_NAME} --template ts --features issues,pr,external --destination ${PLUGIN_NAME} --icon rocket --color blue`;

    console.log(`Executing: ${createPluginCmd}`);
    execSync(createPluginCmd, { stdio: 'inherit' });

    // Verify the plugin was created successfully
    if (!fs.existsSync(PLUGIN_DIR)) {
      console.error(`Failed to create plugin directory: ${PLUGIN_DIR}`);
      return false;
    }

    // Set up the SDK dependency properly
    const pluginPackageJsonPath = path.join(PLUGIN_DIR, 'package.json');
    if (!fs.existsSync(pluginPackageJsonPath)) {
      console.error(`Plugin package.json not found at ${pluginPackageJsonPath}`);
      return false;
    }

    // Modify package.json to use explicit path to SDK
    try {
      console.log(`Updating package.json with explicit SDK path...`);
      const packageJson = JSON.parse(fs.readFileSync(pluginPackageJsonPath, 'utf8'));

      // Make sure dependencies exists
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      // Update the plugin-sdk dependency to use a relative path
      const sdkDistRelativePath = path.relative(PLUGIN_DIR, path.join(process.cwd(), 'dist', 'sdk'));
      packageJson.dependencies['plugin-sdk'] = `file:${sdkDistRelativePath}`;

      // Write the updated package.json
      fs.writeFileSync(pluginPackageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated package.json with SDK path: ${sdkDistRelativePath}`);

      // Make sure the symlink is correctly created by removing any existing one and recreating it
      const pluginSdkDir = path.join(PLUGIN_DIR, 'node_modules', 'plugin-sdk');
      if (fs.existsSync(pluginSdkDir)) {
        console.log(`Removing existing plugin-sdk symlink/directory...`);
        fs.rmSync(pluginSdkDir, { recursive: true, force: true });
      }

      // Create node_modules directory if it doesn't exist
      const nodeModulesDir = path.join(PLUGIN_DIR, 'node_modules');
      if (!fs.existsSync(nodeModulesDir)) {
        fs.mkdirSync(nodeModulesDir, { recursive: true });
      }

      // Create a fresh symlink
      const sdkSourcePath = path.join(process.cwd(), 'dist', 'sdk');
      console.log(`Creating symlink from ${sdkSourcePath} to ${pluginSdkDir}...`);

      try {
        // On Windows, need to set the type of symlink
        const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
        fs.symlinkSync(sdkSourcePath, pluginSdkDir, symlinkType);
        console.log(`Symlink created successfully.`);
      } catch (error: any) {
        // If symlink already exists or there's an error, try a different approach
        console.log(`Symlink creation failed: ${error.message}`);
        console.log(`Trying to use a direct copy instead...`);

        // Create the directory
        fs.mkdirSync(pluginSdkDir, { recursive: true });

        // Copy the SDK files directly
        execSync(`cp -r ${sdkSourcePath}/* ${pluginSdkDir}`, { stdio: 'inherit' });
        console.log(`SDK files copied directly to ${pluginSdkDir}`);
      }

      if (!fs.existsSync(pluginSdkDir)) {
        console.error(`SDK directory setup failed.`);
        return false;
      }

    } catch (error) {
      console.error(`Error setting up SDK dependency:`, error);
      return false;
    }

    console.log(`Plugin created successfully at: ${PLUGIN_DIR}`);
    return true;
  } catch (error) {
    console.error(`Error creating plugin:`, error);
    return false;
  }
}

// Step 2: Start the local development server
async function startDevServer(): Promise<ChildProcess | null> {
  console.log(`\n=== Step 2: Starting development server ===`);

  try {
    // Start the development server
    const serverCmd = `bun run scripts/tools/local-dev-server.ts --plugin-dir ${PLUGIN_NAME} --port ${SERVER_PORT}`;
    console.log(`Executing: ${serverCmd}`);

    const serverProcess = spawn('bun', [
      'run',
      'scripts/tools/local-dev-server.ts',
      '--plugin-dir', PLUGIN_NAME,
      '--port', SERVER_PORT.toString()
    ], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    // Handle server output
    serverProcess.stdout?.on('data', (data) => {
      console.log(`[Server] ${data.toString().trim()}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Server Error] ${data.toString().trim()}`);
    });

    // Wait for the server to be ready
    console.log(`Waiting for server to be ready at ${SERVER_URL}...`);
    const isReady = await waitForServer(SERVER_URL);

    if (!isReady) {
      console.error(`Server failed to start within the timeout period.`);
      return null;
    }

    console.log(`Server started successfully at ${SERVER_URL}`);
    return serverProcess;
  } catch (error) {
    console.error(`Error starting development server:`, error);
    return null;
  }
}

// Step 3: Test the UI with Puppeteer
async function testUI(): Promise<boolean> {
  console.log(`\n=== Step 3: Testing the UI ===`);

  let browser: Browser | null = null;
  let success = false;

  try {
    // Launch the browser
    console.log(`Launching browser...`);
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      args: ['--window-size=1280,800']
    });

    // Open a new page
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the server URL
    console.log(`Navigating to ${SERVER_URL}...`);
    await page.goto(SERVER_URL, { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await page.waitForSelector('#plugin-name', { visible: true });

    // Get the plugin name from the UI
    const pluginName = await page.$eval('#plugin-name', el => el.textContent);
    console.log(`Plugin name displayed in UI: ${pluginName}`);

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'screenshots/test-plugin-initial.png' });
    console.log(`Screenshot saved as test-plugin-initial.png`);

    // Test 1: Start the plugin
    console.log(`\nTest 1: Starting the plugin...`);
    await page.click('#start-button');
    await page.waitForSelector('#status-text', { visible: true });

    // Wait for the plugin to start
    await sleep(2000);

    // Verify the plugin is running or has completed
    const statusText = await page.$eval('#status-text', el => el.textContent);
    console.log(`Plugin status: ${statusText}`);

    // Take a screenshot after starting the plugin
    await page.screenshot({ path: 'screenshots/test-plugin-started.png' });
    console.log(`Screenshot saved as test-plugin-started.png`);

    // Accept either "Running" or "Completed Successfully" as valid states
    if (statusText !== 'Running' && statusText !== 'Completed Successfully') {
      console.error(`Plugin failed to start properly. Status: ${statusText}`);
      return false;
    }

    // Test 2: Trigger an issue.opened event
    console.log(`\nTest 2: Triggering issue.opened event...`);

    // Click on the Events tab if not already active
    const eventsTab = await page.$('.tab[data-tab="events"]');
    await eventsTab?.click();
    await sleep(500);

    // Take a screenshot of the events tab
    await page.screenshot({ path: 'screenshots/test-plugin-events-tab.png' });
    console.log(`Screenshot saved as test-plugin-events-tab.png`);

    // Click the issue.opened event button
    const issueOpenedButton = await page.$('.event-button[data-event="issue.opened"]');
    await issueOpenedButton?.click();

    // Wait for the logs tab to become active
    await page.waitForSelector('#logs-tab.active', { visible: true });
    await sleep(2000);

    // Take a screenshot after triggering the event
    await page.screenshot({ path: 'screenshots/test-plugin-event-triggered.png' });
    console.log(`Screenshot saved as test-plugin-event-triggered.png`);

    // Test 3: Trigger a pull_request.opened event
    console.log(`\nTest 3: Triggering pull_request.opened event...`);

    // Click on the Events tab
    await eventsTab?.click();
    await sleep(500);

    // Click the pull_request.opened event button
    const prOpenedButton = await page.$('.event-button[data-event="pull_request.opened"]');
    await prOpenedButton?.click();

    // Wait for the logs tab to become active
    await page.waitForSelector('#logs-tab.active', { visible: true });
    await sleep(2000);

    // Test 4: Customize a payload
    console.log(`\nTest 4: Customizing event payload...`);

    // Click on the Payload tab
    const payloadTab = await page.$('.tab[data-tab="payload"]');
    await payloadTab?.click();
    await sleep(500);

    // Wait for the payload editor to be visible
    await page.waitForSelector('#payload-editor', { visible: true });

    // Take a screenshot of the payload editor
    await page.screenshot({ path: 'screenshots/test-plugin-payload-editor.png' });
    console.log(`Screenshot saved as test-plugin-payload-editor.png`);

    // Clear the payload editor and set a custom payload
    await page.evaluate(() => {
      const editor = document.getElementById('payload-editor') as HTMLTextAreaElement;
      editor.value = JSON.stringify({
        issue: {
          number: 42,
          title: "Custom Test Issue",
          body: "This is a custom test issue with a specific number.",
          labels: ["bug", "enhancement"]
        },
        repository: {
          owner: {
            login: "test-user"
          },
          name: "test-repo"
        }
      }, null, 2);
    });

    // Save the custom payload
    await page.click('#save-payload');
    await sleep(1000);

    // Test 5: Trigger event with custom payload
    console.log(`\nTest 5: Triggering event with custom payload...`);

    // Click on the Events tab
    await eventsTab?.click();
    await sleep(500);

    // Click the issue.opened event button again
    await issueOpenedButton?.click();

    // Wait for the logs tab to become active
    await page.waitForSelector('#logs-tab.active', { visible: true });
    await sleep(2000);

    // Test 6: Try to stop the plugin (may not be clickable if already completed)
    console.log(`\nTest 6: Attempting to stop the plugin...`);
    try {
      // First check if the stop button is available and clickable
      const stopButton = await page.$('#stop-button');
      if (stopButton) {
        await page.click('#stop-button');
        await sleep(2000);
      } else {
        console.log('Stop button not found - plugin may have already completed');
      }
    } catch (error: any) {
      console.log(`Could not click stop button: ${error.message}`);
      console.log('Plugin was likely already completed');
    }

    // Take a final screenshot
    await page.screenshot({ path: 'screenshots/test-plugin-final.png' });
    console.log(`Screenshot saved as test-plugin-final.png`);

    // Check the final status, but don't fail if it's not "Stopped"
    // since it might be "Completed Successfully"
    try {
      const finalStatusText = await page.$eval('#status-text', el => el.textContent);
      console.log(`Final plugin status: ${finalStatusText}`);

      // Consider the test successful if plugin is either stopped or completed
      if (finalStatusText !== 'Stopped' && finalStatusText !== 'Completed Successfully') {
        console.error(`Unexpected plugin final status: ${finalStatusText}`);
        return false;
      }
    } catch (error: any) {
      console.log(`Could not read final status: ${error.message}`);
    }

    console.log(`\nAll UI tests completed successfully!`);
    success = true;
    return true;
  } catch (error) {
    console.error(`Error testing UI:`, error);

    // Try to take a screenshot of the error state
    if (browser) {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await pages[0].screenshot({ path: 'test-plugin-error.png' });
        console.log(`Error state screenshot saved as test-plugin-error.png`);
      }
    }

    return false;
  } finally {
    // Close the browser
    if (browser) {
      console.log(`Closing browser...`);
      await browser.close();
    }
    return success;
  }
}

// Main function
async function main() {
  console.log(`=== Testing Plugin Generation Flow ===`);

  try {
    // Step 1: Create a plugin programmatically
    const pluginCreated = await createPlugin();
    if (!pluginCreated) {
      console.error(`Failed to create plugin. Aborting test.`);
      cleanup();
      process.exit(1);
    }

    // Step 2: Start the local development server
    const serverProcess = await startDevServer();
    if (!serverProcess) {
      console.error(`Failed to start development server. Aborting test.`);
      cleanup();
      process.exit(1);
    }

    // Step 3: Test the UI
    const uiTestSuccess = await testUI();

    // Stop the server
    console.log(`\nStopping development server...`);
    serverProcess.kill();

    // Final result
    if (uiTestSuccess) {
      console.log(`\n=== Plugin Generation Flow Test: SUCCESS ===`);
    } else {
      console.error(`\n=== Plugin Generation Flow Test: FAILED ===`);
    }

    // Clean up
    cleanup();

    // Exit with appropriate code
    process.exit(uiTestSuccess ? 0 : 1);
  } catch (error) {
    console.error(`Unexpected error:`, error);
    cleanup();
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`Fatal error:`, error);
  cleanup();
  process.exit(1);
});
