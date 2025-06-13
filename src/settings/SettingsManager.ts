/**
 * Professional Settings Management System
 * Type-safe settings management with validation, events, and persistence
 */

import type {
  AppSettings,
  AppError,
  NotificationType,
  NotificationConfig,
  SettingsEvents,
  SettingsManagerConfig,
  SettingsUIElement,
  SettingsValidationRule,
  SettingsStorage
} from '../types/index.js';

/**
 * Default application settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  // Visual Settings
  enableAnimations: true,
  enableNoiseEffects: true,
  enableDistortions: true,
  animationSpeed: 1.0,
  
  // Audio Settings
  enableAudio: false,
  masterVolume: 50,
  enableAmbientSounds: false,
  
  // Performance Settings
  graphicsQuality: 'medium',
  reduceMotion: false,
  frameRateLimit: '60',
  
  // Accessibility Settings
  highContrast: false,
  largeText: false,
  keyboardNavigation: true,
  screenReaderMode: false,
  
  // Experimental Settings
  betaFeatures: false,
  debugMode: false,
  psychedelicIntensity: 50
} as const;

/**
 * Settings validation rules
 */
const VALIDATION_RULES: readonly SettingsValidationRule[] = [
  { key: 'animationSpeed', type: 'number', min: 0.5, max: 3.0, required: true },
  { key: 'masterVolume', type: 'number', min: 0, max: 100, required: true },
  { key: 'psychedelicIntensity', type: 'number', min: 0, max: 100, required: true },
  { key: 'graphicsQuality', type: 'string', allowedValues: ['low', 'medium', 'high', 'ultra'], required: true },
  { key: 'frameRateLimit', type: 'string', allowedValues: ['30', '60', '120', 'unlimited'], required: true }
] as const;

/**
 * Default configuration for settings manager
 */
const DEFAULT_CONFIG: SettingsManagerConfig = {
  storageKey: 'psychopism-settings',
  autoSave: true,
  validateOnLoad: true,
  enableNotifications: true,
  debugMode: false
} as const;

/**
 * Local storage implementation
 */
class LocalSettingsStorage implements SettingsStorage {
  constructor(private readonly storageKey: string) {}

  async load(): Promise<Partial<AppSettings> | null> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      return null;
    }
  }

  async save(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (error) {
      throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear settings:', error);
    }
  }

  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Notification manager for user feedback
 */
class NotificationManager {
  private static readonly NOTIFICATION_CONTAINER_ID = 'settings-notifications';
  private notificationCounter = 0;

  /**
   * Show a notification to the user
   */
  show(config: NotificationConfig): void {
    const notification = this.createNotificationElement(config);
    const container = this.getOrCreateContainer();
    
    container.appendChild(notification);
    this.animateIn(notification);
    
    if (!config.persistent) {
      const duration = config.duration ?? 3000;
      setTimeout(() => this.hide(notification), duration);
    }
  }

  private createNotificationElement(config: NotificationConfig): HTMLElement {
    const notification = document.createElement('div');
    notification.className = `settings-notification settings-notification--${config.type}`;
    notification.id = `notification-${++this.notificationCounter}`;
    
    const message = document.createElement('span');
    message.className = 'settings-notification__message';
    message.textContent = config.message;
    notification.appendChild(message);
    
    if (config.actions?.length) {
      const actions = document.createElement('div');
      actions.className = 'settings-notification__actions';
      
      for (const action of config.actions) {
        const button = document.createElement('button');
        button.className = `settings-notification__action settings-notification__action--${action.style ?? 'secondary'}`;
        button.textContent = action.label;
        button.addEventListener('click', () => {
          action.action();
          this.hide(notification);
        });
        actions.appendChild(button);
      }
      
      notification.appendChild(actions);
    }
    
    // Close button for persistent notifications
    if (config.persistent) {
      const closeButton = document.createElement('button');
      closeButton.className = 'settings-notification__close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => this.hide(notification));
      notification.appendChild(closeButton);
    }
    
    this.applyStyles(notification, config.type);
    return notification;
  }

