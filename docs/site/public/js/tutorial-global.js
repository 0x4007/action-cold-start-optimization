/**
 * Tutorial Global Script
 *
 * This script ensures proper tutorial functionality when the site is loaded.
 * It provides global access to tutorial initialization functions and handles
 * VitePress-specific functionality.
 */

// Create a global namespace for tutorial functions if they don't exist
window.TutorialFramework = window.TutorialFramework || {};

// Store references to initialization functions
window.initializeTutorialContainer = function(container) {
  console.log('Global tutorial container initialization called');

  // Create the basic layout if it doesn't exist
  if (container.children.length === 0) {
    createTutorialLayout(container);

    // Get tutorial ID
    const tutorialId = container.getAttribute('data-tutorial-id') || container.id;

    // Initialize with tutorial data
    const tutorialData = getTutorialData(tutorialId);
    if (tutorialData) {
      initializeEditor(container.querySelector('.tutorial-editor-content'), tutorialData.files);
      initializeSteps(container.querySelector('.tutorial-steps-content'), tutorialData.steps);
      initializeOutput(container.querySelector('.tutorial-output-content'));
      initializeVisualization(container.querySelector('.tutorial-visualization-content'));
    } else {
      console.error(`No tutorial data found for: ${tutorialId}`);
    }
  }
};

// Initialize on document ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Tutorial global script loaded');

  // For VitePress - watch for route changes
  const handleRouteChange = function() {
    console.log('Route change detected, reinitializing tutorials');
    setTimeout(function() {
      const containers = document.querySelectorAll('.tutorial-container');
      if (containers.length > 0) {
        console.log(`Found ${containers.length} tutorial containers after route change`);
        containers.forEach(function(container) {
          if (container.children.length === 0) {
            window.initializeTutorialContainer(container);
          }
        });
      }
    }, 100);
  };

  // VitePress specific - watch for custom events that indicate route changes
  window.addEventListener('vitepress:layout-changed', handleRouteChange);
  window.addEventListener('vitepress:page-loaded', handleRouteChange);
  window.addEventListener('vitepress:after-route-changed', handleRouteChange);

  // Also check and initialize tutorials on scroll (for lazy-loaded content)
  let scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      const containers = document.querySelectorAll('.tutorial-container');
      containers.forEach(function(container) {
        if (container.children.length === 0 && isElementInViewport(container)) {
          window.initializeTutorialContainer(container);
        }
      });
    }, 200);
  });
});

/**
 * Check if an element is in the viewport
 * @param {Element} el The element to check
 * @returns {boolean} True if element is in viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
