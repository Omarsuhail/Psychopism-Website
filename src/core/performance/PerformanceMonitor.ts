/**
 * Performance monitoring and optimization system
 */

import { APP_CONFIG } from '../../shared/constants/app.js';
import { eventBus } from '../events/EventBus.js';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  minFps: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
}

export class PerformanceMonitor {
  private isMonitoring = false;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private animationId: number | null = null;
  
  private readonly thresholds: PerformanceThresholds = {
    minFps: APP_CONFIG.PERFORMANCE.MIN_FPS_THRESHOLD,
    maxFrameTime: APP_CONFIG.PERFORMANCE.ANIMATION_FRAME_BUDGET,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  };

  /**
   * Start performance monitoring
   */
  public start(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    
    this.monitorFrame();
  }

  /**
   * Stop performance monitoring
   */
  public stop(): void {
    this.isMonitoring = false;
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const now = performance.now();
    const fps = this.calculateFPS();
    const frameTime = this.calculateAverageFrameTime();
    const memoryUsage = this.getMemoryUsage();

    return {
      fps,
      frameTime,
      memoryUsage,
      timestamp: now,
    };
  }

  /**
   * Check if performance is below thresholds
   */
  public isPerformancePoor(): boolean {
    const metrics = this.getMetrics();
    
    return (
      metrics.fps < this.thresholds.minFps ||
      metrics.frameTime > this.thresholds.maxFrameTime ||
      metrics.memoryUsage > this.thresholds.maxMemoryUsage
    );
  }

  /**
   * Get performance level (1-4, where 4 is best)
   */
  public getPerformanceLevel(): 1 | 2 | 3 | 4 {
    const metrics = this.getMetrics();
    
    if (metrics.fps < 20 || metrics.frameTime > 50) {
      return 1; // Very poor
    } else if (metrics.fps < 30 || metrics.frameTime > 33) {
      return 2; // Poor
    } else if (metrics.fps < 50 || metrics.frameTime > 20) {
      return 3; // Good
    } else {
      return 4; // Excellent
    }
  }

  /**
   * Get recommended quality settings based on performance
   */
  public getRecommendedQuality(): 'low' | 'medium' | 'high' | 'ultra' {
    const level = this.getPerformanceLevel();
    
    switch (level) {
      case 1:
        return 'low';
      case 2:
        return 'medium';
      case 3:
        return 'high';
      case 4:
        return 'ultra';
    }
  }

  /**
   * Monitor frame performance
   */
  private monitorFrame(): void {
    if (!this.isMonitoring) {
      return;
    }

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    this.frameCount++;
    this.frameTimeHistory.push(deltaTime);
    
    // Keep only last 60 frames for rolling average
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Calculate FPS every second
    if (deltaTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.fpsHistory.push(fps);
      
      // Keep only last 10 seconds of FPS data
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }

      // Emit performance warning if needed
      if (fps < this.thresholds.minFps) {
        eventBus.emit('performance:warning', {
          fps,
          component: 'PerformanceMonitor',
        });
      }

      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Calculate current FPS from history
   */
  private calculateFPS(): number {
    if (this.fpsHistory.length === 0) {
      return 0;
    }
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Calculate average frame time
   */
  private calculateAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) {
      return 0;
    }
    
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory?.usedJSHeapSize || 0;
    }
    return 0;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

