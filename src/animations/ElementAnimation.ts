/**
 * Element Animation Component
 * Manages reveal animations for page elements with noise overlay effects
 */

import type {
  HTMLElementWithDataset,
  ComponentEvents,
  AnimationCallback
} from '../types/index.js';
import { DOMUtils, AnimationUtils, TextUtils, ColorUtils, MathUtils } from '../utils/index.js';

export interface ElementAnimationConfig {
  readonly duration: number;
  readonly noiseChars: string;
  readonly minNoiseChars: number;
  readonly maxNoiseChars: number;
  readonly revealSpeed: number;
  readonly noiseUpdateInterval: number;
}

/**
 * Individual noise particle for element animation
 */
interface NoiseParticle {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly char: string;
  readonly color: string;
  readonly opacity: number;
  readonly scale: number;
  readonly animationDelay: number;
}

/**
 * ElementAnimation class manages reveal animations for page elements
 * Features:
 * - Element reveal with noise overlay
 * - Intersection Observer for scroll-triggered animations
 * - Performance optimized with proper cleanup
 */
export class ElementAnimation {
  private readonly config: ElementAnimationConfig;
  private readonly events: ComponentEvents;
  private activeAnimations = new Map<HTMLElement, number>();
  private noiseOverlays = new Map<HTMLElement, HTMLElement>();
  private isDestroyed = false;
  private observer: IntersectionObserver | undefined;

  /**
   * Initialize element animation system
   */
  constructor(
    config: ElementAnimationConfig,
    events: ComponentEvents = {}
  ) {
    this.config = config;
    this.events = events;
  }

  /**
   * Animate element reveal with noise overlay
   */
  public animateElementReveal(
    element: HTMLElementWithDataset,
    duration: number = this.config.duration
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isDestroyed) {
        resolve();
        return;
      }

      // Create noise overlay
      const noiseOverlay = this.createNoiseOverlay(element);
      this.noiseOverlays.set(element, noiseOverlay);
      
      // Start noise animation
      let startTime: number | null = null;
      const particles = this.generateNoiseParticles(element);
      
      const animate: AnimationCallback = (currentTime: number): void => {
        if (this.isDestroyed) {
          resolve();
          return;
        }

        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Update noise overlay
        this.updateNoiseOverlay(noiseOverlay, particles, progress);

        // Gradually reveal the actual element
        const revealProgress = AnimationUtils.easing.easeOutCubic(progress);
        element.style.opacity = revealProgress < 0.5 ? '0' : revealProgress.toString();
        
        if (progress >= 0.5) {
          element.style.visibility = 'visible';
        }

        if (progress < 1) {
          const frameId = AnimationUtils.requestAnimationFrame(animate);
          this.activeAnimations.set(element, frameId);
        } else {
          // Animation complete - restore original state and cleanup
          element.style.opacity = '1';
          element.style.visibility = 'visible';
          element.classList.add('element-reveal-complete');
          this.cleanupNoiseOverlay(element);
          this.activeAnimations.delete(element);
          resolve();
        }
      };

