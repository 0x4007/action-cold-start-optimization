module.exports = {
  name: "Issue Auto-Labeler",
  description: "Automatically labels issues based on content",
  author: "Your Name",

  action: {
    icon: "tag",
    color: "green",
    inputs: {
      labelMapping: {
        description: "JSON mapping of keywords to labels",
        required: false,
        default:
          '{"bug":["error","exception","fail"],"enhancement":["improve","enhancement","feature"],"documentation":["docs","readme","guide"],"question":["how","what","why","when"]}',
      },
    },
  },

  // Event handlers
  events: {
    "issue.opened": "./src/handlers/issue-opened.js",
    "issue.edited": "./src/handlers/issue-edited.js",
  },
};
