/**
 * Comprehensive utility functions for the Psychopism website
 * Provides reusable helper functions with proper error handling
 */

import type { Position, RGBColor } from '../types/index.js';

/**
 * DOM utility functions
 */
export class DOMUtils {
  /**
   * Safely query a single element with type checking
   */
  static querySelector<T extends Element = Element>(
    selector: string,
    parent: Document | Element = document
  ): T | null {
    try {
      return parent.querySelector<T>(selector);
    } catch (error) {
      console.error(`Error querying selector '${selector}':`, error);
      return null;
    }
  }

  /**
   * Safely query multiple elements with type checking
   */
  static querySelectorAll<T extends Element = Element>(
    selector: string,
    parent: Document | Element = document
  ): NodeListOf<T> {
    try {
      return parent.querySelectorAll<T>(selector);
    } catch (error) {
      console.error(`Error querying selector '${selector}':`, error);
      return document.createDocumentFragment().querySelectorAll<T>(selector);
    }
  }

  /**
   * Create an element with attributes and content
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: Record<string, string> = {},
    content?: string
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    if (content !== undefined) {
      element.textContent = content;
    }

    return element;
  }

  /**
   * Add event listener with automatic cleanup
   */
  static addEventListenerWithCleanup<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
  }

  /**
   * Check if element is in viewport
   */
  static isInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

/**
 * Math and calculation utilities
 */
export class MathUtils {
  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  /**
   * Calculate distance between two points
   */
  static distance(point1: Position, point2: Position): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Generate random number between min and max
   */
  static randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  static randomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }
}

/**
 * Color utility functions
 */
export class ColorUtils {
  /**
   * Generate random RGB color
   */
  static randomRGB(): RGBColor {
    return {
      r: MathUtils.randomIntBetween(0, 255),
      g: MathUtils.randomIntBetween(0, 255),
      b: MathUtils.randomIntBetween(0, 255)
    };
  }

  /**
   * Convert RGB to CSS color string
   */
  static rgbToString(color: RGBColor): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRGB(hex: string): RGBColor | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result && result[1] && result[2] && result[3]) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    }
    return null;
  }

  /**
   * Generate color with sinusoidal variation
   */
  static generateSinusoidalColor(time: number, phase: { r: number; g: number; b: number }): RGBColor {
    return {
      r: Math.floor(128 + 127 * Math.sin(time + phase.r)),
      g: Math.floor(128 + 127 * Math.sin(time + phase.g)),
      b: Math.floor(128 + 127 * Math.sin(time + phase.b))
    };
  }
}

/**
 * Animation utility functions
 */
export class AnimationUtils {
  private static animationFrames = new Map<number, boolean>();

  /**
   * Request animation frame with cancellation support
   */
  static requestAnimationFrame(callback: FrameRequestCallback): number {
    const id = window.requestAnimationFrame(callback);
    this.animationFrames.set(id, true);
    return id;
  }

  /**
   * Cancel animation frame
   */
  static cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id);
    this.animationFrames.delete(id);
  }

  /**
   * Cancel all active animation frames
   */
  static cancelAllAnimationFrames(): void {
    this.animationFrames.forEach((_, id) => {
      window.cancelAnimationFrame(id);
    });
    this.animationFrames.clear();
  }

  /**
   * Easing functions
   */
  static easing = {
    linear: (t: number): number => t,
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => (--t) * t * t + 1,
    easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };
}

/**
 * Text and string utilities
 */
export class TextUtils {
  /**
   * Character set for noise generation
   */
  static readonly NOISE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./><? АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя";

  /**
   * Generate random character from noise character set
   */
  static randomNoiseChar(): string {
    const index = MathUtils.randomIntBetween(0, this.NOISE_CHARS.length - 1);
    const char = this.NOISE_CHARS[index];
    return char || '?'; // Fallback character if undefined
  }

  /**
   * Generate random noise string of specified length
   */
  static generateNoiseString(length: number): string {
    return Array.from({ length }, () => this.randomNoiseChar()).join('');
  }

  /**
   * Escape HTML special characters
   */
  static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceUtils {
  private static performanceMarks = new Map<string, number>();

  /**
   * Start performance measurement
   */
  static startMeasurement(name: string): void {
    this.performanceMarks.set(name, performance.now());
  }

  /**
   * End performance measurement and return duration
   */
  static endMeasurement(name: string): number {
    const start = this.performanceMarks.get(name);
    if (start === undefined) {
      console.warn(`No performance mark found for '${name}'`);
      return 0;
    }
    const duration = performance.now() - start;
    this.performanceMarks.delete(name);
    return duration;
  }

  /**
   * Get current FPS
   */
  static getFPS(): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      
      function countFrames(): void {
        frames++;
        const elapsed = performance.now() - start;
        if (elapsed < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          resolve(Math.round((frames * 1000) / elapsed));
        }
      }
      
      requestAnimationFrame(countFrames);
    });
  }
}

/**
 * Error handling utilities
 */
export class ErrorUtils {
  /**
   * Safe execution of a function with error handling
   */
  static safe<T>(
    fn: () => T,
    fallback: T,
    errorHandler?: (error: Error) => void
  ): T {
    try {
      return fn();
    } catch (error) {
      if (errorHandler && error instanceof Error) {
        errorHandler(error);
      } else {
        console.error('Safe execution failed:', error);
      }
      return fallback;
    }
  }

  /**
   * Safe async execution with error handling
   */
  static async safeAsync<T>(
    fn: () => Promise<T>,
    fallback: T,
    errorHandler?: (error: Error) => void
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (errorHandler && error instanceof Error) {
        errorHandler(error);
      } else {
        console.error('Safe async execution failed:', error);
      }
      return fallback;
    }
  }
}


