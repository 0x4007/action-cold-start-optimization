const { init, on } = require("@your-org/plugin-sdk");
const handleIssueOpened = require("./handlers/issue-opened");
const handleIssueEdited = require("./handlers/issue-edited");

/**
 * Initialize the plugin
 */
async function main() {
  // Initialize the SDK
  await init();

  // Register event handlers
  on("issue.opened", handleIssueOpened);
  on("issue.edited", handleIssueEdited);

  console.log("Issue Auto-Labeler plugin initialized");
}

// Start the plugin
main().catch((error) => {
  console.error("Plugin initialization failed:", error);
  process.exit(1);
});
