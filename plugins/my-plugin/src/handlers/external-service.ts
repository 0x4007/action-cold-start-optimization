import { getContext, EventHandler } from 'plugin-sdk';
import { EventPayload } from 'plugin-sdk';

/**
 * Handler for external service integration
 * This can be triggered by any event
 */
const handleExternalService: EventHandler = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing external service integration');

  // Add your custom logic here
  // Example: Send notification to Slack, create Jira ticket, etc.
  log('Simulating external service integration...');

  // Example: Create a comment on an issue
  if (payload.issue) {
    const issueNumber = payload.issue.number;
    await github.createComment(
      issueNumber,
      'External service integration processed this issue!'
    );
    log(`Added comment to issue #${issueNumber}`);
  }

  log('External service processing completed');
};

export default handleExternalService;
