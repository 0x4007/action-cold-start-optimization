/**
 * Tutorial Loader Script
 *
 * This script ensures that tutorial components are properly initialized
 * even when the page content is loaded dynamically (such as in VitePress).
 */

// Initialize immediately for static content
document.addEventListener('DOMContentLoaded', initializeTutorials);

// Also wait for VitePress content updates
window.addEventListener('load', function() {
  // Initialize on initial page load
  initializeTutorials();

  // Watch for VitePress route changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        // New content was added to the page, check for tutorials
        initializeTutorials();
      }
    });
  });

  // Target the VitePress main content area
  const targetNode = document.querySelector('.VPContent') || document.body;
  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true });
  }
});

/**
 * Initialize all tutorial containers on the page
 */
function initializeTutorials() {
  console.log('Looking for tutorial containers to initialize...');
  const tutorialContainers = document.querySelectorAll('.tutorial-container');

  if (tutorialContainers.length === 0) {
    return;
  }

  console.log(`Found ${tutorialContainers.length} tutorial containers`);

  tutorialContainers.forEach(function(container) {
    // Check if this container has already been initialized
    if (!container.hasAttribute('data-initialized')) {
      const tutorialId = container.getAttribute('data-tutorial-id') || container.id;
      console.log(`Initializing tutorial: ${tutorialId}`);

      // Try to find initialization functions in global scope
      if (typeof window['initializeTutorialContainer'] === 'function') {
        window['initializeTutorialContainer'](container);
      } else {
        // Fallback - manually create the tutorial components
        createTutorialLayout(container);
        initializeBasicTutorial(container, tutorialId);
        console.log('Created tutorial layout manually');
      }

      container.setAttribute('data-initialized', 'true');
    }
  });
}

/**
 * Create the tutorial layout
 * @param {Element} container The tutorial container
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
 * Initialize a basic tutorial with minimal functionality
 * @param {Element} container The tutorial container
 * @param {string} tutorialId The tutorial ID
 */
function initializeBasicTutorial(container, tutorialId) {
  // Get tutorial data based on ID
  const tutorialData = getTutorialData(tutorialId);
  if (!tutorialData) {
    console.error(`No tutorial data found for: ${tutorialId}`);
    return;
  }

  // Initialize basic components
  initializeEditor(container.querySelector('.tutorial-editor-content'), tutorialData.files);
  initializeSteps(container.querySelector('.tutorial-steps-content'), tutorialData.steps);
  initializeOutput(container.querySelector('.tutorial-output-content'));
  initializeVisualization(container.querySelector('.tutorial-visualization-content'));
}

/**
 * Initialize the code editor
 * @param {Element} content The editor content element
 * @param {Object} files The tutorial files
 */
