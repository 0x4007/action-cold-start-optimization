#!/usr/bin/env bun

/**
 * Interactive plugin generator
 * Usage: bun run create:plugin:interactive
 *
 * Non-interactive mode:
 * Usage: bun run create:plugin:interactive -- --non-interactive [options]
 * Example: bun run create:plugin:interactive -- --non-interactive --name my-plugin --template ts --features issues,pr
 */

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { Command } from "commander";

const execAsync = promisify(exec);

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const templatesDir = path.join(rootDir, "templates");
const generatedDir = path.join(rootDir, "generated");

// Template types
const TEMPLATE_JS = "js";
const TEMPLATE_TS = "ts";
const TEMPLATE_RUST = "rust";

// Feature types
const FEATURE_ISSUES = "issues";
const FEATURE_PR = "pr";
const FEATURE_REPO = "repo";
const FEATURE_EXTERNAL = "external";

// GitHub Action icons and colors
const ICONS = [
  "code",
  "play",
  "check",
  "x",
  "alert",
  "shield",
  "comment",
  "bell",
  "tag",
  "git-branch",
  "git-commit",
  "git-merge",
  "git-pull-request",
  "globe",
  "heart",
  "info",
  "link",
  "lock",
  "mail",
  "package",
  "rocket",
  "star",
  "terminal",
  "zap",
];

const COLORS = [
  "blue",
  "green",
  "red",
  "orange",
  "purple",
  "yellow",
  "gray",
  "black",
  "white",
];

// Feature descriptions
const featureDescriptions = {
  [FEATURE_ISSUES]: {
    name: "Issue Management",
    description: "Handle issue events (opened, closed, etc.)",
    events: ["issue.opened", "issue.closed", "issue.labeled"],
    handlers: ["issue-opened", "issue-closed", "issue-labeled"],
  },
  [FEATURE_PR]: {
    name: "Pull Request Review",
    description: "Handle pull request events (opened, review, etc.)",
    events: ["pull_request.opened", "pull_request.review"],
    handlers: ["pull-request-opened", "pull-request-review"],
  },
  [FEATURE_REPO]: {
    name: "Repository Management",
    description: "Handle repository events (push, release, etc.)",
    events: ["push", "release"],
    handlers: ["push", "release"],
  },
  [FEATURE_EXTERNAL]: {
    name: "External Integration",
    description: "Integrate with external services (Slack, Jira, etc.)",
    events: ["external.service"],
    handlers: ["external-service"],
  },
};

// Template descriptions
const templateDescriptions = {
  [TEMPLATE_JS]: {
    name: "JavaScript",
    description: "Simple JavaScript plugin (no TypeScript or Rust)",
  },
  [TEMPLATE_TS]: {
    name: "TypeScript",
    description: "TypeScript plugin with WASM integration",
  },
  [TEMPLATE_RUST]: {
    name: "Rust + TypeScript",
    description: "Full stack plugin with Rust and TypeScript",
  },
};

