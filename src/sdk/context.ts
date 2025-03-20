/**
 * Context module for the Plugin SDK
 * Provides access to GitHub API, environment variables, and utility functions
 */

import { getEnvironment, PluginEnvironment } from './environment.js';
import { wasmUtils } from './wasm-utils.js';

/**
 * GitHub API interface
 */
export interface GitHubAPI {
  repo: { owner: string; repo: string };
  createComment(issueNumber: number, body: string): Promise<void>;
  createIssue(title: string, body: string, labels?: string[]): Promise<number>;
  // Add more GitHub API methods as needed
}

/**
 * Plugin utility functions interface
 */
export interface PluginUtils {
  parseJSON<T>(json: string): T;
  validatePayload(schema: any, payload: any): boolean;
  computeHash(data: string): string;
  // Add more utility functions as needed
}

/**
 * Plugin context interface
 */
export interface PluginContext {
  github: GitHubAPI;
  env: PluginEnvironment;
  utils: PluginUtils;
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}

// Using the WASM utilities from wasm-utils.ts

/**
 * Creates a plugin context
 */
export function createContext(): PluginContext {
  const env = getEnvironment();

  // Extract repository information from the event payload
  const eventPayload = JSON.parse(env.eventPayload || '{}');
  const repo = {
    owner: eventPayload.repository?.owner?.login || '',
    repo: eventPayload.repository?.name || '',
  };

  // Create GitHub API client (simplified for now)
  const github: GitHubAPI = {
    repo,
    async createComment(issueNumber, body) {
      // Simplified implementation
      console.log(`Creating comment on issue #${issueNumber}: ${body}`);
    },
    async createIssue(title, body, labels = []) {
      // Simplified implementation
      console.log(`Creating issue: ${title}`);
      return 1; // Return a dummy issue number
    }
  };

  // Create context object
  return {
    github,
    env,
    utils: wasmUtils,
    log(message, level = 'info') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  };
}
