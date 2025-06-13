/**
 * Custom application error classes
 */

export enum ErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  CANVAS_ERROR = 'CANVAS_ERROR',
  DOM_ERROR = 'DOM_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly timestamp: number;
  public readonly component: string | undefined;
  public readonly context: Record<string, unknown> | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    component?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = Date.now();
    this.component = component;
    this.context = context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      component: this.component,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class AnimationError extends AppError {
  constructor(message: string, component?: string, context?: Record<string, unknown>) {
    super(ErrorCode.ANIMATION_ERROR, message, component, context);
    this.name = 'AnimationError';
  }
}

export class CanvasError extends AppError {
  constructor(message: string, component?: string, context?: Record<string, unknown>) {
    super(ErrorCode.CANVAS_ERROR, message, component, context);
    this.name = 'CanvasError';
  }
}

export class DOMError extends AppError {
  constructor(message: string, component?: string, context?: Record<string, unknown>) {
    super(ErrorCode.DOM_ERROR, message, component, context);
    this.name = 'DOMError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, component?: string, context?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, component, context);
    this.name = 'ValidationError';
  }
}

