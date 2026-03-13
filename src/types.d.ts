import type { AnimationMode } from '~/constants';

/** Augment the global SettingConfig to register this module's settings. */
declare global {
  interface SettingConfig {
    'token-movement.animationMode': AnimationMode;
    'token-movement.speedValue': number;
    'token-movement.distanceScaling': boolean;
    'token-movement.distanceThreshold': number;
    'token-movement.suppressMovementVision': boolean;
  }

  /** Animation fields we write into the preUpdateToken options bag. */
  interface TokenAnimationBag {
    duration?: number;
    movementSpeed?: number;
  }
}
