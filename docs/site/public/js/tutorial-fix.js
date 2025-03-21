// Additional script to ensure tutorials load correctly
(function() {
  console.log("[TUTORIAL FIX] Script loaded");

  // Function to initialize tutorials
  function forceTutorialInit() {
    console.log("[TUTORIAL FIX] Force initializing tutorials");

    // Make sure tutorial container exists and is properly styled
    const containers = document.querySelectorAll('.tutorial-container');
    if (containers.length > 0) {
      containers.forEach(container => {
        console.log("[TUTORIAL FIX] Found container, ensuring styles");

        // Ensure container has proper dimensions
        container.style.height = '600px';
        container.style.display = 'grid';

        // If tutorials were already initialized but not showing
        if (container.children.length === 0 && window.initializeInteractiveTutorials) {
          console.log("[TUTORIAL FIX] Container empty, re-initializing");
          window.initializeInteractiveTutorials();
        }
      });
    } else {
      console.log("[TUTORIAL FIX] No tutorial containers found yet");
    }
  }

  // Try initialization after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceTutorialInit);
  } else {
    // DOM already loaded, run now
    forceTutorialInit();
  }

  // Try again after a short delay
  setTimeout(forceTutorialInit, 1000);

  // And again after everything is loaded
  window.addEventListener('load', function() {
    console.log("[TUTORIAL FIX] Window fully loaded, final initialization attempt");
    forceTutorialInit();

    // One more try after a second
    setTimeout(forceTutorialInit, 1000);
  });
})();
