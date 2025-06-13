/**
 * Text Animation Component
 * Manages noise reveal animations and character hover effects
 */

import type {
  TextAnimationConfig,
  HTMLElementWithDataset,
  ComponentEvents,
  AnimationCallback
} from '../types/index.js';
import { TextUtils, ColorUtils, AnimationUtils, DOMUtils } from '../utils/index.js';

/**
 * TextAnimation class manages various text effects
 * Features:
 * - Noise reveal animation (scrambled text that reveals gradually)
 * - Character hover effects with noise
 * - Intersection Observer for scroll-triggered animations
 * - Performance optimized with proper cleanup
 */
export class TextAnimation {
  private readonly config: TextAnimationConfig;
  private readonly events: ComponentEvents;
  private activeAnimations = new Map<HTMLElement, number>();
  private isDestroyed = false;

  /**
   * Initialize text animation system
   */
  constructor(
    config: TextAnimationConfig,
    events: ComponentEvents = {}
  ) {
    this.config = config;
    this.events = events;
  }

  /**
   * Animate text appearance from noise to final text
   */
  public animateNoiseReveal(
    element: HTMLElementWithDataset,
    originalText: string,
    duration: number = this.config.duration,
    finalColor: string = this.config.finalColor
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isDestroyed) {
        resolve();
        return;
      }

      let startTime: number | null = null;
      const revealedCharacters = new Array<string | null>(originalText.length).fill(null);

      const animate: AnimationCallback = (currentTime: number): void => {
        if (this.isDestroyed) {
          resolve();
          return;
        }

        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const targetRevealedCount = Math.floor(originalText.length * progress);
        let currentRevealedCount = revealedCharacters.filter(c => c !== null).length;

        // Reveal more characters randomly
        while (currentRevealedCount < targetRevealedCount) {
          const randomIndex = Math.floor(Math.random() * originalText.length);
          if (revealedCharacters[randomIndex] === null) {
            const char = originalText[randomIndex];
            if (char !== undefined) {
              revealedCharacters[randomIndex] = char;
              currentRevealedCount++;
            }
          }
        }

        // Build HTML content with revealed and noise characters
        let htmlContent = '';
        for (let i = 0; i < originalText.length; i++) {
          if (revealedCharacters[i] !== null) {
            const char = originalText[i];
            if (char !== undefined) {
              htmlContent += `<span style="color: ${finalColor};">${TextUtils.escapeHTML(char)}</span>`;
            }
          } else {
            const noiseColor = ColorUtils.rgbToString(ColorUtils.randomRGB());
            const noiseChar = TextUtils.randomNoiseChar();
            htmlContent += `<span style="color: ${noiseColor};">${TextUtils.escapeHTML(noiseChar)}</span>`;
          }
        }

        element.innerHTML = htmlContent;

        if (progress < 1) {
          const frameId = AnimationUtils.requestAnimationFrame(animate);
          this.activeAnimations.set(element, frameId);
        } else {
          // Restore original text for proper text wrapping
          element.textContent = originalText;
          this.activeAnimations.delete(element);
          resolve();
        }
      };

