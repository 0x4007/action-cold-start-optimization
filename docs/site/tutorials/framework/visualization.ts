/**
 * Visualization - Displays performance metrics
 */

import { TutorialEngine } from './tutorial-engine';

interface PerformanceMetrics {
  executionTime: string;
  memoryUsage: string;
  bundleSize: string;
}

export class Visualization {
  private engine: TutorialEngine;
  private container: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private placeholderText: HTMLElement | null = null;

  /**
   * Create a new visualization
   * @param engine The tutorial engine
   */
  constructor(engine: TutorialEngine) {
    this.engine = engine;
  }

  /**
   * Initialize the visualization
   */
  public initialize(): void {
    // Get the container element
    this.container = this.engine.getContainer().querySelector('.tutorial-visualization-content');
    if (!this.container) {
      console.error('Visualization container not found');
      return;
    }

    // Create the visualization content
    this.createVisualizationContent();
  }

  /**
   * Create the visualization content
   */
  private createVisualizationContent(): void {
    if (!this.container) return;

    // Create placeholder text
    this.placeholderText = document.createElement('div');
    this.placeholderText.className = 'visualization-placeholder';
    this.placeholderText.textContent = 'Run your code to see performance metrics.';
    this.container.appendChild(this.placeholderText);

    // Create metrics container (initially hidden)
    this.metricsContainer = document.createElement('div');
    this.metricsContainer.className = 'metrics-container';
    this.metricsContainer.style.display = 'none';
    this.container.appendChild(this.metricsContainer);
  }

  /**
   * Set the metrics
   * @param metrics The metrics to set
   */
  public setMetrics(metrics: PerformanceMetrics): void {
    if (!this.metricsContainer || !this.placeholderText) return;

    // Hide placeholder and show metrics
    this.placeholderText.style.display = 'none';
    this.metricsContainer.style.display = 'grid';

    // Clear existing metrics
    this.metricsContainer.innerHTML = '';

    // Create metrics cards
    const metrics_data = [
      { title: 'Execution Time', value: metrics.executionTime, rating: this.calculateRating(metrics.executionTime, 'time') },
      { title: 'Memory Usage', value: metrics.memoryUsage, rating: this.calculateRating(metrics.memoryUsage, 'memory') },
      { title: 'Bundle Size', value: metrics.bundleSize, rating: this.calculateRating(metrics.bundleSize, 'size') }
    ];

    // Add metric cards
    metrics_data.forEach(metric => {
      const card = this.createMetricCard(metric.title, metric.value, metric.rating);
      this.metricsContainer?.appendChild(card);
    });
  }

  /**
   * Create a metric card
   * @param title The metric title
   * @param value The metric value
   * @param rating The metric rating (1-5)
   * @returns The metric card element
   */
  private createMetricCard(title: string, value: string, rating: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'metric-card';

    const titleElement = document.createElement('div');
    titleElement.className = 'metric-title';
    titleElement.textContent = title;

    const valueElement = document.createElement('div');
    valueElement.className = 'metric-value';
    valueElement.textContent = value;

    const ratingElement = document.createElement('div');
    ratingElement.className = 'metric-rating';

    // Add rating stars
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      if (i < rating) {
        star.classList.add('filled');
      }
      star.textContent = '★';
      ratingElement.appendChild(star);
    }

    card.appendChild(titleElement);
    card.appendChild(valueElement);
    card.appendChild(ratingElement);

    return card;
  }

  /**
   * Calculate rating based on metric value
   * @param value The metric value
   * @param type The metric type
   * @returns The rating (1-5)
   */
  private calculateRating(value: string, type: 'time' | 'memory' | 'size'): number {
    // Extract numeric value
    const numericValue = parseFloat(value);

    // Default rating
    let rating = 3;

    // Calculate rating based on type
    switch (type) {
      case 'time':
        // Execution time (lower is better)
        if (value.includes('ms')) {
          if (numericValue < 50) rating = 5;
          else if (numericValue < 80) rating = 4;
          else if (numericValue < 120) rating = 3;
          else if (numericValue < 200) rating = 2;
          else rating = 1;
        }
        break;

      case 'memory':
        // Memory usage (lower is better)
        if (value.includes('MB')) {
          if (numericValue < 5) rating = 5;
          else if (numericValue < 8) rating = 4;
          else if (numericValue < 12) rating = 3;
          else if (numericValue < 20) rating = 2;
          else rating = 1;
        }
        break;

      case 'size':
        // Bundle size (lower is better)
        if (value.includes('KB')) {
          if (numericValue < 10) rating = 5;
          else if (numericValue < 15) rating = 4;
          else if (numericValue < 20) rating = 3;
          else if (numericValue < 30) rating = 2;
          else rating = 1;
        }
        break;
    }

    return rating;
  }

  /**
   * Reset the visualization
   */
  public resetVisualization(): void {
    if (!this.metricsContainer || !this.placeholderText) return;

    // Show placeholder, hide metrics
    this.placeholderText.style.display = 'block';
    this.metricsContainer.style.display = 'none';

    // Clear metrics
    this.metricsContainer.innerHTML = '';
  }
}
