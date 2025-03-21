/**
 * Tutorial Initialization Script
 *
 * This script initializes the tutorial framework by loading the necessary components
 * and initializing them for any tutorial containers found on the page.
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Tutorial initialization script loaded');

  // Find all tutorial containers on the page
  const tutorialContainers = document.querySelectorAll('.tutorial-container');

  if (tutorialContainers.length === 0) {
    console.log('No tutorial containers found on this page');
    return;
  }

  console.log(`Found ${tutorialContainers.length} tutorial containers`);

  // Initialize each tutorial container with vanilla JS implementation
  tutorialContainers.forEach(container => {
    initializeTutorialContainer(container);
  });
});

/**
 * Initialize a tutorial container
 * @param {HTMLElement} container The tutorial container element
 */
function initializeTutorialContainer(container) {
  // Get the tutorial ID from data attribute
  const tutorialId = container.dataset.tutorialId || container.id;
  if (!tutorialId) {
    console.error('Tutorial container does not have an ID or data-tutorial-id attribute');
    return;
  }

  console.log(`Initializing tutorial container: ${tutorialId}`);

  // Create tutorial layout
  createTutorialLayout(container);

  // Load tutorial data
  const tutorialData = getTutorialData(tutorialId);
  if (!tutorialData) {
    console.error(`No tutorial data found for: ${tutorialId}`);
    return;
  }

  // Initialize components
  initializeCodeEditor(container, tutorialData.files);
  initializeStepManager(container, tutorialData.steps);
  initializeOutputViewer(container);
  initializeVisualization(container);

  // Store tutorial state in container
  container.tutorialState = {
    id: tutorialId,
    currentStep: 0,
    files: { ...tutorialData.files }
  };
}

/**
 * Create the tutorial layout
 * @param {HTMLElement} container The tutorial container
 */
function createTutorialLayout(container) {
  // Create the four tutorial panels
  const editorPanel = document.createElement('div');
  editorPanel.className = 'tutorial-editor';
  editorPanel.innerHTML = '<h3 class="tutorial-header">Code Editor</h3><div class="tutorial-editor-content"></div>';

  const stepsPanel = document.createElement('div');
  stepsPanel.className = 'tutorial-steps';
  stepsPanel.innerHTML = '<h3 class="tutorial-header">Tutorial Steps</h3><div class="tutorial-steps-content"></div>';

  const outputPanel = document.createElement('div');
  outputPanel.className = 'tutorial-output';
  outputPanel.innerHTML = '<h3 class="tutorial-header">Output</h3><div class="tutorial-output-content"></div>';

  const visualizationPanel = document.createElement('div');
  visualizationPanel.className = 'tutorial-visualization';
  visualizationPanel.innerHTML = '<h3 class="tutorial-header">Performance Metrics</h3><div class="tutorial-visualization-content"></div>';

  // Add panels to container
  container.appendChild(editorPanel);
  container.appendChild(stepsPanel);
  container.appendChild(outputPanel);
  container.appendChild(visualizationPanel);
}

/**
 * Initialize the code editor
 * @param {HTMLElement} container The tutorial container
 * @param {Object} files The tutorial files
 */
function initializeCodeEditor(container, files) {
  const editorContent = container.querySelector('.tutorial-editor-content');
  if (!editorContent) return;

  // Create file tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'editor-tabs';

  // Get file names
  const fileNames = Object.keys(files);
  if (fileNames.length === 0) return;

  let currentFile = fileNames[0];

  // Create tabs for each file
  fileNames.forEach((fileName, index) => {
    const tab = document.createElement('div');
    tab.className = 'editor-tab';
    if (index === 0) tab.classList.add('active');
    tab.textContent = fileName;
    tab.addEventListener('click', () => {
      // Update active tab
      tabsContainer.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update editor content
      editor.value = files[fileName];
      currentFile = fileName;

      // Update file content in state
      if (container.tutorialState) {
        container.tutorialState.files[currentFile] = editor.value;
      }
    });

    tabsContainer.appendChild(tab);
  });

  editorContent.appendChild(tabsContainer);

  // Create editor textarea
  const editor = document.createElement('textarea');
  editor.className = 'editor-textarea';
  editor.value = files[currentFile];
  editor.addEventListener('input', () => {
    // Update file content in state
    if (container.tutorialState) {
      container.tutorialState.files[currentFile] = editor.value;
    }
  });

  editorContent.appendChild(editor);

  // Create run button
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'editor-controls';

  const runButton = document.createElement('button');
  runButton.className = 'tutorial-btn';
  runButton.textContent = 'Run Code';
  runButton.addEventListener('click', () => {
    executeCode(container);
  });

  controlsContainer.appendChild(runButton);
  editorContent.appendChild(controlsContainer);
}

