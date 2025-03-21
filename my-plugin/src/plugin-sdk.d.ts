declare module 'plugin-sdk' {
  export interface EventPayload {
    [key: string]: any;
  }

  export interface IssueOpenedPayload extends EventPayload {
    issue: {
      number: number;
      title: string;
      body: string;
      labels: Array<{ name: string }>;
    };
    repository: {
      owner: {
        login: string;
      };
      name: string;
    };
  }

  export interface Context {
    github: {
      createComment: (issueNumber: number, comment: string) => Promise<void>;
      octokit: {
        issues: {
          addLabels: (params: { issue_number: number; labels: string[] } & Record<string, any>) => Promise<void>;
        };
        [key: string]: any;
      };
      repo: Record<string, any>;
      [key: string]: any;
    };
    utils: {
      parseJSON<T>(json: string): T;
      [key: string]: any;
    };
    payload: EventPayload;
    settings: any;
    log: (message: string) => void;
  }

  export interface WasmConfig {
    [key: string]: any;
  }

  export type EventHandler<T extends EventPayload = EventPayload> = (payload: T) => Promise<void>;

  export function getContext(): Context;
  export function init(options?: { wasm?: WasmConfig }): Promise<void>;
  export function on<T extends EventPayload = EventPayload>(event: string, handler: EventHandler<T>): void;
}
