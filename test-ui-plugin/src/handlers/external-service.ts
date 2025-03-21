/**
 * Handler for external.service event
 * This is a TypeScript + WASM implementation (Tier 2)
 */

import { getContext, EventHandler } from 'plugin-sdk';
import { IssueOpenedPayload } from '../types.js';

/**
 * Handler for external.service event
 * Processes data from an external service
 */
const handleExternalService: EventHandler<any> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing external service event');

  // Log the payload for debugging
  log(`Received payload: ${JSON.stringify(payload, null, 2)}`);

  // Example: If the payload contains issue information, we can process it
  if (payload.issue) {
    const issueNumber = payload.issue.number;
    const issueTitle = payload.issue.title;
    const issueBody = payload.issue.body || '';

    log(`Processing issue #${issueNumber}: ${issueTitle}`);

    // Example: Add a comment to the issue
    try {
      await github.createComment(
        issueNumber,
        `External service has processed this issue: ${issueTitle}`
      );
      log('Added comment to the issue');
    } catch (error) {
      log(`Error adding comment: ${error.message}`);
    }
  }

  log('External service processing completed');
};

export default handleExternalService;
