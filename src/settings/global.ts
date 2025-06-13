/**
 * Global settings integration for the HTML page
 * Provides immediate settings functionality for the user interface
 */

import { SettingsManager } from './SettingsManager.js';
import type { AppSettings } from '../types/index.js';

// Global settings manager instance
let settingsManager: SettingsManager | null = null;

/**
 * Initialize settings when DOM is ready
 */
function initializeSettings(): void {
  try {
    settingsManager = new SettingsManager({
      storageKey: 'psychopism-settings',
      autoSave: true,
      validateOnLoad: true,
      enableNotifications: true,
      debugMode: false
    });
    
    settingsManager.initialize().then(() => {
      console.log('Settings system initialized');
    }).catch((error) => {
      console.error('Failed to initialize settings:', error);
    });
    
  } catch (error) {
    console.error('Settings initialization error:', error);
  }
}

/**
 * Open settings modal
 */
function openSettings(): void {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focus management for accessibility
    const firstInput = modal.querySelector('input, select, button') as HTMLElement;
    if (firstInput) {
      firstInput.focus();
    }
  }
}

/**
 * Close settings modal
 */
function closeSettings(): void {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Return focus to settings button
    const settingsBtn = document.getElementById('open-settings');
    if (settingsBtn) {
      settingsBtn.focus();
    }
  }
}

/**
 * Save current settings
 */
async function saveSettings(): Promise<void> {
  if (!settingsManager) {
    console.error('Settings manager not initialized');
    return;
  }
  
  try {
    await settingsManager.saveSettings();
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Reset settings to default values
 */
async function resetSettings(): Promise<void> {
  if (!settingsManager) {
    console.error('Settings manager not initialized');
    return;
  }
  
  try {
    await settingsManager.resetSettings();
    console.log('Settings reset to defaults');
  } catch (error) {
    console.error('Failed to reset settings:', error);
  }
}

/**
 * Get current settings (for external access)
 */
function getCurrentSettings(): AppSettings | null {
  return settingsManager?.getSettings() || null;
}

/**
 * Update a specific setting
 */
async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  if (!settingsManager) {
    console.error('Settings manager not initialized');
    return;
  }
  
  try {
    await settingsManager.setSetting(key, value);
    console.log(`Setting '${key}' updated to:`, value);
  } catch (error) {
    console.error(`Failed to update setting '${key}':`, error);
  }
}

/**
 * Toggle animations on/off (legacy function)
 */
async function toggleAnimations(): Promise<void> {
  if (!settingsManager) {
    console.error('Settings manager not initialized');
    return;
  }
  
  try {
    const currentValue = settingsManager.getSetting('enableAnimations');
    await settingsManager.setSetting('enableAnimations', !currentValue);
  } catch (error) {
    console.error('Failed to toggle animations:', error);
  }
}

/**
 * Get the settings manager instance
 */
function getSettingsManager(): SettingsManager | null {
  return settingsManager;
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + , to open settings
    if ((event.ctrlKey || event.metaKey) && event.key === ',') {
      event.preventDefault();
      openSettings();
    }
    
    // Escape to close settings
    if (event.key === 'Escape') {
      const modal = document.getElementById('settings-modal');
      if (modal && modal.classList.contains('show')) {
        event.preventDefault();
        closeSettings();
      }
    }
  });
}

/**
 * Setup settings modal event listeners
 */
function setupModalEventListeners(): void {
  // Close modal when clicking overlay
  const overlay = document.querySelector('.settings-modal__overlay');
  if (overlay) {
    overlay.addEventListener('click', closeSettings);
  }
  
  // Prevent modal from closing when clicking inside content
  const content = document.querySelector('.settings-modal__content');
  if (content) {
    content.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }
}

/**
 * Initialize everything when DOM is ready
 */
function initializeGlobalSettings(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeSettings();
      setupKeyboardShortcuts();
      setupModalEventListeners();
    });
  } else {
    initializeSettings();
    setupKeyboardShortcuts();
    setupModalEventListeners();
  }
}

// Auto-initialize
initializeGlobalSettings();

// Make functions globally available for HTML onclick handlers
declare global {
  interface Window {
    openSettings: () => void;
    closeSettings: () => void;
    saveSettings: () => Promise<void>;
    resetSettings: () => Promise<void>;
    getCurrentSettings: () => AppSettings | null;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
    toggleAnimations: () => Promise<void>;
    getSettingsManager: () => SettingsManager | null;
  }
}

if (typeof window !== 'undefined') {
  window.openSettings = openSettings;
  window.closeSettings = closeSettings;
  window.saveSettings = saveSettings;
  window.resetSettings = resetSettings;
  window.getCurrentSettings = getCurrentSettings;
  window.updateSetting = updateSetting;
  window.toggleAnimations = toggleAnimations;
  window.getSettingsManager = getSettingsManager;
}

// Export for module use
export {
  initializeGlobalSettings,
  openSettings,
  closeSettings,
  saveSettings,
  resetSettings,
  getCurrentSettings,
  updateSetting,
  toggleAnimations,
  getSettingsManager,
  settingsManager
};