  private applyStyles(element: HTMLElement, type: NotificationType): void {
    const baseStyles: Record<string, string> = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '4px',
      color: 'white',
      fontFamily: 'var(--font-family-primary)',
      fontSize: '14px',
      zIndex: '300',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease',
      minWidth: '300px',
      maxWidth: '500px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    };
    
    const typeStyles: Record<NotificationType, Record<string, string>> = {
      success: { backgroundColor: '#4CAF50' },
      error: { backgroundColor: '#f44336' },
      warning: { backgroundColor: '#ff9800' },
      info: { backgroundColor: '#2196F3' }
    };
    
    Object.assign(element.style, baseStyles, typeStyles[type]);
  }

  private getOrCreateContainer(): HTMLElement {
    let container = document.getElementById(NotificationManager.NOTIFICATION_CONTAINER_ID);
    
    if (!container) {
      container = document.createElement('div');
      container.id = NotificationManager.NOTIFICATION_CONTAINER_ID;
      container.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    
    return container;
  }

  private animateIn(element: HTMLElement): void {
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    });
  }

  private hide(element: HTMLElement): void {
    element.style.opacity = '0';
    element.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      element.remove();
    }, 300);
  }
}

/**
 * Main settings manager class
 */
export class SettingsManager {
  private settings: AppSettings;
  private readonly config: SettingsManagerConfig;
  private readonly storage: SettingsStorage;
  private readonly notifications: NotificationManager;
  private readonly eventHandlers: Map<keyof SettingsEvents, Function[]> = new Map();
  private readonly uiElements: Map<string, SettingsUIElement> = new Map();
  private isInitialized = false;

  constructor(config: Partial<SettingsManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = new LocalSettingsStorage(this.config.storageKey);
    this.notifications = new NotificationManager();
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Initialize the settings manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('SettingsManager is already initialized');
      return;
    }

