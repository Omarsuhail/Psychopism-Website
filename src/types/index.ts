/**
 * Core type definitions for the Psychopism website
 * Provides comprehensive typing for all components and data structures
 */

/**
 * RGB color components
 */
export interface RGBColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/**
 * 2D coordinate position
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Dimensions for elements
 */
export interface Dimensions {
  readonly width: number;
  readonly height: number;
}



/**
 * Mouse interaction state
 */
export interface MouseState {
  readonly position: Position;
  readonly isActive: boolean;
}

/**
 * Text animation configuration
 */
export interface TextAnimationConfig {
  readonly duration: number;
  readonly finalColor: string;
  readonly noiseChars: string;
}

/**
 * Navigation item structure
 */
export interface NavigationItem {
  readonly href: string;
  readonly label: string;
  readonly isActive?: boolean;
}

/**
 * Blog post data structure
 */
export interface BlogPost {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly content: string;
  readonly excerpt?: string;
}

/**
 * Feature description
 */
export interface Feature {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
}

/**
 * System requirements structure
 */
export interface SystemRequirement {
  readonly category: 'minimum' | 'recommended';
  readonly requirements: {
    readonly processor: string;
    readonly ram: string;
    readonly videoCard: string;
    readonly diskSpace: string;
    readonly operatingSystem: string;
  };
}

/**
 * FAQ item structure
 */
export interface FAQItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  readonly email: string;
  readonly socialMedia: {
    readonly discord?: string;
    readonly github?: string;
    readonly twitter?: string;
  };
}


/**
 * Component lifecycle events
 */
export interface ComponentEvents {
  readonly onMount?: () => void;
  readonly onUnmount?: () => void;
  readonly onUpdate?: () => void;
}

/**
 * Animation frame management
 */
export interface AnimationFrame {
  readonly id: number;
  readonly timestamp: number;
}

/**
 * Event handler types
 */
export type EventHandler<T = Event> = (event: T) => void;
export type AnimationCallback = (timestamp: number) => void;
export type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

/**
 * Utility types for DOM elements
 */
export type HTMLElementWithDataset = HTMLElement & {
  dataset: DOMStringMap & {
    originalText?: string;
    componentId?: string;
  };
};

/**
 * Component configuration base
 */
export interface ComponentConfig {
  readonly selector: string;
  readonly autoInit?: boolean;
  readonly debug?: boolean;
}

/**
 * Application state
 */
export interface AppState {
  readonly isInitialized: boolean;
  readonly currentSection: string;
  readonly animationsEnabled: boolean;
  readonly mousePosition: Position;
}

/**
 * Error types
 */
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: number;
  readonly component?: string;
}

/**
 * Performance monitoring
 */
export interface PerformanceMetrics {
  readonly fps: number;
  readonly memoryUsage: number;
  readonly animationFrameTime: number;
}

/**
 * Settings system types
 */
export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type FrameRateLimit = '30' | '60' | '120' | 'unlimited';
export type NotificationType = 'info' | 'success' | 'error' | 'warning';

/**
 * Application settings structure
 */
export interface AppSettings {
  // Visual Settings
  readonly enableAnimations: boolean;
  readonly enableNoiseEffects: boolean;
  readonly enableDistortions: boolean;
  readonly animationSpeed: number; // 0.5 - 3.0
  
  // Audio Settings
  readonly enableAudio: boolean;
  readonly masterVolume: number; // 0 - 100
  readonly enableAmbientSounds: boolean;
  
  // Performance Settings
  readonly graphicsQuality: GraphicsQuality;
  readonly reduceMotion: boolean;
  readonly frameRateLimit: FrameRateLimit;
  
  // Accessibility Settings
  readonly highContrast: boolean;
  readonly largeText: boolean;
  readonly keyboardNavigation: boolean;
  readonly screenReaderMode: boolean;
  
  // Experimental Settings
  readonly betaFeatures: boolean;
  readonly debugMode: boolean;
  readonly psychedelicIntensity: number; // 0 - 100
}

/**
 * Settings validation schema
 */
export interface SettingsValidationRule {
  readonly key: keyof AppSettings;
  readonly type: 'boolean' | 'number' | 'string';
  readonly min?: number;
  readonly max?: number;
  readonly allowedValues?: readonly string[];
  readonly required?: boolean;
}

/**
 * Settings event types
 */
export interface SettingsEvents {
  readonly onSettingChanged: (key: keyof AppSettings, value: AppSettings[keyof AppSettings], oldValue: AppSettings[keyof AppSettings]) => void;
  readonly onSettingsSaved: (settings: AppSettings) => void;
  readonly onSettingsReset: (settings: AppSettings) => void;
  readonly onSettingsLoaded: (settings: AppSettings) => void;
  readonly onSettingsError: (error: AppError) => void;
}

/**
 * Settings manager configuration
 */
export interface SettingsManagerConfig {
  readonly storageKey: string;
  readonly autoSave: boolean;
  readonly validateOnLoad: boolean;
  readonly enableNotifications: boolean;
  readonly debugMode: boolean;
}

/**
 * Settings UI element types
 */
export type SettingsElementType = 'checkbox' | 'slider' | 'select' | 'text' | 'number';

export interface SettingsUIElement {
  readonly id: string;
  readonly type: SettingsElementType;
  readonly settingKey: keyof AppSettings;
  readonly element: HTMLElement;
  readonly valueElement?: HTMLElement;
}

/**
 * Notification system
 */
export interface NotificationConfig {
  readonly message: string;
  readonly type: NotificationType;
  readonly duration?: number;
  readonly persistent?: boolean;
  readonly actions?: readonly NotificationAction[];
}

export interface NotificationAction {
  readonly label: string;
  readonly action: () => void;
  readonly style?: 'primary' | 'secondary' | 'danger';
}

/**
 * Settings section metadata
 */
export interface SettingsSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly settings: readonly (keyof AppSettings)[];
  readonly order: number;
}

/**
 * Settings storage interface
 */
export interface SettingsStorage {
  load(): Promise<Partial<AppSettings> | null>;
  save(settings: AppSettings): Promise<void>;
  clear(): Promise<void>;
  isAvailable(): boolean;
}

