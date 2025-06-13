/**
 * Settings module entry point
 * Exports all settings-related functionality
 */

export { SettingsManager, DEFAULT_SETTINGS } from './SettingsManager.js';
export {
  initializeGlobalSettings,
  openSettings,
  closeSettings,
  saveSettings,
  resetSettings,
  toggleAnimations,
  getSettingsManager
} from './global.js';

// Re-export types
export type {
  AppSettings,
  SettingsEvents,
  SettingsManagerConfig,
  GraphicsQuality,
  FrameRateLimit,
  NotificationType
} from '../types/index.js';

