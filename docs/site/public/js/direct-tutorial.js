/**
 * Direct Tutorial Initializer
 * This script creates a standalone tutorial that doesn't rely on the tutorial-interactive.js file
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Direct Tutorial Initializer Loaded');
  setTimeout(initializeDirectTutorial, 500);
});

// Ensure the script runs when the page is fully loaded
window.addEventListener('load', function() {
  console.log('Window load event - initializing direct tutorial');
  initializeDirectTutorial();
});

function initializeDirectTutorial() {
  console.log('Attempting to initialize direct tutorial');

  // Find tutorial containers
  const containers = document.querySelectorAll('.tutorial-container');
  if (containers.length === 0) {
    console.log('No tutorial containers found - will retry');
    setTimeout(initializeDirectTutorial, 500);
    return;
  }

  // Process each container
  containers.forEach(container => {
    // Only initialize if empty - don't override if already initialized
    if (container.children.length > 0) {
      console.log('Container already initialized');
      return;
    }

    console.log('Initializing direct tutorial for', container.dataset.tutorialId);
    const tutorialId = container.dataset.tutorialId || 'first-plugin';

    // Create the four tutorial panels
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr 1fr';
    container.style.gridTemplateRows = 'minmax(250px, 1fr) minmax(200px, 1fr)';
    container.style.gap = '1rem';
    container.style.height = '600px';

    // 1. Code Editor Panel
    const editorPanel = document.createElement('div');
    editorPanel.className = 'tutorial-editor';
    editorPanel.style.gridColumn = '1';
    editorPanel.style.gridRow = '1';
    editorPanel.style.backgroundColor = '#1e1e2e';
    editorPanel.style.borderRadius = '6px';
    editorPanel.style.overflow = 'auto';
    editorPanel.style.padding = '0.5rem';

    const editorHeader = document.createElement('h3');
    editorHeader.className = 'tutorial-header';
    editorHeader.textContent = 'Code Editor';
    editorHeader.style.borderBottom = '1px solid #3d3d5c';
    editorHeader.style.padding = '0.5rem';
    editorHeader.style.margin = '0';

    const editorContent = document.createElement('div');
    editorContent.className = 'tutorial-editor-content';

    // Create file tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'editor-tabs';
    tabsContainer.style.display = 'flex';
    tabsContainer.style.overflowX = 'auto';
    tabsContainer.style.borderBottom = '1px solid #3d3d5c';

    // Get tutorial files based on ID
    const files = getTutorialFiles(tutorialId);
    const filenames = Object.keys(files);

    filenames.forEach((filename, index) => {
      const tab = document.createElement('div');
      tab.className = 'editor-tab';
      tab.textContent = filename;
      tab.style.padding = '0.5rem 1rem';
      tab.style.cursor = 'pointer';
      tab.style.borderRight = '1px solid #3d3d5c';
      tab.style.fontFamily = 'monospace';
      tab.style.fontSize = '0.9em';

      if (index === 0) {
        tab.classList.add('active');
        tab.style.backgroundColor = '#282a36';
        tab.style.borderBottom = '2px solid #bd93f9';
      }

      tab.addEventListener('click', () => {
        // Update active tab
        tabsContainer.querySelectorAll('.editor-tab').forEach(t => {
          t.classList.remove('active');
          t.style.backgroundColor = '';
          t.style.borderBottom = '';
        });
        tab.classList.add('active');
        tab.style.backgroundColor = '#282a36';
        tab.style.borderBottom = '2px solid #bd93f9';

        // Update editor content
        editor.value = files[filename];
      });

      tabsContainer.appendChild(tab);
    });

    // Create editor textarea
    const editor = document.createElement('textarea');
    editor.className = 'editor-textarea';
    editor.value = files[filenames[0]];
    editor.style.width = '100%';
    editor.style.height = '300px';
    editor.style.border = 'none';
    editor.style.backgroundColor = '#282a36';
    editor.style.color = '#f8f8f2';
    editor.style.fontFamily = 'monospace';
    editor.style.padding = '0.75rem';
    editor.style.resize = 'none';

    // Create run button
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'editor-controls';
    controlsContainer.style.padding = '0.5rem';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'flex-end';

    const runButton = document.createElement('button');
    runButton.className = 'tutorial-btn';
    runButton.textContent = 'Run Code';
    runButton.style.padding = '0.4rem 0.8rem';
    runButton.style.backgroundColor = '#bd93f9';
    runButton.style.color = 'white';
    runButton.style.border = 'none';
    runButton.style.borderRadius = '4px';
    runButton.style.cursor = 'pointer';

    runButton.addEventListener('click', () => {
      simulateCodeExecution(container);
    });

    controlsContainer.appendChild(runButton);

    // Assemble editor panel
    editorContent.appendChild(tabsContainer);
    editorContent.appendChild(editor);
    editorContent.appendChild(controlsContainer);
    editorPanel.appendChild(editorHeader);
    editorPanel.appendChild(editorContent);

    // 2. Steps Panel
    const stepsPanel = document.createElement('div');
    stepsPanel.className = 'tutorial-steps';
    stepsPanel.style.gridColumn = '2';
    stepsPanel.style.gridRow = '1';
    stepsPanel.style.backgroundColor = '#1e1e2e';
    stepsPanel.style.borderRadius = '6px';
    stepsPanel.style.overflow = 'auto';
    stepsPanel.style.padding = '0.5rem';

    const stepsHeader = document.createElement('h3');
    stepsHeader.className = 'tutorial-header';
    stepsHeader.textContent = 'Tutorial Steps';
    stepsHeader.style.borderBottom = '1px solid #3d3d5c';
    stepsHeader.style.padding = '0.5rem';
    stepsHeader.style.margin = '0';

    const stepsContent = document.createElement('div');
    stepsContent.className = 'tutorial-steps-content';

    // Create steps container
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    stepsContainer.style.padding = '0.5rem';

    // Get tutorial steps
    const steps = getTutorialSteps(tutorialId);

    steps.forEach((step, index) => {
      const stepElement = document.createElement('div');
      stepElement.className = 'tutorial-step';
      stepElement.style.marginBottom = '1rem';
      stepElement.style.padding = '1rem';
      stepElement.style.borderLeft = '3px solid #3d3d5c';
      stepElement.style.backgroundColor = '#2d2d4d';

      if (index === 0) {
        stepElement.classList.add('active');
        stepElement.style.borderLeft = '3px solid #bd93f9';
      }

      const titleElement = document.createElement('div');
      titleElement.className = 'step-title';
      titleElement.textContent = `Step ${index + 1}: ${step.title}`;
      titleElement.style.fontWeight = 'bold';
      titleElement.style.marginBottom = '0.5rem';

      const instructionsElement = document.createElement('div');
      instructionsElement.className = 'step-instructions';
      instructionsElement.textContent = step.instructions;
      instructionsElement.style.fontSize = '0.95em';

      stepElement.appendChild(titleElement);
      stepElement.appendChild(instructionsElement);
      stepsContainer.appendChild(stepElement);
    });

    // Create navigation controls
    const controlsContainer2 = document.createElement('div');
    controlsContainer2.className = 'tutorial-controls';
    controlsContainer2.style.display = 'flex';
    controlsContainer2.style.justifyContent = 'space-between';
    controlsContainer2.style.marginTop = '1rem';
    controlsContainer2.style.paddingTop = '1rem';
    controlsContainer2.style.borderTop = '1px solid #3d3d5c';

    const prevButton = document.createElement('button');
    prevButton.className = 'tutorial-btn';
    prevButton.textContent = 'Previous';
    prevButton.style.padding = '0.4rem 0.8rem';
    prevButton.style.backgroundColor = '#44475a';
    prevButton.style.color = 'white';
    prevButton.style.border = 'none';
    prevButton.style.borderRadius = '4px';
    prevButton.style.cursor = 'pointer';
    prevButton.disabled = true;

    const nextButton = document.createElement('button');
    nextButton.className = 'tutorial-btn';
    nextButton.textContent = 'Next';
    nextButton.style.padding = '0.4rem 0.8rem';
    nextButton.style.backgroundColor = '#bd93f9';
    nextButton.style.color = 'white';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '4px';
    nextButton.style.cursor = 'pointer';

    prevButton.addEventListener('click', () => {
      navigateStep(container, -1);
    });

    nextButton.addEventListener('click', () => {
      navigateStep(container, 1);
    });

    controlsContainer2.appendChild(prevButton);
    controlsContainer2.appendChild(nextButton);

    // Assemble steps panel
    stepsContent.appendChild(stepsContainer);
    stepsContent.appendChild(controlsContainer2);
    stepsPanel.appendChild(stepsHeader);
    stepsPanel.appendChild(stepsContent);

    // 3. Output Panel
    const outputPanel = document.createElement('div');
    outputPanel.className = 'tutorial-output';
    outputPanel.style.gridColumn = '1';
    outputPanel.style.gridRow = '2';
    outputPanel.style.backgroundColor = '#1e1e2e';
    outputPanel.style.borderRadius = '6px';
    outputPanel.style.overflow = 'auto';
    outputPanel.style.padding = '0.5rem';

    const outputHeader = document.createElement('h3');
    outputHeader.className = 'tutorial-header';
    outputHeader.textContent = 'Output';
    outputHeader.style.borderBottom = '1px solid #3d3d5c';
    outputHeader.style.padding = '0.5rem';
    outputHeader.style.margin = '0';

    const outputContent = document.createElement('div');
    outputContent.className = 'tutorial-output-content';

    const outputArea = document.createElement('div');
    outputArea.className = 'output-area';
    outputArea.textContent = 'Run your code to see output here.';
    outputArea.style.padding = '1rem';
    outputArea.style.fontFamily = 'monospace';

    outputContent.appendChild(outputArea);
    outputPanel.appendChild(outputHeader);
    outputPanel.appendChild(outputContent);

    // 4. Visualization Panel
    const visualizationPanel = document.createElement('div');
    visualizationPanel.className = 'tutorial-visualization';
    visualizationPanel.style.gridColumn = '2';
    visualizationPanel.style.gridRow = '2';
    visualizationPanel.style.backgroundColor = '#1e1e2e';
    visualizationPanel.style.borderRadius = '6px';
    visualizationPanel.style.overflow = 'auto';
    visualizationPanel.style.padding = '0.5rem';

    const visualizationHeader = document.createElement('h3');
    visualizationHeader.className = 'tutorial-header';
    visualizationHeader.textContent = 'Performance Metrics';
    visualizationHeader.style.borderBottom = '1px solid #3d3d5c';
    visualizationHeader.style.padding = '0.5rem';
    visualizationHeader.style.margin = '0';

    const visualizationContent = document.createElement('div');
    visualizationContent.className = 'tutorial-visualization-content';

    const placeholder = document.createElement('div');
    placeholder.className = 'visualization-placeholder';
    placeholder.textContent = 'Run your code to see performance metrics.';
    placeholder.style.padding = '1rem';
    placeholder.style.textAlign = 'center';

    visualizationContent.appendChild(placeholder);
    visualizationPanel.appendChild(visualizationHeader);
    visualizationPanel.appendChild(visualizationContent);

    // Assemble all panels into the container
    container.appendChild(editorPanel);
    container.appendChild(stepsPanel);
    container.appendChild(outputPanel);
    container.appendChild(visualizationPanel);

    // Save state
    container.tutorialState = {
      currentStep: 0,
      files: files,
      steps: steps
    };

    console.log('Direct tutorial initialization complete');
  });
}

// Simulate code execution
function simulateCodeExecution(container) {
  console.log('Simulating code execution');

  // Get the output panel
  const outputArea = container.querySelector('.output-area');
  const visualizationContent = container.querySelector('.tutorial-visualization-content');

  if (!outputArea || !visualizationContent) {
    console.error('Output area or visualization content not found');
    return;
  }

  // Update output
  outputArea.innerHTML = '';

  const timestamp = document.createElement('div');
  timestamp.style.float = 'right';
  timestamp.style.fontSize = '0.8em';
  timestamp.style.color = '#6272a4';
  timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;

  const outputText = document.createElement('pre');
  outputText.style.backgroundColor = '#282a36';
  outputText.style.padding = '0.75rem';
  outputText.style.borderRadius = '6px';
  outputText.style.margin = '0.5rem 0';
  outputText.style.color = '#f8f8f2';
  outputText.style.fontFamily = 'monospace';
  outputText.style.fontSize = '0.9em';
  outputText.style.whiteSpace = 'pre-wrap';
  outputText.style.maxHeight = '200px';
  outputText.style.overflow = 'auto';

  outputText.textContent = `Starting execution...\n\nPlugin initialized!\nHandling issue opened event...\n\nSuccess! The issue has been processed.\nAdded labels: enhancement\nCreated comment on issue #123`;

  outputArea.appendChild(timestamp);
  outputArea.appendChild(outputText);

  // Update visualization
  visualizationContent.innerHTML = '';

  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'metrics-container';
  metricsContainer.style.display = 'grid';
  metricsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  metricsContainer.style.gap = '1rem';
  metricsContainer.style.padding = '0.5rem';

  const metrics = [
    { title: 'Execution Time', value: '78 ms', rating: 4 },
    { title: 'Memory Usage', value: '8.2 MB', rating: 3 },
    { title: 'Bundle Size', value: '12.4 KB', rating: 4 }
  ];

  metrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.style.backgroundColor = '#282a36';
    card.style.borderRadius = '6px';
    card.style.padding = '1rem';
    card.style.textAlign = 'center';

    const title = document.createElement('div');
    title.className = 'metric-title';
    title.textContent = metric.title;
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '0.5rem';

    const value = document.createElement('div');
    value.className = 'metric-value';
    value.textContent = metric.value;
    value.style.fontSize = '1.5em';
    value.style.marginBottom = '0.5rem';
    value.style.color = '#bd93f9';

    const rating = document.createElement('div');
    rating.className = 'metric-rating';
    rating.style.display = 'flex';
    rating.style.justifyContent = 'center';
    rating.style.gap = '0.25rem';

    for (let i = 0; i < 5; i++) {
      const star = document.createElement('span');
      star.textContent = '★';
      star.style.color = i < metric.rating ? '#ffb86c' : '#6272a4';
      rating.appendChild(star);
    }

    card.appendChild(title);
    card.appendChild(value);
    card.appendChild(rating);

    metricsContainer.appendChild(card);
  });

  visualizationContent.appendChild(metricsContainer);
}

// Navigate between steps
function navigateStep(container, delta) {
  const steps = container.querySelectorAll('.tutorial-step');
  const prevButton = container.querySelector('.tutorial-controls button:first-child');
  const nextButton = container.querySelector('.tutorial-controls button:last-child');

  if (!container.tutorialState) {
    console.error('Tutorial state not found');
    return;
  }

  const currentStep = container.tutorialState.currentStep;
  const newStep = currentStep + delta;

  if (newStep < 0 || newStep >= steps.length) {
    return;
  }

  // Update active step
  steps[currentStep].classList.remove('active');
  steps[currentStep].style.borderLeft = '3px solid #3d3d5c';

  steps[newStep].classList.add('active');
  steps[newStep].style.borderLeft = '3px solid #bd93f9';

  // Update buttons
  if (prevButton && nextButton) {
    prevButton.disabled = (newStep === 0);
    nextButton.disabled = (newStep === steps.length - 1);
  }

  // Update state
  container.tutorialState.currentStep = newStep;
}

// Get tutorial files based on tutorial ID
function getTutorialFiles(tutorialId) {
  // Default files for first-plugin tutorial
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

// Get tutorial steps based on tutorial ID
function getTutorialSteps(tutorialId) {
  // Default steps for first-plugin tutorial
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
