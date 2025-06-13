/**
 * Animation components export index
 * Central access point for all animation-related components
 */

export { TextAnimation } from './TextAnimation.js';
export { ElementAnimation } from './ElementAnimation.js';

/**
 * Re-export commonly used types for convenience
 */
export type {
  TextAnimationConfig,
  ComponentEvents,
  AnimationCallback
} from '../types/index.js';

export type { ElementAnimationConfig } from './ElementAnimation.js';

