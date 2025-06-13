/**
 * Enhanced DOM utilities with better error handling and type safety
 */

import { DOMError } from '../errors/AppError.js';

/**
 * Type-safe DOM element selector
 */
export function querySelector<T extends HTMLElement = HTMLElement>(
  selector: string,
  context: Document | Element = document
): T | null {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    throw new DOMError(
      `Invalid selector: ${selector}`,
      'querySelector',
      { selector, error }
    );
  }
}

/**
 * Type-safe DOM element selector that throws if not found
 */
export function requireElement<T extends HTMLElement = HTMLElement>(
  selector: string,
  context: Document | Element = document
): T {
  const element = querySelector<T>(selector, context);
  if (!element) {
    throw new DOMError(
      `Required element not found: ${selector}`,
      'requireElement',
      { selector }
    );
  }
  return element;
}

/**
 * Type-safe DOM elements selector
 */
export function querySelectorAll<T extends HTMLElement = HTMLElement>(
  selector: string,
  context: Document | Element = document
): NodeListOf<T> {
  try {
    return context.querySelectorAll<T>(selector);
  } catch (error) {
    throw new DOMError(
      `Invalid selector: ${selector}`,
      'querySelectorAll',
      { selector, error }
    );
  }
}

/**
 * Create element with attributes and content
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string>,
  content?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'style') {
        element.setAttribute('style', value);
      } else {
        element.setAttribute(key, value);
      }
    });
  }
  
  if (content !== undefined) {
    element.textContent = content;
  }
  
  return element;
}

/**
 * Add event listener with automatic cleanup tracking
 */
export function addEventListenerWithCleanup<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type, listener, options);
  
  return () => {
    element.removeEventListener(type, listener, options);
  };
}

/**
 * Wait for DOM to be ready
 */
export function waitForDOMReady(): Promise<void> {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
}

/**
 * Get CSS custom property value
 */
export function getCSSCustomProperty(property: string, element: Element = document.documentElement): string {
  const value = getComputedStyle(element).getPropertyValue(property);
  return value.trim();
}

/**
 * Set CSS custom property value
 */
export function setCSSCustomProperty(
  property: string,
  value: string,
  element: Element = document.documentElement
): void {
  if (element instanceof HTMLElement) {
    element.style.setProperty(property, value);
  }
}

/**
 * Check if element is visible in viewport
 */
export function isElementInViewport(
  element: Element,
  threshold = 0
): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= windowHeight + threshold &&
    rect.right <= windowWidth + threshold
  );
}

/**
 * Get element dimensions including margins
 */
export function getElementDimensions(element: Element): {
  width: number;
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
} {
  const rect = element.getBoundingClientRect();
  const styles = getComputedStyle(element);
  
  return {
    width: rect.width,
    height: rect.height,
    marginTop: parseFloat(styles.marginTop),
    marginRight: parseFloat(styles.marginRight),
    marginBottom: parseFloat(styles.marginBottom),
    marginLeft: parseFloat(styles.marginLeft),
  };
}

/**
 * Safely execute a function with error handling
 */
export function safe<T>(
  fn: () => T,
  defaultValue: T,
  onError?: (error: unknown) => void
): T {
  try {
    return fn();
  } catch (error) {
    onError?.(error);
    return defaultValue;
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