/**
 * Initialize the step manager
 * @param {HTMLElement} container The tutorial container
 * @param {Array} steps The tutorial steps
 */
function initializeStepManager(container, steps) {
  const stepsContent = container.querySelector('.tutorial-steps-content');
  if (!stepsContent || !steps || steps.length === 0) return;

  // Create steps container
  const stepsContainer = document.createElement('div');
  stepsContainer.className = 'steps-container';

  // Create each step
  steps.forEach((step, index) => {
    const stepElement = document.createElement('div');
    stepElement.className = 'tutorial-step';
    if (index === 0) stepElement.classList.add('active');

    const titleElement = document.createElement('div');
    titleElement.className = 'step-title';
    titleElement.textContent = `Step ${index + 1}: ${step.title}`;

    const instructionsElement = document.createElement('div');
    instructionsElement.className = 'step-instructions';
    instructionsElement.textContent = step.instructions;

    stepElement.appendChild(titleElement);
    stepElement.appendChild(instructionsElement);
    stepsContainer.appendChild(stepElement);
  });

  stepsContent.appendChild(stepsContainer);

  // Add navigation controls
  if (steps.length > 1) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'tutorial-controls';

    const prevButton = document.createElement('button');
    prevButton.className = 'tutorial-btn';
    prevButton.textContent = 'Previous';
    prevButton.disabled = true;
    prevButton.addEventListener('click', () => {
      navigateStep(container, -1);
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'tutorial-btn';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      navigateStep(container, 1);
    });

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(nextButton);
    stepsContent.appendChild(controlsContainer);
  }
}

/**
 * Navigate steps
 * @param {HTMLElement} container The tutorial container
 * @param {number} delta The step delta (-1 or 1)
 */
function navigateStep(container, delta) {
  if (!container.tutorialState) return;

  // Get current step
  const currentStep = container.tutorialState.currentStep;
  const steps = container.querySelectorAll('.tutorial-step');

  // Calculate new step
  const newStep = currentStep + delta;
  if (newStep < 0 || newStep >= steps.length) return;

  // Update active step
  steps[currentStep].classList.remove('active');
  steps[newStep].classList.add('active');

  // Update buttons
  const prevButton = container.querySelector('.tutorial-controls button:first-child');
  const nextButton = container.querySelector('.tutorial-controls button:last-child');

  if (prevButton) prevButton.disabled = newStep === 0;
  if (nextButton) nextButton.disabled = newStep === steps.length - 1;

  // Update state
  container.tutorialState.currentStep = newStep;
}

/**
 * Initialize the output viewer
 * @param {HTMLElement} container The tutorial container
 */
function initializeOutputViewer(container) {
  const outputContent = container.querySelector('.tutorial-output-content');
  if (!outputContent) return;

  // Create output area
  const outputArea = document.createElement('div');
  outputArea.className = 'output-area';
  outputArea.textContent = 'Run your code to see output here.';

  outputContent.appendChild(outputArea);
}

/**
 * Initialize the visualization
 * @param {HTMLElement} container The tutorial container
 */
function initializeVisualization(container) {
  const visualContent = container.querySelector('.tutorial-visualization-content');
  if (!visualContent) return;

  // Create placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'visualization-placeholder';
  placeholder.textContent = 'Run your code to see performance metrics.';
  visualContent.appendChild(placeholder);

  // Create metrics container (initially hidden)
  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'metrics-container';
  metricsContainer.style.display = 'none';
  visualContent.appendChild(metricsContainer);
}

