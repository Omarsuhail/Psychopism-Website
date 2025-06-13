/**
 * Animation utilities and helpers
 */

import { NOISE_CHARS } from '../constants/app.js';

/**
 * Generate random noise character
 */
export function randomNoiseChar(): string {
  if (!NOISE_CHARS || NOISE_CHARS.length === 0) {
    return '?';
  }
  const char = NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
  return char || '?';
}

/**
 * Generate random RGB color
 */
export function randomRGB(): { r: number; g: number; b: number } {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

/**
 * Convert RGB object to CSS string
 */
export function rgbToString(rgb: { r: number; g: number; b: number }): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Generate random grayscale color
 */
export function randomGrayscale(min = 80, max = 255): string {
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  return `rgb(${value}, ${value}, ${value})`;
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Easing functions
 */
export const easing = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  },
};

/**
 * Animation frame manager
 */
export class AnimationFrameManager {
  private activeAnimations = new Set<number>();
  private isDestroyed = false;

  /**
   * Request animation frame with tracking
   */
  public requestFrame(callback: FrameRequestCallback): number {
    if (this.isDestroyed) {
      return 0;
    }

    const id = requestAnimationFrame((timestamp) => {
      this.activeAnimations.delete(id);
      if (!this.isDestroyed) {
        callback(timestamp);
      }
    });

    this.activeAnimations.add(id);
    return id;
  }

  /**
   * Cancel animation frame
   */
  public cancelFrame(id: number): void {
    cancelAnimationFrame(id);
    this.activeAnimations.delete(id);
  }

  /**
   * Cancel all active animation frames
   */
  public cancelAllFrames(): void {
    this.activeAnimations.forEach(id => {
      cancelAnimationFrame(id);
    });
    this.activeAnimations.clear();
  }

  /**
   * Get number of active animations
   */
  public getActiveCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * Destroy the manager and cancel all animations
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.cancelAllFrames();
  }
}

/**
 * Simple tween animation class
 */
export class Tween {
  private startTime?: number;
  private frameId: number | null = null;
  private isComplete = false;

  constructor(
    private from: number,
    private to: number,
    private duration: number,
    private onUpdate: (value: number) => void,
    private onComplete?: () => void,
    private easingFn: (t: number) => number = easing.easeOutQuad
  ) {}

  /**
   * Start the tween
   */
  public start(): void {
    if (this.isComplete) {
      return;
    }

    this.startTime = performance.now();
    this.tick();
  }

  /**
   * Stop the tween
   */
  public stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Complete the tween immediately
   */
  public complete(): void {
    this.stop();
    this.isComplete = true;
    this.onUpdate(this.to);
    this.onComplete?.();
  }

  /**
   * Animation tick
   */
  private tick = (): void => {
    if (!this.startTime || this.isComplete) {
      return;
    }

    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easedProgress = this.easingFn(progress);
    const value = lerp(this.from, this.to, easedProgress);

    this.onUpdate(value);

    if (progress >= 1) {
      this.isComplete = true;
      this.onComplete?.();
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };
}

/**
 * Create a promise that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate distance between two points
 */
export function distance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate random position within bounds
 */
export function randomPosition(width: number, height: number): { x: number; y: number } {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

/**
 * Generate random velocity
 */
export function randomVelocity(maxSpeed: number): { vx: number; vy: number } {
  return {
    vx: (Math.random() - 0.5) * maxSpeed,
    vy: (Math.random() - 0.5) * maxSpeed,
  };
}

