import { EventPayload } from 'plugin-sdk';

export interface LabelMapping {
  [label: string]: string[];
}

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

export interface IssueClosedPayload extends EventPayload {
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

export interface IssueLabeledPayload extends EventPayload {
  issue: {
    number: number;
    title: string;
    body?: string;
    labels: Array<{
      name: string;
    }>;
  };
  label: {
    name: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

export interface PullRequestOpenedPayload extends EventPayload {
  pull_request: {
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

export interface PullRequestReviewPayload extends EventPayload {
  pull_request: {
    number: number;
    title: string;
    body?: string;
  };
  review: {
    state: 'approved' | 'commented' | 'changes_requested';
    body?: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

export interface PushPayload extends EventPayload {
  ref: string;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

export interface ReleasePayload extends EventPayload {
  release: {
    tag_name: string;
    name: string;
    body?: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}
