/**
 * Tutorial Engine - Core component that initializes and manages the interactive tutorial system
 */

import { CodeEditor } from './code-editor';
import { StepManager } from './step-manager';
import { OutputViewer } from './output-viewer';
import { Visualization } from './visualization';

/**
 * Tutorial data interface
 */
export interface TutorialData {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  files: Record<string, string>;
}

/**
 * Tutorial step interface
 */
export interface TutorialStep {
  title: string;
  instructions: string;
  expectedCode?: string;
  testFunction?: (code: string) => boolean;
}

/**
 * Main tutorial engine class
 */
export class TutorialEngine {
  private container: HTMLElement;
  private tutorialId: string;
  private codeEditor: CodeEditor;
  private stepManager: StepManager;
  private outputViewer: OutputViewer;
  private visualization: Visualization;

  private data: TutorialData | null = null;
  private currentStep = 0;

  /**
   * Create a new tutorial engine
   * @param container The container element for the tutorial
   * @param tutorialId Identifier for the tutorial to load
   */
  constructor(container: HTMLElement, tutorialId: string) {
    this.container = container;
    this.tutorialId = tutorialId;

    // Create tutorial components
    this.codeEditor = new CodeEditor(this);
    this.stepManager = new StepManager(this);
    this.outputViewer = new OutputViewer(this);
    this.visualization = new Visualization(this);
  }

  /**
   * Initialize the tutorial engine
   */
  public async initialize(): Promise<void> {
    console.log(`Initializing tutorial engine for: ${this.tutorialId}`);

    try {
      // Load tutorial data
      await this.loadTutorialData();

      if (!this.data) {
        throw new Error(`Failed to load tutorial data for: ${this.tutorialId}`);
      }

      // Create DOM structure
      this.createTutorialLayout();

      // Initialize components
      this.codeEditor.initialize();
      this.stepManager.initialize();
      this.outputViewer.initialize();
      this.visualization.initialize();

      // Set initial state
      this.setStep(0);

      console.log(`Tutorial engine initialized successfully`);
    } catch (error) {
      console.error(`Error initializing tutorial engine:`, error);
      this.showError(`Failed to initialize tutorial: ${error.message}`);
    }
  }

  /**
   * Load tutorial data
   */
  private async loadTutorialData(): Promise<void> {
    // In a real implementation, this would load from an API or JSON file
    // For our standalone implementation, we'll use the hard-coded data
    const tutorialData = this.getTutorialData(this.tutorialId);

    if (tutorialData) {
      this.data = tutorialData;
    } else {
      throw new Error(`Tutorial data not found for: ${this.tutorialId}`);
    }
  }

  /**
   * Create the tutorial layout in the DOM
   */
  private createTutorialLayout(): void {
    // Create layout with the four main components
    const editorPanel = document.createElement('div');
    editorPanel.className = 'tutorial-editor';
    editorPanel.innerHTML = `<h3 class="tutorial-header">Code Editor</h3><div class="tutorial-editor-content"></div>`;

    const stepsPanel = document.createElement('div');
    stepsPanel.className = 'tutorial-steps';
    stepsPanel.innerHTML = `<h3 class="tutorial-header">Tutorial Steps</h3><div class="tutorial-steps-content"></div>`;

    const outputPanel = document.createElement('div');
    outputPanel.className = 'tutorial-output';
    outputPanel.innerHTML = `<h3 class="tutorial-header">Output</h3><div class="tutorial-output-content"></div>`;

    const visualizationPanel = document.createElement('div');
    visualizationPanel.className = 'tutorial-visualization';
    visualizationPanel.innerHTML = `<h3 class="tutorial-header">Performance Metrics</h3><div class="tutorial-visualization-content"></div>`;

    // Add panels to container
    this.container.appendChild(editorPanel);
    this.container.appendChild(stepsPanel);
    this.container.appendChild(outputPanel);
    this.container.appendChild(visualizationPanel);
  }

  /**
   * Set the current tutorial step
   * @param stepIndex The index of the step to set
   */
  public setStep(stepIndex: number): void {
    if (!this.data || stepIndex < 0 || stepIndex >= this.data.steps.length) {
      return;
    }

    this.currentStep = stepIndex;
    this.stepManager.updateActiveStep(stepIndex);
  }

  /**
   * Execute the current code and update the output and visualization
   */
  public executeCode(): void {
    if (!this.codeEditor) return;

    const code = this.codeEditor.getCurrentCode();

    // In a real implementation, we would actually execute the code
    // For this implementation, we'll simulate execution
    this.simulateExecution(code);
  }

  /**
   * Simulate code execution and update output and visualization
   * @param code The code to simulate executing
   */
  private simulateExecution(code: string): void {
    const executionTime = Math.floor(Math.random() * 100) + 50; // 50-150ms
    const memoryUsage = (Math.random() * 10 + 5).toFixed(1); // 5.0-15.0MB
    const bundleSize = (Math.random() * 20 + 10).toFixed(1); // 10.0-30.0KB

    // Generate simulated output
    const output = [
      'Starting execution...',
      '',
      'Plugin initialized!',
      `Handling ${this.tutorialId === 'event-handling' ? 'multiple events' : 'issue opened event'}...`,
      '',
      'Success! The operation completed successfully.'
    ].join('\n');

    // Set output
    this.outputViewer.setOutput(output);

    // Set visualization
    this.visualization.setMetrics({
      executionTime: `${executionTime} ms`,
      memoryUsage: `${memoryUsage} MB`,
      bundleSize: `${bundleSize} KB`
    });
  }

  /**
   * Show an error message
   * @param message The error message to show
   */
  private showError(message: string): void {
    this.container.innerHTML = `
      <div style="color: red; padding: 1rem; border: 1px solid red; margin: 1rem;">
        <h3>Error</h3>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Get the tutorial data
   */
  public getTutorialData(tutorialId: string): TutorialData {
    // Hard-coded tutorial data for the three tutorials
    const tutorials: Record<string, TutorialData> = {
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

    return tutorials[tutorialId];
  }

  // Getter methods for components
  public getContainer(): HTMLElement {
    return this.container;
  }

  public getTutorialId(): string {
    return this.tutorialId;
  }

  public getTutorialFiles(): Record<string, string> {
    return this.data?.files || {};
  }

  public getTutorialSteps(): TutorialStep[] {
    return this.data?.steps || [];
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }
}
