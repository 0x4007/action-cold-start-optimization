const { getContext } = require('@your-org/plugin-sdk');

/**
 * Handler for issue.opened event
 * Automatically adds labels based on issue content
 */
module.exports = async function handleIssueOpened(payload) {
  const { github, utils, log } = getContext();

  log('Processing new issue');

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || '';

  // Get label mapping from inputs
  const labelMappingJson = process.env.INPUT_LABELMAPPING || '{}';
  const labelMapping = utils.parseJSON(labelMappingJson);

  // Determine which labels to apply
  const labelsToApply = [];

  // Check each label's keywords against the issue content
  for (const [label, keywords] of Object.entries(labelMapping)) {
    const content = `${issueTitle} ${issueBody}`.toLowerCase();

    // If any keyword is found in the content, add the label
    if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      labelsToApply.push(label);
    }
  }

  // Apply labels if any were found
  if (labelsToApply.length > 0) {
    log(`Adding labels: ${labelsToApply.join(', ')}`);

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
