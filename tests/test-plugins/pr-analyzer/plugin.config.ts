export default {
  name: "Pull Request Analyzer",
  description: "Analyzes pull requests and provides feedback",
  author: "Your Name",

  action: {
    icon: "git-pull-request",
    color: "purple",
    inputs: {
      sizeThresholds: {
        description: "JSON thresholds for PR size (lines changed)",
        required: false,
        default: '{"small": 10, "medium": 100, "large": 500, "xlarge": 1000}',
      },
      requireTests: {
        description: "Whether to require tests for code changes",
        required: false,
        default: "true",
      },
    },
  },

  // Performance optimization settings
  optimization: {
    useWasm: true,
    wasmFunctions: ["parseJSON", "computeHash"],
    lazyLoad: ["@octokit/rest"],
  },

  // Event handlers
  events: {
    "pull_request.opened": "./src/handlers/pull-request-opened.ts",
    "pull_request.synchronize": "./src/handlers/pull-request-synchronize.ts",
  },
};
