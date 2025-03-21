/**
 * Type definitions for the plugin
 * This is a Full Stack with Rust implementation (Tier 3)
 */

import { EventPayload } from "plugin-sdk";

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

/**
 * Issue content for Rust processing
 */
export interface IssueContent {
  title: string;
  body: string;
}
