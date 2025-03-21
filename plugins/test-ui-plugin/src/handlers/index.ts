// Export all handlers
export { default as issueOpened } from './issue-opened.ts';
export { default as issueClosed } from './issue-closed.ts';
export { default as issueLabeled } from './issue-labeled.ts';
export { default as pullRequestOpened } from './pull-request-opened.ts';
export { default as pullRequestReview } from './pull-request-review.ts';
export { default as externalService } from './external-service.ts';

// Export named handlers for use in index.ts
export const handlers = {
  'issue.opened': issueOpened,
  'issue.closed': issueClosed,
  'issue.labeled': issueLabeled,
  'pull_request.opened': pullRequestOpened,
  'pull_request.review': pullRequestReview,
  'external.service': externalService
};