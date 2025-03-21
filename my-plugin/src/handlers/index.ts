// Import handlers
import issueOpened from './issue-opened.ts';
import externalService from './external-service.ts';

// Export all handlers
export { issueOpened, externalService };

// Export named handlers for use in index.ts
export const handlers = {
  'issue.opened': issueOpened,
  'external.service': externalService
};
