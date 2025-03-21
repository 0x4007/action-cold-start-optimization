/**
 * Type declarations for tutorial components
 */

interface Window {
  initializeTutorialContainer?: (container: Element) => void;
  TutorialFramework?: any;
  initializeInteractiveTutorials?: () => void;
}

// Extend global Element type to allow tutorial-specific properties
interface Element {
  style?: CSSStyleDeclaration;
  value?: string;
  readOnly?: boolean;
  disabled?: boolean;
  tutorialState?: {
    id: string;
    currentStep: number;
    files: Record<string, string>;
  };
}

// HTML-specific element extension
interface HTMLElement {
  dataset: DOMStringMap;
  value?: string;
  readOnly?: boolean;
  disabled?: boolean;
}
