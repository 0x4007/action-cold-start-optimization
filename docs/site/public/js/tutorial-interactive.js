/**
 * Interactive Tutorial Framework
 *
 * This script provides interactive functionality for tutorials,
 * including code editing, step navigation, output display, and performance visualization.
 */

// Wait for the DOM to be fully loaded before initializing tutorials
document.addEventListener('DOMContentLoaded', function() {
  console.log('Interactive Tutorial Framework initializing...');
  initializeTutorials();
});

// Allow re-initialization if needed
window.initializeInteractiveTutorials = initializeTutorials;

// Main initialization function
function initializeTutorials() {
  console.log('Looking for tutorial containers...');

  // Find all tutorial containers on the page
  const tutorialContainers = document.querySelectorAll('.tutorial-container');

  if (tutorialContainers.length === 0) {
    console.log('No tutorial containers found on this page. Will try again shortly.');
    // Try again after a short delay in case the page is still loading
    setTimeout(initializeTutorials, 500);
    return;
  }

  console.log(`Found ${tutorialContainers.length} tutorial containers. Initializing...`);

  // Initialize each tutorial container
  tutorialContainers.forEach(container => {
    const tutorialId = container.dataset.tutorialId || container.id;
    console.log(`Initializing tutorial: ${tutorialId}`);
    initializeTutorial(container, tutorialId);
  });

  // Add a global class to indicate tutorials are loaded
  document.body.classList.add('tutorials-initialized');
}

/**
 * Initialize a tutorial container with all required components
 * @param {HTMLElement} container - The tutorial container
 * @param {string} tutorialId - The identifier for this tutorial
 */
function initializeTutorial(container, tutorialId) {
  console.log(`Initializing tutorial: ${tutorialId}`);

  // Create the four main panels
  const editorPanel = createPanel('tutorial-editor', 'Code Editor');
  const stepsPanel = createPanel('tutorial-steps', 'Tutorial Steps');
  const outputPanel = createPanel('tutorial-output', 'Output');
  const visualizationPanel = createPanel('tutorial-visualization', 'Performance Metrics');

  // Add panels to container
  container.appendChild(editorPanel);
  container.appendChild(stepsPanel);
  container.appendChild(outputPanel);
  container.appendChild(visualizationPanel);

  // Initialize components
  initializeEditor(editorPanel, tutorialId);
  initializeSteps(stepsPanel, tutorialId);
  initializeOutput(outputPanel);
  initializeVisualization(visualizationPanel);

  // Store tutorial state in the container
  container.tutorialState = {
    currentStep: 0,
    files: getTutorialFiles(tutorialId),
    steps: getTutorialSteps(tutorialId)
  };
}

/**
 * Create a panel element with header
 * @param {string} className - CSS class name for the panel
 * @param {string} title - Title text for the panel header
 * @returns {HTMLElement} The created panel
 */
function createPanel(className, title) {
  const panel = document.createElement('div');
  panel.className = className;

  const header = document.createElement('h3');
  header.className = 'tutorial-header';
  header.textContent = title;

  const content = document.createElement('div');
  content.className = `${className}-content`;

  panel.appendChild(header);
  panel.appendChild(content);

  return panel;
}

/**
 * Initialize the code editor panel
 * @param {HTMLElement} panel - The editor panel element
 * @param {string} tutorialId - The identifier for this tutorial
 */
function initializeEditor(panel, tutorialId) {
  const content = panel.querySelector('.tutorial-editor-content');

  // Create editor container
  const editorContent = document.createElement('div');
  editorContent.className = 'editor-content';

  // Add file tabs
  const files = getTutorialFiles(tutorialId);
  const filenames = Object.keys(files);

  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'editor-tabs';

  filenames.forEach((filename, index) => {
    const tab = document.createElement('div');
    tab.className = 'editor-tab';
    tab.textContent = filename;
    tab.dataset.file = filename;

    if (index === 0) {
      tab.classList.add('active');
    }

    tab.addEventListener('click', function() {
      // Update active tab
      tabsContainer.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update editor content
      editor.value = files[filename];
    });

    tabsContainer.appendChild(tab);
  });

  editorContent.appendChild(tabsContainer);

  // Add code editor
  const editor = document.createElement('textarea');
  editor.className = 'editor-textarea';
  editor.value = files[filenames[0]];
  editorContent.appendChild(editor);

}

/**
 * Initialize the steps panel
 * @param {HTMLElement} panel - The steps panel element
 * @param {string} tutorialId - The identifier for this tutorial
 */
