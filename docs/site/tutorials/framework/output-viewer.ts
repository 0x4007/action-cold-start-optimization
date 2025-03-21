/**
 * Output Viewer - Displays execution output
 */

import { TutorialEngine } from './tutorial-engine';

export class OutputViewer {
  private engine: TutorialEngine;
  private container: HTMLElement | null = null;
  private outputArea: HTMLElement | null = null;

  /**
   * Create a new output viewer
   * @param engine The tutorial engine
   */
  constructor(engine: TutorialEngine) {
    this.engine = engine;
  }

  /**
   * Initialize the output viewer
   */
  public initialize(): void {
    // Get the container element
    this.container = this.engine.getContainer().querySelector('.tutorial-output-content');
    if (!this.container) {
      console.error('Output viewer container not found');
      return;
    }

    // Create the output area
    this.createOutputArea();
  }

  /**
   * Create the output area
   */
  private createOutputArea(): void {
    if (!this.container) return;

    // Create output area
    const outputArea = document.createElement('div');
    outputArea.className = 'output-area';
    outputArea.textContent = 'Run your code to see output here.';

    // Store reference to output area
    this.outputArea = outputArea;

    // Add to container
    this.container.appendChild(outputArea);
  }

  /**
   * Set the output
   * @param output The output to set
   */
  public setOutput(output: string): void {
    if (!this.outputArea) return;

    // Clear existing content
    this.outputArea.innerHTML = '';

    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'output-timestamp';
    timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;

    // Add output text
    const outputText = document.createElement('pre');
    outputText.className = 'output-content';
    outputText.textContent = output;

    // Add elements to output area
    this.outputArea.appendChild(timestamp);
    this.outputArea.appendChild(outputText);
  }

  /**
   * Clear the output
   */
  public clearOutput(): void {
    if (!this.outputArea) return;
    this.outputArea.textContent = 'Run your code to see output here.';
  }

  /**
   * Append to the output
   * @param text The text to append
   */
  public appendOutput(text: string): void {
    if (!this.outputArea) return;

    // Get existing output content element
    const outputContent = this.outputArea.querySelector('.output-content');

    if (outputContent) {
      // Append to existing content
      outputContent.textContent += '\n' + text;
    } else {
      // No existing content, set output
      this.setOutput(text);
    }
  }
}
