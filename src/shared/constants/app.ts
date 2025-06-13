/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  NAME: 'Psychopism',
  VERSION: '0.3.0-dev',
  EDITION: 'Rust Edition',
  
  // Performance settings
  PERFORMANCE: {
    MAX_FPS: 60,
    MIN_FPS_THRESHOLD: 30,
    FRAME_SKIP_THRESHOLD: 20,
    ANIMATION_FRAME_BUDGET: 16, // ms
  },
  
  // Animation settings
  ANIMATIONS: {
    DEFAULT_DURATION: 1500,
    NOISE_REVEAL_DURATION: 3000,
    ELEMENT_REVEAL_DURATION: 2000,
    TRANSITION_FAST: 100,
    TRANSITION_MEDIUM: 300,
    TRANSITION_SLOW: 500,
  },
  
  // Node network settings
  NODE_NETWORK: {
    DEFAULT_NODE_COUNT: 80,
    MAX_CONNECTION_DISTANCE: 150,
    CHARACTER_SPACING: 8,
    MOVEMENT_SPEED: 0.02,
    MAX_VELOCITY: 0.8,
    DIRECTION_CHANGE_PROBABILITY: 0.002,
    CHARACTER_UPDATE_INTERVAL: { MIN: 2000, MAX: 5000 },
  },
  
  // CSS Custom Properties
  CSS_VARS: {
    FONT_FAMILY: '--font-family-primary',
    FONT_SIZE_BASE: '--font-size-base',
    FONT_SIZE_SM: '--font-size-sm',
    COLOR_PRIMARY: '--color-primary',
    COLOR_SECONDARY: '--color-secondary',
  },
  
  // DOM selectors
  SELECTORS: {
    HEADER_TITLE: '#header-title',
    HERO_TITLE: '#hero-title',
    HERO_DESCRIPTION: '#hero-description',
    NAV_CONTAINER: 'header nav',
    NODE_CANVAS: '#node-network-canvas',
  },
  
  // Event names
  EVENTS: {
    APP_INITIALIZED: 'psychopism:initialized',
    ANIMATION_COMPLETE: 'psychopism:animation-complete',
    PERFORMANCE_WARNING: 'psychopism:performance-warning',
  },
} as const;

export const NOISE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./><? АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя";

export const ANIMATION_SELECTORS = {
  TEXT: [
    '#how-it-works-section p',
    '#feature-section p',
    '#features-list-section .list-item p',
    '#cta-section p',
    '#blog-list-section .list-item p',
    '#system-requirements-section .system-requirements__list li',
    '#faq-section p',
    '#contact-section p',
  ],
  ELEMENTS: [
    '.container.section',
    '.hero',
    '.header',
    '.footer',
    '.system-requirements',
    '.feature',
    '.blog-post',
    '.faq-item',
    '.contact-info',
    '.cta__contribution',
  ],
} as const;