function initializeEditor(content, files) {
  if (!content) return;

  // Create file tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'editor-tabs';

  // Get file names
  const fileNames = Object.keys(files);
  if (fileNames.length === 0) return;

  let currentFile = fileNames[0];

  // Create tabs for each file
  fileNames.forEach(function(fileName, index) {
    const tab = document.createElement('div');
    tab.className = 'editor-tab';
    if (index === 0) tab.classList.add('active');
    tab.textContent = fileName;
    tab.addEventListener('click', function() {
      // Update active tab
      tabsContainer.querySelectorAll('.editor-tab').forEach(function(t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');

      // Update editor content
      editor.value = files[fileName];
      currentFile = fileName;
    });

    tabsContainer.appendChild(tab);
  });

  content.appendChild(tabsContainer);

  // Create editor textarea
  const editor = document.createElement('textarea');
  editor.className = 'editor-textarea';
  editor.value = files[currentFile];
  editor.setAttribute('spellcheck', 'false');

  // Make sure the textarea is editable
  editor.readOnly = false;

  // Set event listener to track changes
  editor.addEventListener('input', function() {
    console.log('Editor content changed');
    // Store the updated content
    if (currentFile) {
      files[currentFile] = editor.value;
    }
  });

  content.appendChild(editor);

  // Create run button
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'editor-controls';

  const runButton = document.createElement('button');
  runButton.className = 'tutorial-btn';
  runButton.textContent = 'Run Code';
  runButton.addEventListener('click', function() {
    const container = content.closest('.tutorial-container');
    const outputContent = container.querySelector('.tutorial-output-content');
    const visualContent = container.querySelector('.tutorial-visualization-content');

    updateOutput(outputContent);
    updateVisualization(visualContent);
  });

  controlsContainer.appendChild(runButton);
  content.appendChild(controlsContainer);
}

/**
 * Initialize the steps section
 * @param {Element} content The steps content element
 * @param {Array} steps The tutorial steps
 */
function initializeSteps(content, steps) {
  if (!content || !steps || steps.length === 0) return;

  // Create steps container
  const stepsContainer = document.createElement('div');
  stepsContainer.className = 'steps-container';

  // Create each step
  steps.forEach(function(step, index) {
    const stepElement = document.createElement('div');
    stepElement.className = 'tutorial-step';
    if (index === 0) stepElement.classList.add('active');

    const titleElement = document.createElement('div');
    titleElement.className = 'step-title';
    titleElement.textContent = `Step ${index + 1}: ${step.title}`;

    const instructionsElement = document.createElement('div');
    instructionsElement.className = 'step-instructions';
    instructionsElement.textContent = step.instructions;
    if (index !== 0) {
      instructionsElement.style.display = 'none';
    }

    stepElement.appendChild(titleElement);
    stepElement.appendChild(instructionsElement);
    stepsContainer.appendChild(stepElement);
  });

  content.appendChild(stepsContainer);

  // Add navigation controls
  if (steps.length > 1) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'tutorial-controls';

    const prevButton = document.createElement('button');
    prevButton.className = 'tutorial-btn';
    prevButton.textContent = 'Previous';
    prevButton.disabled = true;
    prevButton.addEventListener('click', function() {
      navigateStep(content.closest('.tutorial-container'), -1);
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'tutorial-btn';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', function() {
      navigateStep(content.closest('.tutorial-container'), 1);
    });

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(nextButton);
    content.appendChild(controlsContainer);
  }
}

/**
 * Navigate between steps
 * @param {Element} container The tutorial container
 * @param {number} delta Direction to navigate (-1 for previous, 1 for next)
 */
function navigateStep(container, delta) {
  const steps = container.querySelectorAll('.tutorial-step');
  const controls = container.querySelector('.tutorial-controls');

  // Find current active step
  let currentIndex = 0;
  steps.forEach(function(step, index) {
    if (step.classList.contains('active')) {
      currentIndex = index;
    }
  });

  // Calculate new index
  const newIndex = currentIndex + delta;
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
}

/**
 * Initialize the output panel
 * @param {Element} content The output content element
 */
function initializeOutput(content) {
  if (!content) return;

  // Create output area
  const outputArea = document.createElement('div');
  outputArea.className = 'output-area';
  outputArea.textContent = 'Run your code to see output here.';

  content.appendChild(outputArea);
}

/**
 * Update the output display
 * @param {Element} content The output content element
 */
function updateOutput(content) {
  if (!content) return;

  const outputArea = content.querySelector('.output-area');
  if (!outputArea) return;

  // Clear existing content
  outputArea.innerHTML = '';

  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'output-timestamp';
  timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;
  outputArea.appendChild(timestamp);

  // Add sample output
  const outputText = document.createElement('pre');
  outputText.className = 'output-content';
  outputText.textContent = `Starting execution...\n\nPlugin initialized!\nHandling issue opened event...\n\nSuccess! The issue has been processed.\nAdded labels: enhancement\nCreated comment on issue #123`;
  outputArea.appendChild(outputText);
}

/**
 * Initialize the visualization panel
 * @param {Element} content The visualization content element
 */
function initializeVisualization(content) {
  if (!content) return;

  // Create placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'visualization-placeholder';
  placeholder.textContent = 'Run your code to see performance metrics.';

  content.appendChild(placeholder);
}

/**
 * Update the visualization display
 * @param {Element} content The visualization content element
 */
function updateVisualization(content) {
  if (!content) return;

  // Clear content
  content.innerHTML = '';

  // Create metrics container
  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'metrics-container';

  // Sample metrics
  const metrics = [
    { title: 'Execution Time', value: '78 ms', rating: 4 },
    { title: 'Memory Usage', value: '8.2 MB', rating: 3 },
    { title: 'Bundle Size', value: '12.4 KB', rating: 4 }
  ];

  // Add each metric card
  metrics.forEach(function(metric) {
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
      star.className = 'star' + (i < metric.rating ? ' filled' : '');
      star.textContent = '★';
      rating.appendChild(star);
    }

    card.appendChild(title);
    card.appendChild(value);
    card.appendChild(rating);

    metricsContainer.appendChild(card);
  });

  content.appendChild(metricsContainer);
}

/**
 * Get tutorial data based on tutorial ID
 * @param {string} tutorialId The tutorial ID
 * @returns {Object|null} The tutorial data
 */
function getTutorialData(tutorialId) {
  // Default tutorial data for the first plugin tutorial
  const defaultTutorial = {
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
  };

  // Tutorial data mapping
  const tutorials = {
    'first-plugin': defaultTutorial,
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

  return tutorials[tutorialId] || defaultTutorial;
}
