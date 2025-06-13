/**
 * Base component class with lifecycle management
 */

import { EventBus } from '../events/EventBus.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';

export interface ComponentConfig {
  readonly name: string;
  readonly debug?: boolean;
  readonly autoInit?: boolean;
}

export enum ComponentState {
  CREATED = 'created',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  MOUNTED = 'mounted',
  ACTIVE = 'active',
  PAUSED = 'paused',
  UNMOUNTING = 'unmounting',
  DESTROYED = 'destroyed',
  ERROR = 'error',
}

export abstract class Component {
  protected readonly config: ComponentConfig;
  protected state: ComponentState = ComponentState.CREATED;
  protected eventBus = new EventBus();
  protected cleanupFunctions: Array<() => void> = [];
  protected initializationPromise?: Promise<void>;
  
  constructor(config: ComponentConfig) {
    this.config = config;
    
    if (config.debug) {
      this.setupDebugLogging();
    }
    
    if (config.autoInit) {
      this.initialize();
    }
  }

  /**
   * Initialize the component
   */
  public async initialize(): Promise<void> {
    if (this.state !== ComponentState.CREATED) {
      throw new AppError(
        ErrorCode.INITIALIZATION_FAILED,
        `Cannot initialize component in state: ${this.state}`,
        this.config.name
      );
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      this.setState(ComponentState.INITIALIZING);
      await this.onInit();
      this.setState(ComponentState.INITIALIZED);
    } catch (error) {
      this.setState(ComponentState.ERROR);
      throw new AppError(
        ErrorCode.INITIALIZATION_FAILED,
        `Component initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.name,
        { originalError: error }
      );
    }
  }

  /**
   * Mount the component (attach to DOM, start animations, etc.)
   */
  public async mount(): Promise<void> {
    if (this.state !== ComponentState.INITIALIZED) {
      if (this.state === ComponentState.CREATED) {
        await this.initialize();
      } else {
        throw new AppError(
          ErrorCode.INITIALIZATION_FAILED,
          `Cannot mount component in state: ${this.state}`,
          this.config.name
        );
      }
    }

    try {
      await this.onMount();
      this.setState(ComponentState.MOUNTED);
      this.activate();
    } catch (error) {
      this.setState(ComponentState.ERROR);
      throw new AppError(
        ErrorCode.INITIALIZATION_FAILED,
        `Component mount failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.name,
        { originalError: error }
      );
    }
  }

  /**
   * Activate the component
   */
  public activate(): void {
    if (this.state === ComponentState.MOUNTED || this.state === ComponentState.PAUSED) {
      this.onActivate();
      this.setState(ComponentState.ACTIVE);
    }
  }

  /**
   * Pause the component
   */
  public pause(): void {
    if (this.state === ComponentState.ACTIVE) {
      this.onPause();
      this.setState(ComponentState.PAUSED);
    }
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    if (this.state === ComponentState.DESTROYED) {
      return;
    }

    this.setState(ComponentState.UNMOUNTING);
    
    try {
      this.onDestroy();
      this.runCleanupFunctions();
      this.eventBus.removeAllListeners();
    } catch (error) {
      console.error(`Error during component destruction:`, error);
    } finally {
      this.setState(ComponentState.DESTROYED);
    }
  }

  /**
   * Get current component state
   */
  public getState(): ComponentState {
    return this.state;
  }

  /**
   * Check if component is in active state
   */
  public isActive(): boolean {
    return this.state === ComponentState.ACTIVE;
  }

  /**
   * Check if component is destroyed
   */
  public isDestroyed(): boolean {
    return this.state === ComponentState.DESTROYED;
  }

  /**
   * Add cleanup function
   */
  protected addCleanup(fn: () => void): void {
    this.cleanupFunctions.push(fn);
  }

  /**
   * Set component state and emit event
   */
  protected setState(newState: ComponentState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (this.config.debug) {
      console.log(`[${this.config.name}] State: ${oldState} → ${newState}`);
    }
    
    this.eventBus.emit('stateChange', { oldState, newState });
  }

  /**
   * Run all cleanup functions
   */
  private runCleanupFunctions(): void {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error(`Error in cleanup function:`, error);
      }
    });
    this.cleanupFunctions = [];
  }

  /**
   * Setup debug logging
   */
  private setupDebugLogging(): void {
    this.eventBus.on('stateChange', (data: any) => {
      const { oldState, newState } = data;
      console.log(`[${this.config.name}] State transition: ${oldState} → ${newState}`);
    });
  }

  // Abstract lifecycle methods that must be implemented by subclasses
  protected abstract onInit(): Promise<void>;
  protected abstract onMount(): Promise<void>;
  protected abstract onActivate(): void;
  protected abstract onPause(): void;
  protected abstract onDestroy(): void;
}

