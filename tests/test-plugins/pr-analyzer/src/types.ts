import { EventPayload } from '@your-org/plugin-sdk';

export interface PullRequestOpenedPayload extends EventPayload {
  pull_request: {
    number: number;
    title: string;
    body?: string;
    user: {
      login: string;
    };
    additions: number;
    deletions: number;
    changed_files: number;
    html_url: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
    full_name: string;
  };
}

export interface PullRequestSynchronizePayload extends EventPayload {
  pull_request: {
    number: number;
    title: string;
    body?: string;
    user: {
      login: string;
    };
    additions: number;
    deletions: number;
    changed_files: number;
    html_url: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
    full_name: string;
  };
}

export interface SizeThresholds {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface PullRequestAnalysis {
  size: 'small' | 'medium' | 'large' | 'xlarge';
  hasTests: boolean;
  hasDocumentation: boolean;
  suggestions: string[];
}