/**
 * Execute the code
 * @param {HTMLElement} container The tutorial container
 */
function executeCode(container) {
  // Get code from editor
  const editor = container.querySelector('.editor-textarea');
  if (!editor) return;

  const code = editor.value;

  // Update output
  updateOutput(container, code);

  // Update visualization
  updateVisualization(container);
}

/**
 * Update the output
 * @param {HTMLElement} container The tutorial container
 * @param {string} code The code to execute
 */
function updateOutput(container, code) {
  const outputArea = container.querySelector('.output-area');
  if (!outputArea) return;

  // Clear existing content
  outputArea.innerHTML = '';

  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'output-timestamp';
  timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;

  // Generate simulated output
  const tutorialId = container.dataset.tutorialId || container.id;
  const output = generateSimulatedOutput(tutorialId);

  // Create output text
  const outputText = document.createElement('pre');
  outputText.className = 'output-content';
  outputText.textContent = output;

  // Add to output area
  outputArea.appendChild(timestamp);
  outputArea.appendChild(outputText);
}

/**
 * Update the visualization
 * @param {HTMLElement} container The tutorial container
 */
function updateVisualization(container) {
  const visualContent = container.querySelector('.tutorial-visualization-content');
  if (!visualContent) return;

  // Get placeholder and metrics container
  const placeholder = visualContent.querySelector('.visualization-placeholder');
  const metricsContainer = visualContent.querySelector('.metrics-container');

  if (!placeholder || !metricsContainer) return;

  // Hide placeholder, show metrics
  placeholder.style.display = 'none';
  metricsContainer.style.display = 'grid';

  // Clear metrics container
  metricsContainer.innerHTML = '';

  // Generate random metrics
  const executionTime = Math.floor(Math.random() * 100) + 50; // 50-150ms
  const memoryUsage = (Math.random() * 10 + 5).toFixed(1); // 5.0-15.0MB
  const bundleSize = (Math.random() * 20 + 10).toFixed(1); // 10.0-30.0KB

  // Create metrics
  const metrics = [
    { title: 'Execution Time', value: `${executionTime} ms`, rating: calculateRating(executionTime, 'time') },
    { title: 'Memory Usage', value: `${memoryUsage} MB`, rating: calculateRating(parseFloat(memoryUsage), 'memory') },
    { title: 'Bundle Size', value: `${bundleSize} KB`, rating: calculateRating(parseFloat(bundleSize), 'size') }
  ];

  // Add metrics
  metrics.forEach(metric => {
    const card = createMetricCard(metric);
    metricsContainer.appendChild(card);
  });
}

/**
 * Create a metric card
 * @param {Object} metric The metric data
 * @returns {HTMLElement} The metric card
 */
function createMetricCard(metric) {
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

  // Add stars
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('span');
    star.className = i < metric.rating ? 'star filled' : 'star';
    star.textContent = '★';
    rating.appendChild(star);
  }

  card.appendChild(title);
  card.appendChild(value);
  card.appendChild(rating);

  return card;
}

/**
 * Calculate rating
 * @param {number} value The metric value
 * @param {string} type The metric type
 * @returns {number} The rating (1-5)
 */
function calculateRating(value, type) {
  // Default to 3 stars
  let rating = 3;

  // Calculate rating based on type
  switch (type) {
    case 'time':
      // Execution time (lower is better)
      if (value < 50) rating = 5;
      else if (value < 80) rating = 4;
      else if (value < 120) rating = 3;
      else if (value < 200) rating = 2;
      else rating = 1;
      break;

    case 'memory':
      // Memory usage (lower is better)
      if (value < 5) rating = 5;
      else if (value < 8) rating = 4;
      else if (value < 12) rating = 3;
      else if (value < 20) rating = 2;
      else rating = 1;
      break;

    case 'size':
      // Bundle size (lower is better)
      if (value < 10) rating = 5;
      else if (value < 15) rating = 4;
      else if (value < 20) rating = 3;
      else if (value < 30) rating = 2;
      else rating = 1;
      break;
  }

  return rating;
}

/**
 * Generate simulated output
 * @param {string} tutorialId The tutorial ID
 * @returns {string} The simulated output
 */
