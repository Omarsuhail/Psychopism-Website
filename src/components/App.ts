/**
 * Main Application Component
 * Orchestrates all website components and manages application lifecycle
 */

import type { AppState, HTMLElementWithDataset } from '../types/index.js';
import { DOMUtils, ErrorUtils } from '../utils/index.js';
import { TextAnimation, ElementAnimation } from '../animations/index.js';
import { Navigation } from './Navigation.js';
import {
  navigationItems,
  textAnimationConfig,
  elementAnimationConfig
} from '../data/index.js';

/**
 * Main Application class
 * Features:
 * - Component lifecycle management
 * - Error handling and recovery
 * - Performance monitoring
 * - Responsive behavior
 * - Accessibility support
 */
export class App {
  private state: AppState = {
    isInitialized: false,
    currentSection: 'hero-header-section',
    animationsEnabled: true,
    mousePosition: { x: 0, y: 0 }
  };

  // Component instances
  private textAnimation: TextAnimation | null = null;
  private elementAnimation: ElementAnimation | null = null;
  private navigation: Navigation | null = null;

  // DOM elements
  private navigationContainer: HTMLElement | null = null;

  // Cleanup functions
  private cleanupFunctions: Array<() => void> = [];
  private isDestroyed = false;

  /**
   * Initialize the application
   */
  constructor() {
    // Don't auto-initialize in constructor to allow controlled startup
  }

  /**
   * Start the application
   */
  public async start(): Promise<void> {
    await this.initialize();
  }

  /**
   * Initialize all application components
   */
  private async initialize(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise<void>(resolve => {
          document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
        });
      }

      this.setupCanvas();
      this.setupComponents();
      this.setupEventListeners();
      this.setupTextAnimations();
      this.setupElementAnimations();
      this.markAsInitialized();

