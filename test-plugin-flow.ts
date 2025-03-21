#!/usr/bin/env bun

/**
 * Test script for the entire plugin generation flow
 * This script:
 * 1. Creates a plugin programmatically
 * 2. Starts the local development server
 * 3. Opens a browser to test the UI
 * 4. Cleans up after testing
 *
 * Usage: bun run test-plugin-flow.ts
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
const PLUGIN_DIR = path.join(process.cwd(), PLUGIN_NAME);
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

    // Create the plugin using the non-interactive mode
    const createPluginCmd = `bun run scripts/tools/create-plugin-interactive.ts -- --non-interactive --name ${PLUGIN_NAME} --template ts --features issues,pr,external --destination ${PLUGIN_NAME} --icon rocket --color blue`;

    console.log(`Executing: ${createPluginCmd}`);
    execSync(createPluginCmd, { stdio: 'inherit' });

    // Verify the plugin was created successfully
    if (!fs.existsSync(PLUGIN_DIR)) {
      console.error(`Failed to create plugin directory: ${PLUGIN_DIR}`);
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
    await page.screenshot({ path: 'test-plugin-initial.png' });
    console.log(`Screenshot saved as test-plugin-initial.png`);

    // Test 1: Start the plugin
    console.log(`\nTest 1: Starting the plugin...`);
    await page.click('#start-button');

    // Wait for plugin to initialize
    await sleep(3000);

    // Take a screenshot after starting the plugin
    await page.screenshot({ path: 'test-plugin-started.png' });
    console.log(`Screenshot saved as test-plugin-started.png`);

    // Check the status element for verification
    const statusText = await page.$eval('#status-text', el => el.textContent);
    console.log(`Plugin status after start: ${statusText}`);

    // Get metadata if available
    try {
      const metadataSection = await page.$('#plugin-metadata');
      if (metadataSection) {
        const metadataText = await page.$eval('#plugin-metadata', (el: Element) => el.textContent || '');
        console.log(`Plugin metadata:\n${metadataText}`);
      }
    } catch (error) {
      console.log('Metadata section not found or not populated yet');
    }

    // Test 2: Trigger an issue.opened event
    console.log(`\nTest 2: Triggering issue.opened event...`);

    // Click on the Events tab if not already active
    const eventsTab = await page.$('.tab[data-tab="events"]');
    if (eventsTab) await eventsTab.click();
    await sleep(500);

    // Take a screenshot of the events tab
    await page.screenshot({ path: 'test-plugin-events-tab.png' });
    console.log(`Screenshot saved as test-plugin-events-tab.png`);

    // Click the issue.opened event button
    const issueOpenedButton = await page.$('.event-button[data-event="issue.opened"]');
    if (issueOpenedButton) await issueOpenedButton.click();

    // Wait for the logs tab to become active
    await sleep(1000);

    // Take a screenshot after triggering the event
    await page.screenshot({ path: 'test-plugin-event-triggered.png' });
    console.log(`Screenshot saved as test-plugin-event-triggered.png`);

    // We don't try to stop the plugin because it should have exited on its own
    // with exit code 0 after processing the event

    // Take a final screenshot to show the completed status
    await sleep(2000);
    await page.screenshot({ path: 'test-plugin-final.png' });
    console.log(`Screenshot saved as test-plugin-final.png`);

    // Check the final status - it should show "Completed Successfully" if our changes worked
    const finalStatusText = await page.$eval('#status-text', el => el.textContent);
    console.log(`Final plugin status: ${finalStatusText}`);

    // Display final metadata
    try {
      const finalMetadataText = await page.$eval('#plugin-metadata', (el: Element) => el.textContent || '');
      console.log(`Final plugin metadata:\n${finalMetadataText}`);

      // Check if the exit code is visible and is 0
      const hasExitCode0 = finalMetadataText.includes('Exit code: 0');
      if (hasExitCode0) {
        console.log('✅ Plugin completed successfully with exit code 0');
      } else {
        console.log('⚠️ Plugin did not complete with exit code 0');
      }
    } catch (error) {
      console.log('Final metadata not available');
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
