/**
 * Navigation Component
 * Manages the scrolling navigation menu with infinite scroll animation
 */

import type { NavigationItem, ComponentEvents } from '../types/index.js';
import { DOMUtils, ErrorUtils } from '../utils/index.js';

/**
 * Navigation class handles the animated scrolling navigation
 * Features:
 * - Infinite scroll animation
 * - Smooth scrolling to sections
 * - Performance optimized animation
 * - Responsive behavior
 */
export class Navigation {
  private container: HTMLElement;
  private scrollContent: HTMLElement | null = null;
  private items: NavigationItem[];
  private events: ComponentEvents;
  private animationId: number | null = null;
  private isPaused = false;
  private isDestroyed = false;
  private cleanupFunctions: Array<() => void> = [];

  /**
   * Initialize navigation component
   */
  constructor(
    container: HTMLElement,
    items: NavigationItem[],
    events: ComponentEvents = {}
  ) {
    this.container = container;
    this.items = items;
    this.events = events;
    
    this.initialize();
  }

  /**
   * Initialize the navigation
   */
  private initialize(): void {
    if (this.isDestroyed) return;

    try {
      this.createNavigationStructure();
      this.setupEventListeners();
      this.startScrollAnimation();
      
      this.events.onMount?.();
      console.log('Navigation component initialized');
    } catch (error) {
      console.error('Failed to initialize navigation:', error);
    }
  }

  /**
   * Create the navigation DOM structure
   */
  private createNavigationStructure(): void {
    // Clear container
    this.container.innerHTML = '';
    this.container.className = 'navigation';

    // Create scroll content container
    this.scrollContent = DOMUtils.createElement('div', {
      class: 'navigation__scroll-content'
    });

    // Create navigation links (duplicate for infinite scroll)
    const linkElements = this.createNavigationLinks();
    
    // Add links twice for infinite scroll effect
    linkElements.forEach(link => {
      this.scrollContent!.appendChild(link.cloneNode(true));
    });
    linkElements.forEach(link => {
      this.scrollContent!.appendChild(link);
    });

    this.container.appendChild(this.scrollContent);
  }

  /**
   * Create individual navigation links
   */
  private createNavigationLinks(): HTMLElement[] {
    return this.items.map(item => {
      const link = DOMUtils.createElement('a', {
        href: item.href,
        class: `navigation__link ${item.isActive ? 'navigation__link--active' : ''}`,
        'data-section': item.href.replace('#', ''),
        'aria-label': `Navigate to ${item.label} section`
      }, item.label);

      return link;
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.scrollContent) return;

    // Handle navigation link clicks
    const handleLinkClick = (event: Event): void => {
      event.preventDefault();
      
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href) {
          this.navigateToSection(href);
        }
      }
    };

    this.scrollContent.addEventListener('click', handleLinkClick);
    this.cleanupFunctions.push(() => {
      this.scrollContent?.removeEventListener('click', handleLinkClick);
    });

    // Pause animation on hover
    const handleMouseEnter = (): void => {
      this.pauseAnimation();
    };

    const handleMouseLeave = (): void => {
      this.resumeAnimation();
    };

    this.container.addEventListener('mouseenter', handleMouseEnter);
    this.container.addEventListener('mouseleave', handleMouseLeave);
    
    this.cleanupFunctions.push(() => {
      this.container.removeEventListener('mouseenter', handleMouseEnter);
      this.container.removeEventListener('mouseleave', handleMouseLeave);
    });

    // Handle visibility change
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        this.pauseAnimation();
      } else {
        this.resumeAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.cleanupFunctions.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
  }

  /**
   * Navigate to a specific section
   */
  private navigateToSection(href: string): void {
    try {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        // Update active state
        this.updateActiveState(href);
        
        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } catch (error) {
      console.error('Failed to navigate to section:', error);
    }
  }

  /**
   * Update active state for navigation links
   */
  private updateActiveState(activeHref: string): void {
    if (!this.scrollContent) return;

    const links = this.scrollContent.querySelectorAll('.navigation__link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === activeHref) {
        link.classList.add('navigation__link--active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('navigation__link--active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Start the scroll animation
   */
  private startScrollAnimation(): void {
    if (this.isDestroyed || this.isPaused || !this.scrollContent) return;

    // Use CSS animation instead of JavaScript for better performance
    this.scrollContent.style.animationPlayState = 'running';
  }

  /**
   * Pause the scroll animation
   */
  public pauseAnimation(): void {
    this.isPaused = true;
    
    if (this.scrollContent) {
      this.scrollContent.style.animationPlayState = 'paused';
    }
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Resume the scroll animation
   */
  public resumeAnimation(): void {
    if (this.isDestroyed) return;
    
    this.isPaused = false;
    this.startScrollAnimation();
  }

  /**
   * Update navigation items
   */
  public updateItems(newItems: NavigationItem[]): void {
    this.items = newItems;
    
    // Clean up existing event listeners
    this.cleanupEventListeners();
    
    // Recreate structure
    this.createNavigationStructure();
    this.setupEventListeners();
    
    if (!this.isPaused) {
      this.startScrollAnimation();
    }
    
    this.events.onUpdate?.();
  }

  /**
   * Set active navigation item
   */
  public setActiveItem(href: string): void {
    this.updateActiveState(href);
  }

  /**
   * Get current navigation items
   */
  public getItems(): NavigationItem[] {
    return [...this.items];
  }

  /**
   * Check if navigation is currently paused
   */
  public isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Check if navigation is destroyed
   */
  public isNavigationDestroyed(): boolean {
    return this.isDestroyed;
  }

  /**
   * Clean up event listeners
   */
  private cleanupEventListeners(): void {
    this.cleanupFunctions.forEach(cleanup => {
      ErrorUtils.safe(cleanup, undefined, (error) => {
        console.error('Navigation cleanup error:', error);
      });
    });
    this.cleanupFunctions = [];
  }

  /**
   * Destroy the navigation component
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.pauseAnimation();
    
    // Clean up event listeners
    this.cleanupEventListeners();
    
    // Clear container
    this.container.innerHTML = '';
    this.container.className = '';
    
    this.events.onUnmount?.();
    console.log('Navigation component destroyed');
  }
}

