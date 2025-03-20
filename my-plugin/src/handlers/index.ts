// Export all handlers
export { default as issueOpened } from './issue-opened.js';
export { default as externalService } from './external-service.js';

// Export named handlers for use in index.ts
export const handlers = {
  'issue.opened': issueOpened,
  'external.service': externalService
};
