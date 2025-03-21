/**
 * Configuration system for the Plugin SDK
 * Simplifies plugin creation with a declarative configuration
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Plugin configuration interface
 */
export interface PluginConfig {
  name: string;
  description: string;
  author: string;
  action: {
    icon?: string;
    color?: string;
    inputs: Record<
      string,
      {
        description: string;
        required: boolean;
        default?: string;
      }
    >;
    outputs?: Record<
      string,
      {
        description: string;
      }
    >;
  };
  optimization?: {
    useWasm: boolean;
    wasmFunctions?: string[];
    lazyLoad?: string[];
  };
  events: Record<string, string>;
}

/**
 * Loads and parses the plugin configuration
 */
export function loadConfig(
  configPath: string = "./plugin.config.js",
): PluginConfig {
  const resolvedPath = resolve(configPath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  try {
    // For JavaScript config
    if (resolvedPath.endsWith(".js")) {
      const config = require(resolvedPath);
      return validateConfig(config);
    }

    // For TypeScript config
    if (resolvedPath.endsWith(".ts")) {
      // This requires ts-node to be installed
      require("ts-node/register");
      const config = require(resolvedPath).default;
      return validateConfig(config);
    }

    // For JSON config
    if (resolvedPath.endsWith(".json")) {
      const configContent = readFileSync(resolvedPath, "utf8");
      const config = JSON.parse(configContent);
      return validateConfig(config);
    }

    throw new Error(`Unsupported configuration file format: ${resolvedPath}`);
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error}`);
  }
}

/**
 * Validates the plugin configuration
 */
function validateConfig(config: any): PluginConfig {
  // Basic validation
  if (!config.name) {
    throw new Error("Configuration must include a name");
  }

  if (!config.description) {
    throw new Error("Configuration must include a description");
  }

  if (!config.author) {
    throw new Error("Configuration must include an author");
  }

  if (!config.action || !config.action.inputs) {
    throw new Error("Configuration must include action.inputs");
  }

  if (!config.events || Object.keys(config.events).length === 0) {
    throw new Error("Configuration must include at least one event handler");
  }

  // Set defaults for optional fields
  const validatedConfig: PluginConfig = {
    ...config,
    action: {
      ...config.action,
      icon: config.action.icon || "code",
      color: config.action.color || "blue",
      outputs: config.action.outputs || {},
    },
    optimization: config.optimization || {
      useWasm: true,
      wasmFunctions: [],
      lazyLoad: [],
    },
  };

  return validatedConfig;
}
