/**
 * Type definitions for the plugin
 * This is a TypeScript + WASM implementation (Tier 2)
 */

import { EventPayload } from '@your-org/plugin-sdk';

/**
 * Issue opened event payload
 */
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

/**
 * Label mapping type
 */
export interface LabelMapping {
  [label: string]: string[];
}
