import { getContext, EventHandler } from '@your-org/plugin-sdk';
import { PullRequestOpenedPayload, SizeThresholds, PullRequestAnalysis } from '../types';

/**
 * Analyzes a pull request and provides feedback
 */
const analyzePullRequest = (payload: PullRequestOpenedPayload, sizeThresholds: SizeThresholds): PullRequestAnalysis => {
  const { pull_request } = payload;
  const totalChanges = pull_request.additions + pull_request.deletions;

  // Determine PR size
  let size: 'small' | 'medium' | 'large' | 'xlarge';
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

  // Check if PR has tests
  const hasTests = pull_request.body?.toLowerCase().includes('test') || false;

  // Check if PR has documentation
  const hasDocumentation = pull_request.body?.toLowerCase().includes('documentation') ||
                          pull_request.body?.toLowerCase().includes('docs') || false;

  // Generate suggestions
  const suggestions: string[] = [];

  if (size === 'large' || size === 'xlarge') {
    suggestions.push('Consider breaking this PR into smaller, more focused changes');
  }

  if (!hasTests) {
    suggestions.push('Add tests to verify your changes');
  }

  if (!hasDocumentation) {
    suggestions.push('Include documentation updates if necessary');
  }

  return {
    size,
    hasTests,
    hasDocumentation,
    suggestions
  };
};

/**
 * Handler for pull_request.opened event
 */
const handlePullRequestOpened: EventHandler<PullRequestOpenedPayload> = async (payload) => {
  const { github, utils, log } = getContext();

  log('Processing new pull request');

  // Get the PR details
  const prNumber = payload.pull_request.number;
  const prTitle = payload.pull_request.title;
  const prBody = payload.pull_request.body || '';
  const prUrl = payload.pull_request.html_url;

  // Get size thresholds from inputs
  const sizeThresholdsJson = process.env.INPUT_SIZETHRESHOLDS || '{"small": 10, "medium": 100, "large": 500, "xlarge": 1000}';
  const sizeThresholds = utils.parseJSON<SizeThresholds>(sizeThresholdsJson);

  // Analyze the PR
  const analysis = analyzePullRequest(payload, sizeThresholds);

  // Generate feedback comment
  let comment = `## Pull Request Analysis\n\n`;
  comment += `Thank you for your contribution! Here's an automated analysis of your PR:\n\n`;
  comment += `- **Size**: ${analysis.size} (${payload.pull_request.additions} additions, ${payload.pull_request.deletions} deletions)\n`;
  comment += `- **Files Changed**: ${payload.pull_request.changed_files}\n`;
  comment += `- **Tests Included**: ${analysis.hasTests ? '✅' : '❌'}\n`;
  comment += `- **Documentation Included**: ${analysis.hasDocumentation ? '✅' : '❌'}\n\n`;

  if (analysis.suggestions.length > 0) {
    comment += `### Suggestions\n\n`;
    analysis.suggestions.forEach(suggestion => {
      comment += `- ${suggestion}\n`;
    });
  }

  // Add the comment to the PR
  await github.createComment(prNumber, comment);

  log('Pull request analysis completed');
};

export default handlePullRequestOpened;
