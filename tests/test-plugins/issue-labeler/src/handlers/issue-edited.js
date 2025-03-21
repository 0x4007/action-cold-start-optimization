const { getContext } = require("@your-org/plugin-sdk");

/**
 * Handler for issue.edited event
 * Updates labels based on edited issue content
 */
module.exports = async function handleIssueEdited(payload) {
  const { github, utils, log } = getContext();

  log("Processing edited issue");

  // Get the issue details
  const issueNumber = payload.issue.number;
  const issueTitle = payload.issue.title;
  const issueBody = payload.issue.body || "";
  const currentLabels = payload.issue.labels.map((label) => label.name);

  // Get label mapping from inputs
  const labelMappingJson = process.env.INPUT_LABELMAPPING || "{}";
  const labelMapping = utils.parseJSON(labelMappingJson);

  // Determine which labels to apply
  const labelsToApply = [];

  // Check each label's keywords against the issue content
  for (const [label, keywords] of Object.entries(labelMapping)) {
    const content = `${issueTitle} ${issueBody}`.toLowerCase();

    // If any keyword is found in the content, add the label
    if (keywords.some((keyword) => content.includes(keyword.toLowerCase()))) {
      labelsToApply.push(label);
    }
  }

  // Find new labels that aren't already applied
  const newLabels = labelsToApply.filter(
    (label) => !currentLabels.includes(label),
  );

  // Apply new labels if any were found
  if (newLabels.length > 0) {
    log(`Adding new labels: ${newLabels.join(", ")}`);

    await github.octokit.issues.addLabels({
      ...github.repo,
      issue_number: issueNumber,
      labels: newLabels,
    });

    // Add a comment to the issue
    await github.createComment(
      issueNumber,
      `Based on your edits, I've added the following labels: ${newLabels.join(", ")}`,
    );
  } else {
    log("No new labels to add");
  }

  log("Issue processing completed");
};