function initializeSteps(panel, tutorialId) {
  const content = panel.querySelector('.tutorial-steps-content');

  // Create steps container
  const stepsContainer = document.createElement('div');
  stepsContainer.className = 'steps-container';

  // Add steps
  const steps = getTutorialSteps(tutorialId);

  steps.forEach((step, index) => {
    const stepElement = document.createElement('div');
    stepElement.className = 'tutorial-step';
    if (index === 0) {
      stepElement.classList.add('active');
    }

    const titleElement = document.createElement('div');
    titleElement.className = 'step-title';
    titleElement.textContent = `Step ${index + 1}: ${step.title}`;
    stepElement.appendChild(titleElement);

    const instructionsElement = document.createElement('div');
    instructionsElement.className = 'step-instructions';
    instructionsElement.textContent = step.instructions;
    if (index !== 0) {
      instructionsElement.style.display = 'none';
    }
    stepElement.appendChild(instructionsElement);

    stepsContainer.appendChild(stepElement);
  });

  content.appendChild(stepsContainer);

  // Add navigation buttons
  if (steps.length > 1) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'tutorial-controls';

    const prevButton = document.createElement('button');
    prevButton.className = 'tutorial-btn';
    prevButton.textContent = 'Previous';
    prevButton.disabled = true;
    prevButton.addEventListener('click', function() {
      navigateStep(panel, -1);
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'tutorial-btn';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', function() {
      navigateStep(panel, 1);
    });

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(nextButton);

    content.appendChild(controlsContainer);
  }
}

/**
 * Initialize the output panel
 * @param {HTMLElement} panel - The output panel element
 */
function initializeOutput(panel) {
  const content = panel.querySelector('.tutorial-output-content');

  // Create output area
  const outputArea = document.createElement('div');
  outputArea.className = 'output-area';
  outputArea.textContent = 'Run your code to see output here.';

  content.appendChild(outputArea);
}

/**
 * Initialize the visualization panel
 * @param {HTMLElement} panel - The visualization panel element
 */
function initializeVisualization(panel) {
  const content = panel.querySelector('.tutorial-visualization-content');

  // Create placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'visualization-placeholder';
  placeholder.textContent = 'Run your code to see performance metrics.';

  content.appendChild(placeholder);
}

/**
 * Navigate between tutorial steps
 * @param {HTMLElement} panel - The steps panel element
 * @param {number} delta - Direction to navigate (-1 for previous, 1 for next)
 */
function navigateStep(panel, delta) {
  const container = panel.closest('.tutorial-container');
  const steps = container.querySelectorAll('.tutorial-step');
  const controls = container.querySelector('.tutorial-controls');

  let currentIndex = Array.from(steps).findIndex(step => step.classList.contains('active'));
  let newIndex = currentIndex + delta;

  if (newIndex < 0 || newIndex >= steps.length) {
    return;
  }

  // Update active step
  steps[currentIndex].classList.remove('active');
  steps[currentIndex].querySelector('.step-instructions').style.display = 'none';

  steps[newIndex].classList.add('active');
  steps[newIndex].querySelector('.step-instructions').style.display = 'block';

  // Update buttons
  if (controls) {
    const prevButton = controls.querySelector('button:first-child');
    const nextButton = controls.querySelector('button:last-child');

    prevButton.disabled = (newIndex === 0);
    nextButton.disabled = (newIndex === steps.length - 1);
  }

  // Store current step
  container.tutorialState.currentStep = newIndex;
}

/**
 * Simulate code execution
 * @param {HTMLElement} outputPanel - The output panel element
 * @param {HTMLElement} visualPanel - The visualization panel element
 */
function simulateCodeExecution(outputPanel, visualPanel) {
  // Update output
  const outputContent = outputPanel.querySelector('.tutorial-output-content .output-area');

  outputContent.innerHTML = '';

  const timestamp = document.createElement('div');
  timestamp.className = 'output-timestamp';
  timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;
  outputContent.appendChild(timestamp);

  const outputText = document.createElement('pre');
  outputText.className = 'output-content';
  outputText.textContent = `Starting execution...\n\nPlugin initialized!\nHandling issue opened event...\n\nSuccess! The issue has been processed.\nAdded labels: enhancement\nCreated comment on issue #123`;
  outputContent.appendChild(outputText);

  // Update visualization
  const visualContent = visualPanel.querySelector('.tutorial-visualization-content');
  visualContent.innerHTML = '';

  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'metrics-container';

  const metrics = [
    { title: 'Execution Time', value: '78 ms', rating: 4 },
    { title: 'Memory Usage', value: '8.2 MB', rating: 3 },
    { title: 'Bundle Size', value: '12.4 KB', rating: 4 }
  ];

  metrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'metric-card';

    const title = document.createElement('div');
    title.className = 'metric-title';
    title.textContent = metric.title;

    const value = document.createElement('div');
    value.className = 'metric-value';
    value.textContent = metric.value;

    const rating = document.createElement('div');
    rating.className = 'metric-rating';

    for (let i = 0; i < 5; i++) {
      const star = document.createElement('span');
      star.className = 'star' + (i < metric.rating ? ' filled' : '');
      star.textContent = '★';
      rating.appendChild(star);
    }

    card.appendChild(title);
    card.appendChild(value);
    card.appendChild(rating);

    metricsContainer.appendChild(card);
  });

  visualContent.appendChild(metricsContainer);
}

