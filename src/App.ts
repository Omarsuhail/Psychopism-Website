/**
 * Main Application class with improved architecture
 */

import { Component } from './core/lifecycle/Component.js';
import { eventBus } from './core/events/EventBus.js';
import { performanceMonitor } from './core/performance/PerformanceMonitor.js';
import { NodeNetworkAnimation } from './features/animations/NodeNetworkAnimation.js';
import { APP_CONFIG } from './shared/constants/app.js';
import { waitForDOMReady } from './shared/utils/dom.js';
import { AppError, ErrorCode } from './shared/errors/AppError.js';

interface AppState {
  isInitialized: boolean;
  currentSection: string;
  animationsEnabled: boolean;
  mousePosition: { x: number; y: number };
}

export class App extends Component {
  private appState: AppState = {
    isInitialized: false,
    currentSection: 'hero-header-section',
    animationsEnabled: true,
    mousePosition: { x: 0, y: 0 },
  };
  
  private nodeNetworkAnimation?: NodeNetworkAnimation;
  
  constructor() {
    super({
      name: 'PsychopismApp',
      debug: true,
      autoInit: false, // We want to control initialization
    });
  }

  /**
   * Initialize the application
   */
  public async start(): Promise<void> {
    try {
      await waitForDOMReady();
      await this.initialize();
      await this.mount();
      
      console.log('🎮 Psychopism application started successfully');
    } catch (error) {
      console.error('Failed to start application:', error);
      this.handleError(error);
    }
  }

  protected async onInit(): Promise<void> {
    this.setupGlobalEventListeners();
    this.initializePerformanceMonitoring();
    this.setupAnimations();
  }

  protected async onMount(): Promise<void> {
    // Start all components
    await this.nodeNetworkAnimation?.mount();
    
    this.markAsInitialized();
  }

  protected onActivate(): void {
    this.nodeNetworkAnimation?.activate();
    performanceMonitor.start();
  }

  protected onPause(): void {
    this.nodeNetworkAnimation?.pause();
    performanceMonitor.stop();
  }

  protected onDestroy(): void {
    this.nodeNetworkAnimation?.destroy();
    performanceMonitor.stop();
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalEventListeners(): void {
    // Mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      this.appState.mousePosition = { x: event.clientX, y: event.clientY };
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    this.addCleanup(() => document.removeEventListener('mousemove', handleMouseMove));
    
    // Visibility change handling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.activate();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.addCleanup(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
    
    // Window unload cleanup
    const handleUnload = () => {
      this.destroy();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    this.addCleanup(() => window.removeEventListener('beforeunload', handleUnload));
    
    // Global error handling
    const handleError = (event: ErrorEvent) => {
      this.handleError(new Error(event.message));
    };
    
    window.addEventListener('error', handleError);
    this.addCleanup(() => window.removeEventListener('error', handleError));
    
    // Unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      this.handleError(new Error(`Unhandled promise rejection: ${event.reason}`));
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    this.addCleanup(() => window.removeEventListener('unhandledrejection', handleUnhandledRejection));
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Listen for performance warnings
    const unsubscribe = eventBus.on('performance:warning', ({ fps, component }) => {
      console.warn(`Performance warning from ${component}: ${fps} FPS`);
      
      // Automatically reduce quality if performance is poor
      if (fps < 20 && this.appState.animationsEnabled) {
        console.log('Auto-disabling animations due to poor performance');
        this.toggleAnimations(false);
      }
    });
    
    this.addCleanup(unsubscribe);
  }

  /**
   * Setup animations
   */
  private setupAnimations(): void {
    // Initialize node network animation
    this.nodeNetworkAnimation = new NodeNetworkAnimation({
      name: 'NodeNetwork',
      debug: this.config.debug ?? false,
      nodeCount: APP_CONFIG.NODE_NETWORK.DEFAULT_NODE_COUNT,
      maxConnectionDistance: APP_CONFIG.NODE_NETWORK.MAX_CONNECTION_DISTANCE,
    });
  }

  /**
   * Toggle animations on/off
   */
  public toggleAnimations(enable?: boolean): void {
    const newState = enable ?? !this.appState.animationsEnabled;
    
    this.appState.animationsEnabled = newState;
    
    if (newState) {
      this.nodeNetworkAnimation?.activate();
    } else {
      this.nodeNetworkAnimation?.pause();
    }
    
    // Update body class for CSS
    document.body.classList.toggle('animations-disabled', !newState);
  }

  /**
   * Mark application as initialized
   */
  private markAsInitialized(): void {
    this.appState.isInitialized = true;
    
    // Dispatch custom event
    eventBus.emit('app:initialized', { timestamp: Date.now() });
    
    // Also dispatch DOM event for external listeners
    const event = new CustomEvent(APP_CONFIG.EVENTS.APP_INITIALIZED, {
      detail: { state: this.appState },
    });
    document.dispatchEvent(event);
  }

  /**
   * Handle application errors
   */
  private handleError(error: unknown): void {
    const appError = error instanceof AppError ? error : new AppError(
      ErrorCode.INITIALIZATION_FAILED,
      error instanceof Error ? error.message : 'Unknown error',
      this.config.name,
      { originalError: error }
    );
    
    console.error('Application error:', appError.toJSON());
    
    // Emit error event
    eventBus.emit('app:error', {
      error: appError,
      component: this.config.name,
    });
    
    // Show user-friendly error message
    this.showErrorMessage(appError.message);
  }

  /**
   * Show error message to user
   */
  private showErrorMessage(message: string): void {
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      z-index: 1000;
      font-family: var(--font-family-primary, monospace);
      font-size: 0.8rem;
      max-width: 300px;
    `;
    errorElement.textContent = `Error: ${message}`;
    
    document.body.appendChild(errorElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 5000);
  }

  /**
   * Get current application state
   */
  public getAppState(): Readonly<AppState> {
    return Object.freeze({ ...this.appState });
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics() {
    return {
      monitor: performanceMonitor.getMetrics(),
      nodeNetwork: this.nodeNetworkAnimation?.getMetrics(),
    };
  }

  /**
   * Get debug information
   */
  public getDebugInfo() {
    return {
      state: this.getAppState(),
      performance: this.getPerformanceMetrics(),
      componentState: this.getState(),
      eventListeners: eventBus.listenerCount('app:initialized'),
    };
  }
}