      console.log('Psychopism website initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Setup canvas for background
   */
  private setupCanvas(): void {
    // Canvas setup removed - no longer used
  }

  /**
   * Setup UI components
   */
  private setupComponents(): void {
    // Setup navigation
    this.navigationContainer = DOMUtils.querySelector('header nav');
    if (this.navigationContainer) {
      this.navigation = new Navigation(
        this.navigationContainer,
        [...navigationItems], // Convert readonly array to mutable array
        {
          onMount: () => console.log('Navigation mounted'),
          onUnmount: () => console.log('Navigation unmounted')
        }
      );
    }

  }

  /**
   * Setup text animations
   */
  private setupTextAnimations(): void {
    this.textAnimation = new TextAnimation(
      textAnimationConfig,
      {
        onMount: () => console.log('Text animation mounted'),
        onUnmount: () => console.log('Text animation unmounted')
      }
    );

    // Setup title hover effects and initial animations
    const headerTitle = DOMUtils.querySelector<HTMLElement>('#header-title');
    const heroTitle = DOMUtils.querySelector<HTMLElement>('#hero-title');

    if (headerTitle && headerTitle.textContent) {
      // First animate the noise reveal, then setup hover effects
      this.textAnimation.animateNoiseReveal(
        headerTitle as any,
        headerTitle.textContent,
        2000 // 2 second reveal animation
      ).then(() => {
        if (this.textAnimation) {
          this.textAnimation.setupTitleHoverEffects(headerTitle);
        }
      });
    }

    if (heroTitle && heroTitle.textContent) {
      // Stagger the hero title animation slightly
      setTimeout(() => {
        if (heroTitle.textContent && this.textAnimation) {
          this.textAnimation.animateNoiseReveal(
            heroTitle as any,
            heroTitle.textContent,
            2500 // 2.5 second reveal animation
          ).then(() => {
            if (this.textAnimation) {
              this.textAnimation.setupTitleHoverEffects(heroTitle);
            }
          });
        }
      }, 500); // 500ms delay after header title starts
    }

    // Setup hero description animation with delay
    const heroDescription = DOMUtils.querySelector('#hero-description');
    if (heroDescription && heroDescription.textContent) {
      setTimeout(() => {
        if (heroDescription.textContent && this.textAnimation) {
          this.textAnimation.animateNoiseReveal(
            heroDescription as any,
            heroDescription.textContent,
            3000
          );
        }
      }, 1000); // 1 second delay after titles
    }

    // Setup scroll-triggered animations
    this.setupScrollAnimations();
  }

  /**
   * Setup element animations for page components
   */
  private setupElementAnimations(): void {
    this.elementAnimation = new ElementAnimation(
      elementAnimationConfig,
      {
        onMount: () => console.log('Element animation mounted'),
        onUnmount: () => console.log('Element animation unmounted')
      }
    );

    // Setup element animations for page sections and frames
    this.setupPageElementAnimations();
  }

  /**
   * Setup animations for page elements (sections, frames, etc.)
   */
  private setupPageElementAnimations(): void {
    if (!this.elementAnimation) return;

    // Define selectors for elements that should be animated
    const elementSelectors = [
      '.container.section',
      '.hero',
      '.header',
      '.footer',
      '.system-requirements',
      '.feature',
      '.blog-post',
      '.faq-item',
      '.contact-info',
      '.cta__contribution'
    ];

    // Prepare elements for animation
    const elements = this.elementAnimation.prepareElementsForAnimation(elementSelectors);
    
    // Setup scroll-triggered animations with staggered effect
    const observer = this.elementAnimation.setupScrollRevealObserver(elements, {
      root: null,
      rootMargin: '10px',
      threshold: 0.1
    });

    if (observer) {
      this.cleanupFunctions.push(() => observer.disconnect());
    }

    // Animate hero section immediately
    const heroSection = DOMUtils.querySelector<HTMLElementWithDataset>('.hero');
    if (heroSection && this.elementAnimation) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        if (this.elementAnimation && heroSection) {
          this.elementAnimation.animateElementReveal(heroSection, 3000);
        }
      }, 500);
    }
  }

  /**
   * Setup scroll-triggered text animations
   */
  private setupScrollAnimations(): void {
    if (!this.textAnimation) return;

    const selectors = [
      '#how-it-works-section p',
      '#feature-section p',
      '#features-list-section .list-item p',
      '#cta-section p',
      '#blog-list-section .list-item p',
      '#system-requirements-section .system-requirements__list li',
      '#faq-section p',
      '#contact-section p'
    ];

    const elements = this.textAnimation.prepareElementsForScrollReveal(selectors);
    const observer = this.textAnimation.setupScrollRevealObserver(elements);

    if (observer) {
      this.cleanupFunctions.push(() => observer.disconnect());
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Button event listeners
    this.setupButtonEventListeners();

    // Performance monitoring
    this.setupPerformanceMonitoring();

    // Visibility change handling
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.cleanupFunctions.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    // Window unload cleanup
    const handleUnload = (): void => {
      this.destroy();
    };

    window.addEventListener('beforeunload', handleUnload);
    this.cleanupFunctions.push(() => {
      window.removeEventListener('beforeunload', handleUnload);
    });
  }

  /**
   * Setup button event listeners
   */
  private setupButtonEventListeners(): void {
    // Hero section buttons
    const downloadButtons = DOMUtils.querySelectorAll('.btn');
    
    downloadButtons.forEach(button => {
      const cleanup = DOMUtils.addEventListenerWithCleanup(
        button as HTMLElement,
        'click',
        (event) => this.handleButtonClick(event)
      );
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Handle button clicks
   */
  private handleButtonClick(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const buttonText = button.textContent?.trim();


    switch (buttonText) {
      case 'Download Game':
      case 'Download Now':
        console.log('Download game clicked');
        // TODO: Implement download logic
        break;
      case 'Contribute':
      case 'Learn More About Contributing':
        console.log('Contribute clicked');
        // TODO: Implement contribute logic
        break;
      case 'Join the Community':
        console.log('Join community clicked');
        // TODO: Implement community join logic
        break;
      case 'Page Settings':
        console.log('Page Settings clicked');
        // Settings functionality is handled by global.js
        break;
      default:
        console.log(`Button clicked: ${buttonText}`);
    }
  }


  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = (): void => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Disable animations if performance is poor
        if (fps < 30 && this.state.animationsEnabled) {
          console.warn('Low FPS detected, considering disabling animations');
          // Could implement adaptive quality here
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (!this.isDestroyed) {
        requestAnimationFrame(checkPerformance);
      }
    };

    requestAnimationFrame(checkPerformance);
  }

  /**
   * Pause all animations
   */
  private pauseAnimations(): void {
    this.navigation?.pauseAnimation();
    // Element animations don't need pausing as they're typically one-time reveals
  }

  /**
   * Resume all animations
   */
  private resumeAnimations(): void {
    this.navigation?.resumeAnimation();
    // Element animations don't need resuming as they're typically one-time reveals
  }

  /**
   * Mark application as initialized
   */
  private markAsInitialized(): void {
    this.state = {
      ...this.state,
      isInitialized: true
    };

    // Dispatch custom event for external listeners
    const event = new CustomEvent('psychopism:initialized', {
      detail: { state: this.state }
    });
    document.dispatchEvent(event);
  }

  /**
   * Handle initialization errors
   */
  private handleInitializationError(error: unknown): void {
    console.error('Application initialization failed:', error);
    
    // Show user-friendly error message
    const errorElement = DOMUtils.createElement('div', {
      class: 'error-message',
      style: 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 1rem; border-radius: 4px; z-index: 1000;'
    }, 'Failed to load Psychopism. Please refresh the page.');
    
    document.body.appendChild(errorElement);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 5000);
  }

  /**
   * Get current application state
   */
  public getState(): AppState {
    return { ...this.state };
  }

  /**
   * Get current application state (alias for compatibility)
   */
  public getAppState(): AppState {
    return this.getState();
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): any {
    return {
      textAnimation: this.textAnimation?.getActiveAnimationsCount(),
      elementAnimation: this.elementAnimation?.getActiveAnimationsCount(),
      navigation: this.navigation ? 'active' : 'inactive'
    };
  }

  /**
   * Get debug information
   */
  public getDebugInfo(): any {
    return {
      state: this.getState(),
      components: this.getComponents(),
      performance: this.getPerformanceMetrics(),
      isDestroyed: this.isDestroyed,
      cleanupFunctionsCount: this.cleanupFunctions.length
    };
  }

  /**
   * Get component instances (for debugging)
   */
  public getComponents(): {
    textAnimation: TextAnimation | null;
    elementAnimation: ElementAnimation | null;
    navigation: Navigation | null;
  } {
    return {
      textAnimation: this.textAnimation,
      elementAnimation: this.elementAnimation,
      navigation: this.navigation
    };
  }

  /**
   * Destroy the application and clean up resources
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Destroy components
    this.textAnimation?.destroy();
    this.elementAnimation?.destroy();
    this.navigation?.destroy();
    
    // Run cleanup functions
    this.cleanupFunctions.forEach(cleanup => {
      ErrorUtils.safe(cleanup, undefined, (error) => {
        console.error('Cleanup error:', error);
      });
    });
    this.cleanupFunctions = [];
    
    console.log('Psychopism application destroyed');
  }
}

