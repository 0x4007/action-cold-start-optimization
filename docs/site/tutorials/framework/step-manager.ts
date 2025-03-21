/**
 * Step Manager - Handles the tutorial steps and navigation
 */

import { TutorialEngine } from './tutorial-engine';

export class StepManager {
  private engine: TutorialEngine;
  private container: HTMLElement | null = null;
  private stepElements: HTMLElement[] = [];
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;

  /**
   * Create a new step manager
   * @param engine The tutorial engine
   */
  constructor(engine: TutorialEngine) {
    this.engine = engine;
  }

  /**
   * Initialize the step manager
   */
  public initialize(): void {
    // Get the container element
    this.container = this.engine.getContainer().querySelector('.tutorial-steps-content');
    if (!this.container) {
      console.error('Step manager container not found');
      return;
    }

    // Get the tutorial steps
    const steps = this.engine.getTutorialSteps();
    if (steps.length === 0) {
      console.error('No steps found for tutorial');
      return;
    }

    // Create the steps
    this.createStepElements(steps);

    // Create navigation controls
    if (steps.length > 1) {
      this.createNavigationControls();
    }

    // Set the initial step
    this.updateActiveStep(0);
  }

  /**
   * Create step elements
   * @param steps The tutorial steps
   */
  private createStepElements(steps: Array<{title: string, instructions: string}>): void {
    if (!this.container) return;

    // Create container for steps
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';

    // Create each step
    steps.forEach((step, index) => {
      const stepElement = document.createElement('div');
      stepElement.className = 'tutorial-step';
      stepElement.dataset.stepIndex = index.toString();

      const titleElement = document.createElement('div');
      titleElement.className = 'step-title';
      titleElement.textContent = `Step ${index + 1}: ${step.title}`;

      const instructionsElement = document.createElement('div');
      instructionsElement.className = 'step-instructions';
      instructionsElement.textContent = step.instructions;

      stepElement.appendChild(titleElement);
      stepElement.appendChild(instructionsElement);
      stepsContainer.appendChild(stepElement);

      // Add to step elements
      this.stepElements.push(stepElement);
    });

    // Add steps container to main container
    this.container.appendChild(stepsContainer);
  }

  /**
   * Create navigation controls
   */
  private createNavigationControls(): void {
    if (!this.container) return;

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'tutorial-controls';

    // Create previous button
    this.prevButton = document.createElement('button');
    this.prevButton.className = 'tutorial-btn';
    this.prevButton.textContent = 'Previous';
    this.prevButton.disabled = true;
    this.prevButton.addEventListener('click', () => this.navigateSteps(-1));

    // Create next button
    this.nextButton = document.createElement('button');
    this.nextButton.className = 'tutorial-btn';
    this.nextButton.textContent = 'Next';
    this.nextButton.addEventListener('click', () => this.navigateSteps(1));

    // Add buttons to controls container
    controlsContainer.appendChild(this.prevButton);
    controlsContainer.appendChild(this.nextButton);

    // Add controls container to main container
    this.container.appendChild(controlsContainer);
  }

  /**
   * Navigate steps
   * @param delta The number of steps to navigate by
   */
  private navigateSteps(delta: number): void {
    const currentStep = this.engine.getCurrentStep();
    const newStep = currentStep + delta;

    if (newStep >= 0 && newStep < this.stepElements.length) {
      this.engine.setStep(newStep);
    }
  }

  /**
   * Update the active step
   * @param stepIndex The index of the active step
   */
  public updateActiveStep(stepIndex: number): void {
    if (stepIndex < 0 || stepIndex >= this.stepElements.length) return;

    // Update step elements
    this.stepElements.forEach((stepElement, index) => {
      if (index === stepIndex) {
        stepElement.classList.add('active');
      } else {
        stepElement.classList.remove('active');
      }
    });

    // Update navigation buttons
    if (this.prevButton && this.nextButton) {
      this.prevButton.disabled = stepIndex === 0;
      this.nextButton.disabled = stepIndex === this.stepElements.length - 1;
    }
  }

  /**
   * Get the number of steps
   * @returns The number of steps
   */
  public getStepCount(): number {
    return this.stepElements.length;
  }

  /**
   * Get a specific step element
   * @param index The step index
   * @returns The step element
   */
  public getStepElement(index: number): HTMLElement | null {
    if (index < 0 || index >= this.stepElements.length) return null;
    return this.stepElements[index];
  }
}
