#!/usr/bin/env node

/**
 * Script to generate action.yml from plugin configuration
 * Usage: node scripts/generate-action.js [plugin-dir]
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Get the plugin directory from command line arguments or use current directory
const pluginDir = process.argv[2] || process.cwd();

// Paths to configuration files
const jsConfigPath = path.join(pluginDir, "plugin.config.js");
const tsConfigPath = path.join(pluginDir, "plugin.config.ts");
const outputPath = path.join(pluginDir, "action.yml");

// Load the plugin configuration
async function loadConfig() {
  if (fs.existsSync(jsConfigPath)) {
    return await import(`file://${path.resolve(jsConfigPath)}`);
  } else if (fs.existsSync(tsConfigPath)) {
    // For TypeScript config, we need to use ts-node
    try {
      // Try to use ts-node if available
      await import("ts-node/register");
      return await import(`file://${path.resolve(tsConfigPath)}`);
    } catch (error) {
      console.error("Error loading TypeScript configuration:", error);
      console.error("Make sure ts-node is installed: npm install -g ts-node");
      process.exit(1);
    }
  } else {
    console.error(
      "No plugin configuration found. Please create plugin.config.js or plugin.config.ts",
    );
    process.exit(1);
  }
}

// Generate action.yml from configuration
async function generateAction() {
  try {
    // Load the configuration
    const config = await loadConfig();
    const pluginConfig = config.default || config;

    // Create the action configuration
    const actionConfig = {
      name: pluginConfig.name,
      description: pluginConfig.description,
      author: pluginConfig.author,

      // Add branding if specified
      ...(pluginConfig.action.icon && pluginConfig.action.color
        ? {
            branding: {
              icon: pluginConfig.action.icon,
              color: pluginConfig.action.color,
            },
          }
        : {}),

      // Add inputs
      inputs: {
        // Standard inputs
        stateId: {
          description: "State Id",
          required: true,
        },
        eventName: {
          description: "Event Name",
          required: true,
        },
        eventPayload: {
          description: "Event Payload",
          required: true,
        },
        settings: {
          description: "Settings",
          required: true,
        },
        authToken: {
          description: "Auth Token",
          required: true,
        },
        ref: {
          description: "Ref",
          required: true,
        },
        signature: {
          description: "The kernel signature",
          required: true,
        },
        command: {
          description: "Command from the Kernel",
          required: false,
        },
        PLUGIN_GITHUB_TOKEN: {
          description: "GitHub Token for plugin operations",
          required: true,
        },
        KERNEL_PUBLIC_KEY: {
          description: "Kernel public key for verification",
          required: true,
        },
        LOG_LEVEL: {
          description: "Logging level",
          required: false,
          default: "info",
        },
        SUPABASE_URL: {
          description: "Supabase URL",
          required: true,
        },
        SUPABASE_KEY: {
          description: "Supabase Key",
          required: true,
        },
        USE_WASM: {
          description: "Whether to use WebAssembly for faster execution",
          required: false,
          default: "true",
        },

        // Custom inputs from config
        ...pluginConfig.action.inputs,
      },

      // Add outputs if specified
      ...(pluginConfig.action.outputs &&
      Object.keys(pluginConfig.action.outputs).length > 0
        ? {
            outputs: pluginConfig.action.outputs,
          }
        : {}),

      // Run configuration
      runs: {
        using: "node20",
        main: "dist/index.js",
      },
    };

    // Convert to YAML
    const yamlContent = yaml.dump(actionConfig, {
      lineWidth: -1, // Don't wrap lines
      noRefs: true,
    });

    // Write to file
    fs.writeFileSync(outputPath, yamlContent, "utf8");

    console.log(`Generated action.yml at ${outputPath}`);
  } catch (error) {
    console.error("Error generating action.yml:", error);
    process.exit(1);
  }
}

// Run the script
generateAction();