      const frameId = AnimationUtils.requestAnimationFrame(animate);
      this.activeAnimations.set(element, frameId);
    });
  }

  /**
   * Apply noise effect to a single character for a duration
   */
  public applyCharacterNoiseEffect(
    charElement: HTMLElement,
    originalChar: string,
    duration: number = 200
  ): void {
    if (this.isDestroyed) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animateNoise: AnimationCallback = (currentTime: number): void => {
      if (this.isDestroyed) return;

      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;

      if (elapsed < duration) {
        const noiseColor = ColorUtils.rgbToString(ColorUtils.randomRGB());
        const noiseChar = TextUtils.randomNoiseChar();
        
        charElement.style.color = noiseColor;
        charElement.textContent = noiseChar;
        
        animationFrameId = AnimationUtils.requestAnimationFrame(animateNoise);
      } else {
        // Restore original character and color
        charElement.style.color = this.config.finalColor;
        charElement.textContent = originalChar;
      }
    };

    // Clear any existing animation
    const existingFrameId = this.activeAnimations.get(charElement);
    if (existingFrameId) {
      AnimationUtils.cancelAnimationFrame(existingFrameId);
    }

    animationFrameId = AnimationUtils.requestAnimationFrame(animateNoise);
    this.activeAnimations.set(charElement, animationFrameId);
  }

  /**
   * Scramble text initially and save original content
   */
  public scrambleText(element: HTMLElementWithDataset): void {
    if (this.isDestroyed) return;

    const originalText = element.textContent || '';
    element.dataset.originalText = originalText;
    
    const scrambledText = TextUtils.generateNoiseString(originalText.length);
    element.textContent = scrambledText;
  }

  /**
   * Wrap each character in a span for individual hover effects
   */
  public wrapCharactersForHover(
    element: HTMLElement,
    onCharacterHover?: (char: HTMLElement, originalChar: string) => void,
    onCharacterLeave?: (char: HTMLElement, originalChar: string) => void
  ): void {
    if (this.isDestroyed) return;

    const originalText = element.textContent || '';
    const charSpans = originalText
      .split('')
      .map(char => {
        const span = DOMUtils.createElement('span', { class: 'char' }, char);
        
        if (onCharacterHover) {
          span.addEventListener('mouseover', () => onCharacterHover(span, char));
        }
        
        if (onCharacterLeave) {
          span.addEventListener('mouseout', () => onCharacterLeave(span, char));
        }
        
        return span;
      });

    element.innerHTML = '';
    charSpans.forEach(span => element.appendChild(span));
  }

  /**
   * Setup intersection observer for scroll-triggered animations
   */
  public setupScrollRevealObserver(
    elements: HTMLElementWithDataset[],
    options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    }
  ): IntersectionObserver | null {
    if (this.isDestroyed || !('IntersectionObserver' in window)) {
      return null;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElementWithDataset;
          const originalText = element.dataset.originalText;
          
          if (originalText && element.tagName !== 'IMG') {
            this.animateNoiseReveal(element, originalText, this.config.duration)
              .then(() => {
                observer.unobserve(element);
              })
              .catch(error => {
                console.error('Text reveal animation failed:', error);
                observer.unobserve(element);
              });
          }
        }
      });
    }, options);

    // Observe all elements
    elements.forEach(element => {
      if (element.dataset.originalText) {
        observer.observe(element);
      }
    });

    return observer;
  }

  /**
   * Create hover effects for title characters
   */
  public setupTitleHoverEffects(titleElement: HTMLElement): void {
    if (this.isDestroyed) return;

    this.wrapCharactersForHover(
      titleElement,
      (charSpan, originalChar) => {
        this.applyCharacterNoiseEffect(charSpan, originalChar, 300);
      },
      (charSpan, originalChar) => {
        // Stop any ongoing animation
        const frameId = this.activeAnimations.get(charSpan);
        if (frameId) {
          AnimationUtils.cancelAnimationFrame(frameId);
          this.activeAnimations.delete(charSpan);
        }
        
        // Restore original state
        charSpan.style.color = this.config.finalColor;
        charSpan.textContent = originalChar;
      }
    );
  }

  /**
   * Batch process elements for scroll reveal
   */
  public prepareElementsForScrollReveal(selectors: string[]): HTMLElementWithDataset[] {
    const elements: HTMLElementWithDataset[] = [];
    
    selectors.forEach(selector => {
      const nodeList = DOMUtils.querySelectorAll<HTMLElementWithDataset>(selector);
      nodeList.forEach(element => {
        if (element && element.textContent) {
          this.scrambleText(element);
          elements.push(element);
        }
      });
    });

    return elements;
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
  public getConfig(): TextAnimationConfig {
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

    this.events.onUnmount?.();
  }
}