      const frameId = AnimationUtils.requestAnimationFrame(animate);
      this.activeAnimations.set(element, frameId);
    });
  }

  /**
   * Create noise overlay element that covers the target element
   */
  private createNoiseOverlay(targetElement: HTMLElement): HTMLElement {
    const overlay = DOMUtils.createElement('div', {
      class: 'element-noise-overlay'
    });

    // Position overlay over target element
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    overlay.style.cssText = `
      position: absolute;
      top: ${rect.top + scrollTop}px;
      left: ${rect.left + scrollLeft}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 10000;
      overflow: hidden;
      font-family: var(--font-family-primary, 'Press Start 2P', monospace);
      font-size: var(--font-size-sm, 12px);
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  /**
   * Generate noise particles for the element area
   */
  private generateNoiseParticles(element: HTMLElement): NoiseParticle[] {
    const rect = element.getBoundingClientRect();
    const particleCount = Math.floor(
      (rect.width * rect.height) / 
      MathUtils.randomIntBetween(this.config.minNoiseChars, this.config.maxNoiseChars)
    );
    
    const particles: NoiseParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: `particle-${i}`,
        x: MathUtils.randomBetween(0, rect.width),
        y: MathUtils.randomBetween(0, rect.height),
        char: TextUtils.randomNoiseChar(),
        color: ColorUtils.rgbToString(ColorUtils.randomRGB()),
        opacity: MathUtils.randomBetween(0.3, 1),
        scale: MathUtils.randomBetween(0.5, 1.5),
        animationDelay: MathUtils.randomBetween(0, 1000)
      });
    }

    return particles;
  }

  /**
   * Update noise overlay with animated particles
   */
  private updateNoiseOverlay(
    overlay: HTMLElement, 
    particles: NoiseParticle[], 
    progress: number
  ): void {
    // Clear existing content
    overlay.innerHTML = '';
    
    // Calculate how many particles should still be visible
    const visibleCount = Math.floor(particles.length * (1 - progress));
    
    // Randomly select which particles to show
    const shuffledParticles = [...particles].sort(() => Math.random() - 0.5);
    const visibleParticles = shuffledParticles.slice(0, visibleCount);
    
    // Create DOM elements for visible particles
    visibleParticles.forEach(particle => {
      const particleElement = DOMUtils.createElement('span', {
        class: 'noise-particle'
      }, particle.char);
      
      particleElement.style.cssText = `
        position: absolute;
        left: ${particle.x}px;
        top: ${particle.y}px;
        color: ${particle.color};
        opacity: ${particle.opacity * (1 - progress)};
        transform: scale(${particle.scale});
        pointer-events: none;
        white-space: nowrap;
        transition: opacity 0.1s ease-out;
      `;
      
      overlay.appendChild(particleElement);
    });
  }

  /**
   * Clean up noise overlay
   */
  private cleanupNoiseOverlay(element: HTMLElement): void {
    const overlay = this.noiseOverlays.get(element);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    this.noiseOverlays.delete(element);
  }

  /**
   * Setup intersection observer for scroll-triggered animations
   */
  public setupScrollRevealObserver(
    elements: HTMLElementWithDataset[],
    options: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    }
  ): IntersectionObserver | null {
    if (this.isDestroyed || !('IntersectionObserver' in window)) {
      return null;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElementWithDataset;
          
          // Add staggered delay based on element position
          const delay = Math.random() * 500;
          
          setTimeout(() => {
            this.animateElementReveal(element, this.config.duration)
              .then(() => {
                this.observer?.unobserve(element);
              })
              .catch(error => {
                console.error('Element reveal animation failed:', error);
                this.observer?.unobserve(element);
              });
          }, delay);
        }
      });
    }, options);

    // Observe all elements
    elements.forEach(element => {
      if (element.dataset['animationPrepared']) {
        this.observer?.observe(element);
      }
    });

    return this.observer;
  }

  /**
   * Prepare elements for animation by hiding them initially
   */
  public prepareElementsForAnimation(selectors: string[]): HTMLElementWithDataset[] {
    const elements: HTMLElementWithDataset[] = [];
    
    selectors.forEach(selector => {
      const nodeList = DOMUtils.querySelectorAll<HTMLElementWithDataset>(selector);
      nodeList.forEach(element => {
        if (element) {
          // Mark element as prepared and hide it
          element.dataset['animationPrepared'] = 'true';
          element.style.opacity = '0';
          element.style.visibility = 'hidden';
          elements.push(element);
        }
      });
    });

    return elements;
  }

  /**
   * Animate multiple elements in sequence
   */
  public async animateElementsSequence(
    elements: HTMLElementWithDataset[],
    delayBetween: number = 200
  ): Promise<void> {
    for (let i = 0; i < elements.length; i++) {
      if (this.isDestroyed) break;
      
      const element = elements[i];
      if (element) {
        await this.animateElementReveal(element);
        
        // Wait before animating next element
        if (i < elements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetween));
        }
      }
    }
  }

  /**
   * Animate elements in parallel with staggered start times
   */
  public animateElementsStaggered(
    elements: HTMLElementWithDataset[],
    staggerDelay: number = 100
  ): Promise<void[]> {
    const promises = elements.map((element, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (!this.isDestroyed) {
            this.animateElementReveal(element).then(resolve);
          } else {
            resolve();
          }
        }, index * staggerDelay);
      });
    });

    return Promise.all(promises);
  }

  /**
   * Stop specific element animation
   */
  public stopAnimation(element: HTMLElement): void {
    const frameId = this.activeAnimations.get(element);
    if (frameId) {
      AnimationUtils.cancelAnimationFrame(frameId);
      this.activeAnimations.delete(element);
    }
    
    // Clean up overlay if exists
    this.cleanupNoiseOverlay(element);
    
    // Restore element visibility
    element.style.opacity = '1';
    element.style.visibility = 'visible';
  }

  /**
   * Get active animations count (for debugging)
   */
  public getActiveAnimationsCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * Get configuration
   */
  public getConfig(): ElementAnimationConfig {
    return { ...this.config };
  }

  /**
   * Clean up all animations and resources
   */
  public destroy(): void {
    this.isDestroyed = true;
    
    // Cancel all active animations
    this.activeAnimations.forEach((frameId) => {
      AnimationUtils.cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();
    
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined as IntersectionObserver | undefined;
    }
    
    // Clean up all noise overlays
    this.noiseOverlays.forEach((overlay) => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    this.noiseOverlays.clear();

    this.events.onUnmount?.();
  }
}

