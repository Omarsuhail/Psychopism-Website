/**
 * Main entry point for the Psychopism website
 * Initializes the application and handles global error boundaries
 */

import { App } from './components/App.js';
import { eventBus } from './core/events/EventBus.js';

/**
 * Global application instance
 */
let appInstance: App | null = null;

/**
 * Initialize the Psychopism website
 */
async function initializePsychopism(): Promise<void> {
  try {
    console.log('🎮 Initializing Psychopism website...');
    
    // Check for required browser features
    if (!checkBrowserCompatibility()) {
      showCompatibilityError();
      return;
    }

    // Create application instance
    appInstance = new App();
    
    // Start the application
    await appInstance.start();
    
    // Make app instance globally available for debugging
    if (typeof window !== 'undefined') {
      (window as any).psychopism = {
        app: appInstance,
        version: '0.3.0-dev',
        eventBus,
        debug: {
          getState: () => appInstance?.getAppState(),
          getMetrics: () => appInstance?.getPerformanceMetrics(),
          getDebugInfo: () => appInstance?.getDebugInfo(),
          destroy: () => appInstance?.destroy()
        }
      };
    }
    
    // Setup app event listeners
    eventBus.on('app:initialized', () => {
      console.log('🚀 Psychopism website fully loaded and ready');
    });
    
    eventBus.on('app:error', ({ error, component }) => {
      console.error(`❌ Error in ${component}:`, error);
    });

    console.log('🎮 Psychopism website initialization started');
  } catch (error) {
    console.error('🚨 Failed to initialize Psychopism:', error);
    handleGlobalError(error);
  }
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility(): boolean {
  const requiredFeatures = [
    'Promise',
    'fetch',
    'requestAnimationFrame',
    'addEventListener',
    'querySelector',
    'getContext'
  ];

  const missingFeatures = requiredFeatures.filter(feature => {
    switch (feature) {
      case 'Promise':
        return typeof Promise === 'undefined';
      case 'fetch':
        return typeof fetch === 'undefined';
      case 'requestAnimationFrame':
        return typeof requestAnimationFrame === 'undefined';
      case 'addEventListener':
        return typeof addEventListener === 'undefined';
      case 'querySelector':
        return typeof document.querySelector === 'undefined';
      case 'getContext':
        const testCanvas = document.createElement('canvas');
        return !testCanvas.getContext;
      default:
        return false;
    }
  });

  if (missingFeatures.length > 0) {
    console.error('Missing browser features:', missingFeatures);
    return false;
  }

  return true;
}

/**
 * Show browser compatibility error
 */
function showCompatibilityError(): void {
  const errorHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a1a;
      color: #fff;
      padding: 2rem;
      border: 2px solid #fff;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.8rem;
      text-align: center;
      z-index: 10000;
      max-width: 90%;
      line-height: 1.6;
    ">
      <h1 style="margin-bottom: 1rem; color: #fff;">BROWSER NOT COMPATIBLE</h1>
      <p style="margin-bottom: 1rem;">Your browser lacks features required for Psychopism.</p>
      <p style="font-size: 0.7rem; color: #ccc;">Please update your browser or use a modern alternative.</p>
    </div>
  `;
  
  document.body.innerHTML = errorHTML;
}

/**
 * Handle global application errors
 */
function handleGlobalError(error: unknown): void {
  console.error('🚨 Global error in Psychopism:', error);
  
  // Show user-friendly error message
  const errorElement = document.createElement('div');
  errorElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 1rem;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 0.9rem;
    z-index: 10000;
    max-width: 300px;
  `;
  errorElement.textContent = 'Psychopism encountered an error. Please refresh the page.';
  
  document.body.appendChild(errorElement);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.parentNode.removeChild(errorElement);
    }
  }, 10000);
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers(): void {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    handleGlobalError(event.error || event.message);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleGlobalError(event.reason);
    event.preventDefault(); // Prevent default browser error handling
  });
}

/**
 * Cleanup function for page unload
 */
function cleanup(): void {
  if (appInstance) {
    appInstance.destroy();
    appInstance = null;
  }
}

/**
 * Main initialization sequence
 */
function main(): void {
  // Setup error handlers first
  setupGlobalErrorHandlers();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePsychopism().catch(error => {
        console.error('Failed to initialize:', error);
        handleGlobalError(error);
      });
    });
  } else {
    // DOM is already ready
    initializePsychopism().catch(error => {
      console.error('Failed to initialize:', error);
      handleGlobalError(error);
    });
  }
  
  // Setup cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
}

// Start the application
main();

// Export for module systems
export { App } from './components/App.js';
export default {
  init: initializePsychopism,
  cleanup,
  getApp: () => appInstance
};

