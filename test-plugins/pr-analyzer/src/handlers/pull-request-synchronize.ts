import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { PullRequestSynchronizePayload, SizeThresholds } from '../types';

/**
 * Handler for pull_request.synchronize event
 * Updates analysis when PR is updated
 */
const handlePullRequestSynchronize: EventHandler<PullRequestSynchronizePayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing updated pull request');

  // Get the PR details
  const prNumber = payload.pull_request.number;
  const additions = payload.pull_request.additions;
  const deletions = payload.pull_request.deletions;
  const changedFiles = payload.pull_request.changed_files;

  // Get size thresholds from inputs
  const sizeThresholdsJson = process.env.INPUT_SIZETHRESHOLDS || '{"small": 10, "medium": 100, "large": 500, "xlarge": 1000}';
  const sizeThresholds = utils.parseJSON<SizeThresholds>(sizeThresholdsJson);

  // Determine PR size
  const totalChanges = additions + deletions;
  let size: string;

  if (totalChanges <= sizeThresholds.small) {
    size = 'small';
  } else if (totalChanges <= sizeThresholds.medium) {
    size = 'medium';
  } else if (totalChanges <= sizeThresholds.large) {
    size = 'large';
  } else if (totalChanges <= sizeThresholds.xlarge) {
    size = 'large';
  } else {
    size = 'xlarge';
  }

  // Generate update comment
  const comment = `## Pull Request Update Detected

I've detected changes to this pull request:

- **Current Size**: ${size} (${additions} additions, ${deletions} deletions)
- **Files Changed**: ${changedFiles}

Please make sure your changes include appropriate tests and documentation.
`;

  // Add the comment to the PR
  await github.createComment(prNumber, comment);

  log('Pull request update analysis completed');
};

export default handlePullRequestSynchronize;
