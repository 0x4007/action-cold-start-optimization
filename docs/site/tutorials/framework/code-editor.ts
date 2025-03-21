/**
 * Code Editor - Provides interactive editing of code files
 */

import { TutorialEngine } from './tutorial-engine';

export class CodeEditor {
  private engine: TutorialEngine;
  private container: HTMLElement | null = null;
  private tabs: HTMLElement[] = [];
  private editor: HTMLTextAreaElement | null = null;
  private currentFile: string = '';
  private fileContents: Record<string, string> = {};

  /**
   * Create a new code editor
   * @param engine The tutorial engine
   */
  constructor(engine: TutorialEngine) {
    this.engine = engine;
  }

  /**
   * Initialize the code editor
   */
  public initialize(): void {
    // Get the container element
    this.container = this.engine.getContainer().querySelector('.tutorial-editor-content');
    if (!this.container) {
      console.error('Code editor container not found');
      return;
    }

    // Get the tutorial files
    this.fileContents = { ...this.engine.getTutorialFiles() };
    const fileNames = Object.keys(this.fileContents);
    if (fileNames.length === 0) {
      console.error('No files found for tutorial');
      return;
    }

    // Set the current file
    this.currentFile = fileNames[0];

    // Create the editor content
    this.createEditorContent();
  }

  /**
   * Create the editor content
   */
  private createEditorContent(): void {
    if (!this.container) return;

    // Create file tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'editor-tabs';

    const fileNames = Object.keys(this.fileContents);
    fileNames.forEach((fileName, index) => {
      const tab = document.createElement('div');
      tab.className = 'editor-tab';
      tab.textContent = fileName;
      tab.dataset.fileName = fileName;

      if (index === 0) {
        tab.classList.add('active');
      }

      tab.addEventListener('click', () => this.switchFile(fileName));
      tabsContainer.appendChild(tab);
      this.tabs.push(tab);
    });

    // Create code textarea
    const editorArea = document.createElement('textarea');
    editorArea.className = 'editor-textarea';
    editorArea.value = this.fileContents[this.currentFile] || '';
    editorArea.addEventListener('input', (e) => this.handleEditorInput(e));
    this.editor = editorArea;

    // Create run button
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'editor-controls';

    const runButton = document.createElement('button');
    runButton.className = 'tutorial-btn';
    runButton.textContent = 'Run Code';
    runButton.addEventListener('click', () => this.runCode());

    controlsContainer.appendChild(runButton);

    // Add all elements to container
    this.container.appendChild(tabsContainer);
    this.container.appendChild(editorArea);
    this.container.appendChild(controlsContainer);
  }

  /**
   * Switch to a different file
   * @param fileName The name of the file to switch to
   */
  private switchFile(fileName: string): void {
    if (!this.editor || !this.fileContents[fileName]) return;

    // Save current file content
    this.fileContents[this.currentFile] = this.editor.value;

    // Update active tab
    this.tabs.forEach(tab => {
      if (tab.dataset.fileName === fileName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update current file and editor content
    this.currentFile = fileName;
    this.editor.value = this.fileContents[fileName];
  }

  /**
   * Handle editor input
   * @param e The input event
   */
  private handleEditorInput(e: Event): void {
    if (!this.editor) return;
    this.fileContents[this.currentFile] = this.editor.value;
  }

  /**
   * Run the code in the current file
   */
  private runCode(): void {
    this.engine.executeCode();
  }

  /**
   * Get the current code
   * @returns The current code
   */
  public getCurrentCode(): string {
    if (!this.editor) return '';
    return this.editor.value;
  }

  /**
   * Get all file contents
   * @returns The file contents
   */
  public getAllFiles(): Record<string, string> {
    // Make sure to save the current file
    if (this.editor) {
      this.fileContents[this.currentFile] = this.editor.value;
    }
    return this.fileContents;
  }

  /**
   * Get the current file name
   * @returns The current file name
   */
  public getCurrentFileName(): string {
    return this.currentFile;
  }
}
