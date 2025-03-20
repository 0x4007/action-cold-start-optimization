/**
 * Handler for issue.opened event
 * This is a Full Stack with Rust implementation (Tier 3)
 */

import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { IssueOpenedPayload, IssueContent } from '../types.js';

// Import the custom WASM function
// This would be generated from the Rust code
import { match_labels } from '../../wasm/pkg/issue_labeler.js';

/**
 * Handler for issue.opened event
 * Automatically adds labels based on issue content
 */
const handleIssueOpened: EventHandler<IssueOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Get label mapping from inputs
  const labelMappingJson = process.env.INPUT_LABELMAPPING || '{}';

  // Use the Rust implementation for label matching
  const contentJson = JSON.stringify({
    title: issueTitle,
    body: issueBody
  } as IssueContent);

  // Call the WASM function directly
  const matchingLabelsJson = match_labels(contentJson, labelMappingJson);
  const labelsToApply = JSON.parse(matchingLabelsJson);

  // Apply labels if any were found
  if (labelsToApply.length > 0) {
    log(`Adding labels: ${labelsToApply.join(', ')}`);

    // Add labels to the issue
    await github.octokit.issues.addLabels({
      ...github.repo,
      issue_number: issueNumber,
      labels: labelsToApply
    });

    // Add a comment to the issue
    await github.createComment(
      issueNumber,
      `I've automatically added the following labels: ${labelsToApply.join(', ')}`
    );
  } else {
    log('No matching labels found');
  }

  log('Issue processing completed');
};

export default handleIssueOpened;