// Utility function to convert event name to handler name (camelCase)
function eventToHandlerName(event: string): string {
  return event
    .replace(/\./g, "-")
    .split("-")
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

// Utility function to convert kebab-case to camelCase
function kebabToCamelCase(str: string): string {
  return str
    .split("-")
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

// Parse command line arguments
function parseCommandLineArgs() {
  const program = new Command();

  program
    .name("create-plugin-interactive")
    .description(
      "Create a new plugin with interactive prompts or non-interactive mode",
    )
    .option("--non-interactive", "Run in non-interactive mode")
    .option("--name <name>", "Name of the plugin")
    .option("--description <description>", "Description of the plugin")
    .option("--author <author>", "Author of the plugin")
    .option("--template <template>", "Template to use (js, ts, rust)")
    .option(
      "--features <features>",
      "Comma-separated list of features (issues,pr,repo,external)",
    )
    .option("--destination <destination>", "Destination directory")
    .option("--icon <icon>", "GitHub Action icon")
    .option("--color <color>", "GitHub Action color");

  program.parse();
  return program.opts();
}

// Main function
async function main() {
  console.log(
    chalk.bold("=== WebAssembly-Optimized GitHub Actions Plugin Generator ==="),
  );

  // Create generated directory if it doesn't exist
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Parse command line arguments
  const options = parseCommandLineArgs();
  let answers: any;

  if (options.nonInteractive) {
    console.log("Running in non-interactive mode...\n");

    // Validate template
    if (options.template && !["js", "ts", "rust"].includes(options.template)) {
      console.error(chalk.red(`Invalid template: ${options.template}`));
      console.error("Available templates: js, ts, rust");
      process.exit(1);
    }

    // Parse features
    let features: string[] = [];
    if (options.features) {
      // Split by comma and trim each feature
      features = options.features.split(",").map((f) => f.trim());

      // Validate features
      const validFeatures = [
        FEATURE_ISSUES,
        FEATURE_PR,
        FEATURE_REPO,
        FEATURE_EXTERNAL,
      ];
      for (const feature of features) {
        if (!validFeatures.includes(feature)) {
          console.error(chalk.red(`Invalid feature: ${feature}`));
          console.error(`Available features: ${validFeatures.join(", ")}`);
          process.exit(1);
        }
      }
    }

    // Use provided values or defaults
    answers = {
      name: options.name || "my-plugin",
      description: options.description || "A GitHub Action plugin",
      author: options.author || "Your Name",
      template: options.template || "ts",
      features: features.length > 0 ? features : [FEATURE_ISSUES],
      destination: options.destination || options.name || "my-plugin",
      icon: options.icon || "rocket",
      color: options.color || "blue",
    };

    // Validate icon and color
    if (answers.icon && !ICONS.includes(answers.icon)) {
      console.error(chalk.red(`Invalid icon: ${answers.icon}`));
      console.error(`Available icons: ${ICONS.join(", ")}`);
      process.exit(1);
    }

    if (answers.color && !COLORS.includes(answers.color)) {
      console.error(chalk.red(`Invalid color: ${answers.color}`));
      console.error(`Available colors: ${COLORS.join(", ")}`);
      process.exit(1);
    }

    console.log("Using the following configuration:");
    console.log(`- Name: ${answers.name}`);
    console.log(`- Description: ${answers.description}`);
    console.log(`- Author: ${answers.author}`);
    console.log(`- Template: ${answers.template}`);
    console.log(`- Features: ${answers.features.join(", ")}`);
    console.log(`- Destination: generated/${answers.destination}`);
    console.log(`- Icon: ${answers.icon}`);
    console.log(`- Color: ${answers.color}\n`);
  } else {
    console.log(
      "This tool will help you create a new plugin from a template.\n",
    );

    // Get plugin information through interactive prompts
    answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of your plugin?",
        default: "my-plugin",
      },
      {
        type: "input",
        name: "description",
        message: "Provide a short description of your plugin:",
        default: "A GitHub Action plugin",
      },
      {
        type: "input",
        name: "author",
        message: "What is your name (for the author field)?",
        default: "Your Name",
      },
      {
        type: "list",
        name: "template",
        message: "Which template would you like to use?",
        choices: [
          {
            name: `${templateDescriptions[TEMPLATE_JS].name} - ${templateDescriptions[TEMPLATE_JS].description}`,
            value: TEMPLATE_JS,
          },
          {
            name: `${templateDescriptions[TEMPLATE_TS].name} - ${templateDescriptions[TEMPLATE_TS].description}`,
            value: TEMPLATE_TS,
          },
          {
            name: `${templateDescriptions[TEMPLATE_RUST].name} - ${templateDescriptions[TEMPLATE_RUST].description}`,
            value: TEMPLATE_RUST,
          },
        ],
      },
      {
        type: "checkbox",
        name: "features",
        message: "Which features would you like to include?",
        choices: [
          {
            name: `${featureDescriptions[FEATURE_ISSUES].name} - ${featureDescriptions[FEATURE_ISSUES].description}`,
            value: FEATURE_ISSUES,
          },
          {
            name: `${featureDescriptions[FEATURE_PR].name} - ${featureDescriptions[FEATURE_PR].description}`,
            value: FEATURE_PR,
          },
          {
            name: `${featureDescriptions[FEATURE_REPO].name} - ${featureDescriptions[FEATURE_REPO].description}`,
            value: FEATURE_REPO,
          },
          {
            name: `${featureDescriptions[FEATURE_EXTERNAL].name} - ${featureDescriptions[FEATURE_EXTERNAL].description}`,
            value: FEATURE_EXTERNAL,
          },
        ],
      },
      {
        type: "input",
        name: "destination",
        message:
          "What should the plugin directory be named? (Will be created in generated/)",
        default: (answers: any) => answers.name,
      },
      {
        type: "list",
        name: "icon",
        message: "Choose an icon for your GitHub Action:",
        choices: ICONS,
      },
      {
        type: "list",
        name: "color",
        message: "Choose a color for your GitHub Action:",
        choices: COLORS,
      },
    ]);
  }

  // Create destination directory if it doesn't exist
  const destinationDir = path.resolve(generatedDir, answers.destination);

  if (fs.existsSync(destinationDir)) {
    console.error(
      chalk.red(
        `Destination 'generated/${answers.destination}' already exists`,
      ),
    );
    process.exit(1);
  }

  fs.mkdirSync(destinationDir, { recursive: true });

  // Get the template directory
  const templateDir = path.join(templatesDir, answers.template);

  if (!fs.existsSync(templateDir)) {
    console.error(chalk.red(`Template '${answers.template}' not found`));
    process.exit(1);
  }

  // Collect all events and handlers from selected features
  const events: string[] = [];
  const handlers: string[] = [];

  answers.features.forEach((feature: string) => {
    events.push(...featureDescriptions[feature].events);
    handlers.push(...featureDescriptions[feature].handlers);
  });

  // Add a default handler if no features are selected
  if (handlers.length === 0) {
    // Add a default handler for issue.opened
    events.push("issue.opened");
    handlers.push("issue-opened");
  }

  // Create a mapping of events to handlers
  const eventHandlerMap: Record<string, string> = {};
  events.forEach((event, index) => {
    eventHandlerMap[event] = handlers[index];
  });

  // Create a mapping of handler names to camelCase handler names
  const handlerNameMap: Record<string, string> = {};
  handlers.forEach((handler) => {
    handlerNameMap[handler] = kebabToCamelCase(handler);
  });

  // Copy template files
  console.log("\nCopying template files...");

  // Helper function to process template files
  function processTemplateFile(
    file: string,
    templateVars: Record<string, any>,
  ) {
    const templatePath = path.join(templateDir, file);
    const destinationPath = path.join(destinationDir, file);

    // Create directory if it doesn't exist
    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read template file
    let content = fs.readFileSync(templatePath, "utf8");

    // Replace template variables
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, value.toString());
    });

    // Write file
    fs.writeFileSync(destinationPath, content);
    console.log(`Created ${destinationPath}`);
  }

  // Process template files based on the selected template
  if (answers.template === TEMPLATE_JS) {
    // Copy package.json
    processTemplateFile("package.json", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
    });

    // Copy plugin.config.js
    processTemplateFile("plugin.config.js", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
      icon: answers.icon,
      color: answers.color,
      events: events
        .map(
          (event) =>
            `'${event}': './src/handlers/${eventHandlerMap[event]}.js'`,
        )
        .join(",\n    "),
    });

    // Copy src/index.js
    processTemplateFile("src/index.js", {
      name: answers.name,
    });

    // Copy handlers
    handlers.forEach((handler) => {
      const templateHandler = "src/handlers/issue-opened.js"; // Use as a base template

      // Read template file
      let content = fs.readFileSync(
        path.join(templateDir, templateHandler),
        "utf8",
      );

      // Replace template variables
      const templateVars = {
        handler,
        handlerName: handlerNameMap[handler],
      };

      Object.entries(templateVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        content = content.replace(regex, value.toString());
      });

      // Write directly to the final destination
      const finalPath = path.join(
        destinationDir,
        "src/handlers",
        `${handler}.js`,
      );

      // Create directory if it doesn't exist
      const dir = path.dirname(finalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(finalPath, content);
      console.log(`Created ${finalPath}`);
    });

    // Create handlers/index.js
    const handlersIndexContent = `// Export all handlers
${handlers.map((handler) => `export { default as ${handlerNameMap[handler]} } from './${handler}.js';`).join("\n")}

// Export named handlers for use in index.js
export const handlers = {
  ${events.map((event) => `'${event}': ${handlerNameMap[eventHandlerMap[event]]}`).join(",\n  ")}
};`;

    fs.writeFileSync(
      path.join(destinationDir, "src/handlers/index.js"),
      handlersIndexContent,
    );
    console.log(
      `Created ${path.join(destinationDir, "src/handlers/index.js")}`,
    );
  } else if (answers.template === TEMPLATE_TS) {
    // Copy package.json
    processTemplateFile("package.json", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
    });

    // Copy tsconfig.json
    processTemplateFile("tsconfig.json", {});

    // Copy plugin.config.ts
    processTemplateFile("plugin.config.ts", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
      icon: answers.icon,
      color: answers.color,
      events: events
        .map(
          (event) =>
            `'${event}': './src/handlers/${eventHandlerMap[event]}.ts'`,
        )
        .join(",\n    "),
    });

    // Copy src/index.ts
    processTemplateFile("src/index.ts", {
      name: answers.name,
      hasWasmConfig:
        answers.template === TEMPLATE_TS || answers.template === TEMPLATE_RUST,
    });

    // Copy src/types.ts
    processTemplateFile("src/types.ts", {});

    // Copy src/wasm-config.ts
    processTemplateFile("src/wasm-config.ts", {});

    // Copy handlers
    handlers.forEach((handler) => {
      const templateHandler = "src/handlers/issue-opened.ts"; // Use as a base template

      // Create a temporary file path for processing
      const tempFilePath = path.join(destinationDir, `temp-${handler}.ts`);

      // Read template file
      let content = fs.readFileSync(
        path.join(templateDir, templateHandler),
        "utf8",
      );

      // Replace template variables
      const templateVars = {
        handler,
        handlerName: handlerNameMap[handler],
      };

      Object.entries(templateVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        content = content.replace(regex, value.toString());
      });

      // Write directly to the final destination
      const finalPath = path.join(
        destinationDir,
        "src/handlers",
        `${handler}.ts`,
      );

      // Create directory if it doesn't exist
      const dir = path.dirname(finalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(finalPath, content);
      console.log(`Created ${finalPath}`);
    });

    // Create handlers/index.ts
    const handlersIndexContent = `// Export all handlers
${handlers.map((handler) => `export { default as ${handlerNameMap[handler]} } from './${handler}.ts';`).join("\n")}

// Export named handlers for use in index.ts
export const handlers = {
  ${events.map((event) => `'${event}': ${handlerNameMap[eventHandlerMap[event]]}`).join(",\n  ")}
};`;

    // Ensure handlers directory exists
    const handlersDir = path.join(destinationDir, "src/handlers");
    if (!fs.existsSync(handlersDir)) {
      fs.mkdirSync(handlersDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(destinationDir, "src/handlers/index.ts"),
      handlersIndexContent,
    );
    console.log(
      `Created ${path.join(destinationDir, "src/handlers/index.ts")}`,
    );
  } else if (answers.template === TEMPLATE_RUST) {
    // Copy package.json
    processTemplateFile("package.json", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
    });

    // Copy tsconfig.json
    processTemplateFile("tsconfig.json", {});

    // Copy plugin.config.ts
    processTemplateFile("plugin.config.ts", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
      icon: answers.icon,
      color: answers.color,
      events: events
        .map(
          (event) =>
            `'${event}': './src/handlers/${eventHandlerMap[event]}.ts'`,
        )
        .join(",\n    "),
    });

    // Copy src/index.ts
    processTemplateFile("src/index.ts", {
      name: answers.name,
      hasWasmConfig: true,
    });

    // Copy src/types.ts
    processTemplateFile("src/types.ts", {});

    // Copy handlers
    handlers.forEach((handler) => {
      const templateHandler = "src/handlers/issue-opened.ts"; // Use as a base template

      // Create a temporary file path for processing
      const tempFilePath = path.join(destinationDir, `temp-${handler}.ts`);

      // Read template file
      let content = fs.readFileSync(
        path.join(templateDir, templateHandler),
        "utf8",
      );

      // Replace template variables
      const templateVars = {
        handler,
        handlerName: handlerNameMap[handler],
      };

      Object.entries(templateVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        content = content.replace(regex, value.toString());
      });

      // Write directly to the final destination
      const finalPath = path.join(
        destinationDir,
        "src/handlers",
        `${handler}.ts`,
      );

      // Create directory if it doesn't exist
      const dir = path.dirname(finalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(finalPath, content);
      console.log(`Created ${finalPath}`);
    });

    // Create handlers/index.ts
    const handlersIndexContent = `// Export all handlers
${handlers.map((handler) => `export { default as ${handlerNameMap[handler]} } from './${handler}.ts';`).join("\n")}

// Export named handlers for use in index.ts
export const handlers = {
  ${events.map((event) => `'${event}': ${handlerNameMap[eventHandlerMap[event]]}`).join(",\n  ")}
};`;

    // Ensure handlers directory exists
    const handlersDir = path.join(destinationDir, "src/handlers");
    if (!fs.existsSync(handlersDir)) {
      fs.mkdirSync(handlersDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(destinationDir, "src/handlers/index.ts"),
      handlersIndexContent,
    );
    console.log(
      `Created ${path.join(destinationDir, "src/handlers/index.ts")}`,
    );

    // Copy Rust files
    processTemplateFile("wasm/Cargo.toml", {
      name: answers.name,
      description: answers.description,
      author: answers.author,
    });

    processTemplateFile("wasm/src/lib.rs", {});
  }

  // Install dependencies
  console.log("\nInstalling dependencies...");
  try {
    // Build the SDK first
    await execAsync("bun run build:sdk");

    // Create symlink to SDK
    const sdkPath = path.resolve(rootDir, "dist/sdk");
    const pluginNodeModules = path.join(destinationDir, "node_modules");
    const pluginSdkPath = path.join(pluginNodeModules, "plugin-sdk");

    if (!fs.existsSync(pluginNodeModules)) {
      fs.mkdirSync(pluginNodeModules, { recursive: true });
    }

    if (!fs.existsSync(pluginSdkPath)) {
      fs.symlinkSync(sdkPath, pluginSdkPath, "dir");
      console.log(chalk.green(`Created symlink to SDK at ${pluginSdkPath}`));
    }

    // Install plugin dependencies
    await execAsync(`cd ${destinationDir} && bun install`);
  } catch (error) {
    console.warn(
      chalk.yellow("Warning: Could not install dependencies automatically."),
    );
    console.warn(
      'You may need to run "bun install" manually in the plugin directory.',
    );
  }

  console.log(chalk.green("\nPlugin created successfully!"));
  console.log("\nNext steps:");
  console.log(
    `1. Update the plugin configuration in generated/${answers.destination}/plugin.config.${answers.template === TEMPLATE_JS ? "js" : "ts"}`,
  );
  console.log(
    `2. Implement your event handlers in generated/${answers.destination}/src/handlers`,
  );
  console.log("3. Build and test your plugin:");
  console.log(`   cd generated/${answers.destination}`);
  console.log("   bun run build");
}

// Run the main function
main().catch((error) => {
  console.error(chalk.red("Error creating plugin:"), error);
  process.exit(1);
});