function generateSimulatedOutput(tutorialId) {
  const baseOutput = [
    'Starting execution...',
    '',
    'Plugin initialized!'
  ];

  let specificOutput = [];

  switch (tutorialId) {
    case 'first-plugin':
      specificOutput = [
        'Handling issue opened event...',
        '',
        'Success! The issue has been processed.',
        'Added labels: enhancement',
        'Created comment on issue #123'
      ];
      break;

    case 'event-handling':
      specificOutput = [
        'Handling multiple events...',
        'Issue opened: New feature request',
        'Pull request opened: Implement feature',
        '',
        'Success! All events processed.',
        'Events handled: 2'
      ];
      break;

    case 'github-api':
      specificOutput = [
        'Fetching repository data from GitHub API...',
        'Retrieved 84 issues and 36 pull requests',
        '',
        'Generated repository report:',
        '- Open issues: 23',
        '- Closed issues: 61',
        '- Open PRs: 8',
        '- Merged PRs: 28',
        '',
        'Success! Report created.'
      ];
      break;

    default:
      specificOutput = [
        'Processing event...',
        '',
        'Success! Operation completed.'
      ];
  }

  return [...baseOutput, ...specificOutput].join('\n');
}

/**
 * Get tutorial data
 * @param {string} tutorialId The tutorial ID
 * @returns {Object|null} The tutorial data
 */
function getTutorialData(tutorialId) {
  // Hard-coded tutorial data for the three tutorials
  const tutorials = {
    'first-plugin': {
      id: 'first-plugin',
      title: 'First Plugin Tutorial',
      description: 'Build your first GitHub Action plugin',
      steps: [
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
      ],
      files: {
        'plugin.config.js': '// Plugin configuration\nmodule.exports = {\n  name: "my-first-plugin",\n  version: "1.0.0",\n  events: {\n    issues: ["opened"]\n  }\n};',
        'src/index.js': '// Plugin entry point\nconst handleIssueOpened = require("./handlers/issue-opened");\n\nmodule.exports = function(context) {\n  // Handle different events\n  if (context.event.name === "issues" && context.event.action === "opened") {\n    return handleIssueOpened(context);\n  }\n};',
        'src/handlers/issue-opened.js': '// Issue opened handler\nmodule.exports = async function handleIssueOpened(context) {\n  console.log("Issue opened: " + context.payload.issue.title);\n  \n  // Your code here\n  \n  return {\n    success: true\n  };\n};'
      }
    },
    'event-handling': {
      id: 'event-handling',
      title: 'Event Handling Tutorial',
      description: 'Learn to handle multiple GitHub events',
      steps: [
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
      ],
      files: {
        'plugin.config.js': '// Plugin configuration\nmodule.exports = {\n  name: "event-handler",\n  version: "1.0.0",\n  events: {\n    issues: ["opened", "edited"],\n    pull_request: ["opened"]\n  }\n};',
        'src/index.js': '// Plugin entry point\nconst handlers = require("./handlers");\n\nmodule.exports = function(context) {\n  // Your code here\n  // Implement event routing\n};',
        'src/handlers/index.js': '// Handler exports\nmodule.exports = {\n  issueOpened: require("./issue-opened"),\n  prOpened: require("./pr-opened")\n};'
      }
    },
    'github-api': {
      id: 'github-api',
      title: 'GitHub API Tutorial',
      description: 'Work with the GitHub API',
      steps: [
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
      ],
      files: {
        'plugin.config.js': '// Plugin configuration\nmodule.exports = {\n  name: "github-api-plugin",\n  version: "1.0.0",\n  events: {\n    schedule: ["cron:0 0 * * *"]\n  }\n};',
        'src/index.js': '// Plugin entry point\nconst { generateReport } = require("./utils/report");\n\nmodule.exports = async function(context) {\n  // Your code here\n  // Use GitHub API to fetch repository data\n};',
        'src/utils/github-api.js': '// GitHub API utilities\nclass GitHubApi {\n  constructor(context) {\n    this.context = context;\n  }\n\n  // Implement API methods here\n}'
      }
    }
  };

  return tutorials[tutorialId] || null;
}
