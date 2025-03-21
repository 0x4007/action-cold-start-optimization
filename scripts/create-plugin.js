#!/usr/bin/env bun

/**
 * Script to create a new plugin from a template
 * Usage: npm run create:plugin -- <template> <destination>
 * Example: bun run create:plugin -- js my-plugin
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";

// Get the directory of the current script
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Get the template and destination from the command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: npm run create:plugin -- <template> <destination>");
  console.error("Available templates: js, ts, rust");
  process.exit(1);
}

const template = args[0];
const destination = args[1];

// Check if the template exists
const templatePath = resolve(__dirname, "..", "templates", template);
if (!existsSync(templatePath)) {
  console.error(`Template '${template}' not found`);
  console.error("Available templates: js, ts, rust");
  process.exit(1);
}

// Create generated directory if it doesn't exist
const generatedDir = resolve(process.cwd(), "generated");
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir, { recursive: true });
}

// Check if the destination already exists
const destinationPath = resolve(generatedDir, destination);
if (existsSync(destinationPath)) {
  console.error(`Destination 'generated/${destination}' already exists`);
  process.exit(1);
}

// Create the destination directory
mkdirSync(destinationPath, { recursive: true });

// Copy the template to the destination
console.log(
  `Creating plugin from template '${template}' in 'generated/${destination}'...`,
);
execSync(`cp -r ${templatePath}/* ${destinationPath}/`);

// Install dependencies
console.log("Installing dependencies...");
try {
  // First, make sure the SDK is built
  execSync("bun run build:sdk", { stdio: "inherit" });

  // Then install dependencies in the new plugin
  execSync("bun install", { cwd: destinationPath, stdio: "inherit" });
} catch (error) {
  console.warn("Warning: Could not install dependencies automatically.");
  console.warn(
    'You may need to run "npm install" manually in the plugin directory.',
  );
}

console.log(`
Plugin created successfully!

Next steps:
1. Update the plugin configuration in ${join("generated/" + destination, template.includes("ts") ? "plugin.config.ts" : "plugin.config.js")}
2. Implement your event handlers in ${join("generated/" + destination, "src/handlers")}
3. Build and test your plugin:
   cd ${join("generated", destination)}
   bun run build
`);