/**
 * Get tutorial files based on tutorial ID
 * @param {string} tutorialId - The identifier for this tutorial
 * @returns {Object} Object with filenames as keys and file content as values
 */
function getTutorialFiles(tutorialId) {
  // Default files
  const baseFiles = {
    'plugin.config.js': '// Plugin configuration\nmodule.exports = {\n  name: "my-first-plugin",\n  version: "1.0.0",\n  events: {\n    issues: ["opened"]\n  }\n};',
    'src/index.js': '// Plugin entry point\nconst handleIssueOpened = require("./handlers/issue-opened");\n\nmodule.exports = function(context) {\n  // Handle different events\n  if (context.event.name === "issues" && context.event.action === "opened") {\n    return handleIssueOpened(context);\n  }\n};',
    'src/handlers/issue-opened.js': '// Issue opened handler\nmodule.exports = async function handleIssueOpened(context) {\n  console.log("Issue opened: " + context.payload.issue.title);\n  \n  // Your code here\n  \n  return {\n    success: true\n  };\n};'
  };

  // Tutorial-specific files
  switch (tutorialId) {
    case 'event-handling':
      return {
        'plugin.config.js': '// Plugin configuration\nmodule.exports = {\n  name: "event-handler",\n  version: "1.0.0",\n  events: {\n    issues: ["opened", "edited"],\n    pull_request: ["opened"]\n  }\n};',
        'src/index.js': '// Plugin entry point\nconst handlers = require("./handlers");\n\nmodule.exports = function(context) {\n  // Your code here\n  // Implement event routing\n};',
        'src/handlers/index.js': '// Handler exports\nmodule.exports = {\n  issueOpened: require("./issue-opened"),\n  prOpened: require("./pr-opened")\n};'
      };
    case 'github-api':
      return {
        'plugin.config.js': '// Plugin configuration\nmodule.exports = {\n  name: "github-api-plugin",\n  version: "1.0.0",\n  events: {\n    schedule: ["cron:0 0 * * *"]\n  }\n};',
        'src/index.js': '// Plugin entry point\nconst { generateReport } = require("./utils/report");\n\nmodule.exports = async function(context) {\n  // Your code here\n  // Use GitHub API to fetch repository data\n};',
        'src/utils/github-api.js': '// GitHub API utilities\nclass GitHubApi {\n  constructor(context) {\n    this.context = context;\n  }\n\n  // Implement API methods here\n}'
      };
    default:
      return baseFiles;
  }
}

/**
 * Get tutorial steps based on tutorial ID
 * @param {string} tutorialId - The identifier for this tutorial
 * @returns {Array} Array of step objects with title and instructions
 */
function getTutorialSteps(tutorialId) {
  // Default steps
  const baseSteps = [
    {
      title: 'Understanding the plugin structure',
      instructions: 'Examine the basic structure of the plugin files. The configuration defines metadata and which events to listen for.'
    },
    {
      title: 'Implementing the issue handler',
      instructions: 'Now implement the issue-opened event handler to respond when a new issue is created.'
    },
    {
      title: 'Adding issue labeling',
      instructions: 'Enhance your handler to automatically add labels based on the issue content.'
    },
    {
      title: 'Creating a welcome comment',
      instructions: 'Add code to post a welcome comment on newly opened issues.'
    },
    {
      title: 'Testing your plugin',
      instructions: 'Test your plugin with a simulated issue event to verify it works correctly.'
    }
  ];

  // Tutorial-specific steps
  switch (tutorialId) {
    case 'event-handling':
      return [
        {
          title: 'Handling multiple events',
          instructions: 'Set up your plugin to handle multiple different GitHub events.'
        },
        {
          title: 'Event routing',
          instructions: 'Implement logic to route different events to their appropriate handlers.'
        },
        {
          title: 'Shared utilities',
          instructions: 'Create shared utilities that can be used across different event handlers.'
        },
        {
          title: 'Testing with events',
          instructions: 'Test your plugin with various event types to ensure correct handling.'
        }
      ];
    case 'github-api':
      return [
        {
          title: 'Working with the GitHub API',
          instructions: 'Learn how to use the Octokit client to interact with the GitHub API.'
        },
        {
          title: 'Fetching repository data',
          instructions: 'Implement functions to retrieve data about the repository.'
        },
        {
          title: 'Creating reports',
          instructions: 'Generate meaningful reports from the data you collect.'
        },
        {
          title: 'Optimizing API usage',
          instructions: 'Learn how to handle rate limits and optimize your API requests.'
        }
      ];
    default:
      return baseSteps;
  }
}