    try {
      await this.loadSettings();
      this.initializeUIElements();
      this.setupEventListeners();
      this.applySettings();
      this.isInitialized = true;
      
      this.emit('onSettingsLoaded', this.settings);
      
      if (this.config.debugMode) {
        console.log('SettingsManager initialized with settings:', this.settings);
      }
    } catch (error) {
      const appError: AppError = {
        code: 'SETTINGS_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown initialization error',
        timestamp: Date.now(),
        component: 'SettingsManager'
      };
      
      this.emit('onSettingsError', appError);
      throw appError;
    }
  }

  /**
   * Get current settings (immutable)
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Get a specific setting value
   */
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * Update a specific setting
   */
  async setSetting<K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K],
    skipValidation = false
  ): Promise<void> {
    if (!skipValidation && !this.validateSetting(key, value)) {
      throw new Error(`Invalid value for setting '${key}': ${value}`);
    }

    const oldValue = this.settings[key];
    if (oldValue === value) {
      return; // No change
    }

    // Create new settings object (immutable update)
    this.settings = {
      ...this.settings,
      [key]: value
    };

    this.emit('onSettingChanged', key, value, oldValue);
    this.applySettings();
    this.updateUI();

    if (this.config.autoSave) {
      await this.saveSettings();
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateSettings(partialSettings: Partial<AppSettings>): Promise<void> {
    const newSettings = { ...this.settings, ...partialSettings };
    
    if (this.config.validateOnLoad) {
      this.validateSettings(newSettings);
    }

    this.settings = newSettings;
    this.applySettings();
    this.updateUI();

    if (this.config.autoSave) {
      await this.saveSettings();
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    const confirmed = confirm('Are you sure you want to reset all settings to default?');
    if (!confirmed) {
      return;
    }

    this.settings = { ...DEFAULT_SETTINGS };
    this.emit('onSettingsReset', this.settings);
    this.applySettings();
    this.updateUI();

    if (this.config.autoSave) {
      await this.saveSettings();
    }

    if (this.config.enableNotifications) {
      this.notifications.show({
        message: 'Settings reset to default values',
        type: 'info'
      });
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings(): Promise<void> {
    try {
      await this.storage.save(this.settings);
      this.emit('onSettingsSaved', this.settings);
      
      if (this.config.enableNotifications) {
        this.notifications.show({
          message: 'Settings saved successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      const appError: AppError = {
        code: 'SETTINGS_SAVE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to save settings',
        timestamp: Date.now(),
        component: 'SettingsManager'
      };
      
      this.emit('onSettingsError', appError);
      
      if (this.config.enableNotifications) {
        this.notifications.show({
          message: 'Failed to save settings',
          type: 'error'
        });
      }
      
      throw appError;
    }
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    if (!this.storage.isAvailable()) {
      console.warn('Settings storage is not available, using defaults');
      return;
    }

    try {
      const stored = await this.storage.load();
      if (stored) {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...stored };
        
        if (this.config.validateOnLoad) {
          this.validateSettings(mergedSettings);
        }
        
        this.settings = mergedSettings;
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Validate a single setting
   */
  private validateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): boolean {
    const rule = VALIDATION_RULES.find(r => r.key === key);
    if (!rule) {
      return true; // No validation rule, assume valid
    }

    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) return false;
      if (rule.max !== undefined && value > rule.max) return false;
    }

    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.allowedValues && !rule.allowedValues.includes(value)) return false;
    }

    return true;
  }

  /**
   * Validate all settings
   */
  private validateSettings(settings: AppSettings): void {
    for (const rule of VALIDATION_RULES) {
      if (!this.validateSetting(rule.key, settings[rule.key])) {
        throw new Error(`Invalid setting '${rule.key}': ${settings[rule.key]}`);
      }
    }
  }

  /**
   * Apply settings to the DOM and application state
   */
  private applySettings(): void {
    const root = document.documentElement;
    const body = document.body;

    // Remove all existing setting classes
    body.className = body.className.replace(/\b(?:animations-disabled|reduce-motion|noise-effects-disabled|distortions-disabled|high-contrast|large-text|screen-reader-mode|keyboard-navigation-disabled|debug-mode|beta-features-enabled)\b/g, '').trim();

    // Apply visual settings
    if (!this.settings.enableAnimations) {
      body.classList.add('animations-disabled');
    }
    
    if (this.settings.reduceMotion) {
      body.classList.add('reduce-motion');
    }
    
    if (!this.settings.enableNoiseEffects) {
      body.classList.add('noise-effects-disabled');
    }
    
    if (!this.settings.enableDistortions) {
      body.classList.add('distortions-disabled');
    }

    // Apply accessibility settings
    if (this.settings.highContrast) {
      body.classList.add('high-contrast');
    }
    
    if (this.settings.largeText) {
      body.classList.add('large-text');
    }
    
    if (this.settings.screenReaderMode) {
      body.classList.add('screen-reader-mode');
    }
    
    if (!this.settings.keyboardNavigation) {
      body.classList.add('keyboard-navigation-disabled');
    }

    // Apply experimental settings
    if (this.settings.debugMode) {
      body.classList.add('debug-mode');
    }
    
    if (this.settings.betaFeatures) {
      body.classList.add('beta-features-enabled');
    }

    // Apply performance settings
    body.setAttribute('data-graphics-quality', this.settings.graphicsQuality);
    body.setAttribute('data-frame-rate-limit', this.settings.frameRateLimit);

    // Apply CSS custom properties
    root.style.setProperty('--animation-speed-multiplier', this.settings.animationSpeed.toString());
    root.style.setProperty('--psychedelic-intensity', (this.settings.psychedelicIntensity / 100).toString());

    // Audio settings (placeholder for future implementation)
    if (this.settings.enableAudio) {
      console.log('Audio enabled with volume:', this.settings.masterVolume);
    }
  }

  /**
   * Initialize UI elements and bind to settings
   */
  private initializeUIElements(): void {
    // Checkboxes
    const checkboxes = [
      'enable-animations', 'enable-noise-effects', 'enable-distortions',
      'enable-audio', 'enable-ambient-sounds', 'reduce-motion',
      'high-contrast', 'large-text', 'keyboard-navigation',
      'screen-reader-mode', 'beta-features', 'debug-mode'
    ];

    for (const id of checkboxes) {
      const element = document.getElementById(id) as HTMLInputElement;
      if (element) {
        const settingKey = this.idToSettingKey(id) as keyof AppSettings;
        this.uiElements.set(id, {
          id,
          type: 'checkbox',
          settingKey,
          element
        });
      }
    }

    // Sliders
    const sliders = ['animation-speed', 'master-volume', 'psychedelic-intensity'];
    for (const id of sliders) {
      const element = document.getElementById(id) as HTMLInputElement;
      const valueElement = document.getElementById(id + '-value');
      if (element) {
        const settingKey = this.idToSettingKey(id) as keyof AppSettings;
        const uiElement: SettingsUIElement = {
          id,
          type: 'slider',
          settingKey,
          element
        };
        
        if (valueElement) {
          (uiElement as any).valueElement = valueElement;
        }
        
        this.uiElements.set(id, uiElement);
      }
    }

    // Select dropdowns
    const selects = ['graphics-quality', 'frame-rate-limit'];
    for (const id of selects) {
      const element = document.getElementById(id) as HTMLSelectElement;
      if (element) {
        const settingKey = this.idToSettingKey(id) as keyof AppSettings;
        this.uiElements.set(id, {
          id,
          type: 'select',
          settingKey,
          element
        });
      }
    }
  }

  /**
   * Setup event listeners for UI elements
   */
  private setupEventListeners(): void {
    for (const [id, uiElement] of this.uiElements) {
      const { element, type, settingKey } = uiElement;

      if (type === 'checkbox') {
        element.addEventListener('change', async (e) => {
          const target = e.target as HTMLInputElement;
          await this.setSetting(settingKey, target.checked as any);
        });
      } else if (type === 'slider') {
        element.addEventListener('input', async (e) => {
          const target = e.target as HTMLInputElement;
          const value = parseFloat(target.value);
          await this.setSetting(settingKey, value as any);
          this.updateSliderDisplay(id, value);
        });
      } else if (type === 'select') {
        element.addEventListener('change', async (e) => {
          const target = e.target as HTMLSelectElement;
          await this.setSetting(settingKey, target.value as any);
        });
      }
    }
  }

  /**
   * Update UI to reflect current settings
   */
  private updateUI(): void {
    for (const [id, uiElement] of this.uiElements) {
      const { element, type, settingKey } = uiElement;
      const value = this.settings[settingKey];

      if (type === 'checkbox') {
        (element as HTMLInputElement).checked = value as boolean;
      } else if (type === 'slider') {
        (element as HTMLInputElement).value = value.toString();
        this.updateSliderDisplay(id, value as number);
      } else if (type === 'select') {
        (element as HTMLSelectElement).value = value as string;
      }
    }
  }

  /**
   * Update slider display value
   */
  private updateSliderDisplay(id: string, value: number): void {
    const uiElement = this.uiElements.get(id);
    if (uiElement?.valueElement) {
      if (id === 'animation-speed') {
        uiElement.valueElement.textContent = `${value}x`;
      } else {
        uiElement.valueElement.textContent = `${value}%`;
      }
    }
  }

  /**
   * Convert element ID to setting key (camelCase)
   */
  private idToSettingKey(id: string): string {
    return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Event system
   */
  on<K extends keyof SettingsEvents>(event: K, handler: SettingsEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off<K extends keyof SettingsEvents>(event: K, handler: SettingsEvents[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof SettingsEvents>(event: K, ...args: Parameters<SettingsEvents[K]>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          (handler as any)(...args);
        } catch (error) {
          console.error(`Error in settings event handler for '${event}':`, error);
        }
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.eventHandlers.clear();
    this.uiElements.clear();
    this.isInitialized = false;
  }
}

// Export types for external use
export type { AppSettings, SettingsEvents, SettingsManagerConfig };
export { DEFAULT_SETTINGS };

