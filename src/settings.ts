import { MODULE_ID } from '~/constants';

export function registerSettings(): void {
  game.settings!.register(MODULE_ID, 'animationMode', {
    name: `${MODULE_ID}.settings.animationMode.name`,
    hint: `${MODULE_ID}.settings.animationMode.hint`,
    scope: 'world',
    config: true,
    type: String,
    default: 'default',
    choices: {
      default: `${MODULE_ID}.settings.animationMode.default`,
      disabled: `${MODULE_ID}.settings.animationMode.disabled`,
      fixed: `${MODULE_ID}.settings.animationMode.fixed`,
      percentage: `${MODULE_ID}.settings.animationMode.percentage`,
    },
  });

  game.settings!.register(MODULE_ID, 'speedValue', {
    name: `${MODULE_ID}.settings.speedValue.name`,
    hint: `${MODULE_ID}.settings.speedValue.hint`,
    scope: 'world',
    config: true,
    type: Number,
    default: 100,
    range: {
      min: 1,
      max: 2000,
      step: 1,
    },
  });

  game.settings!.register(MODULE_ID, 'distanceScaling', {
    name: `${MODULE_ID}.settings.distanceScaling.name`,
    hint: `${MODULE_ID}.settings.distanceScaling.hint`,
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings!.register(MODULE_ID, 'distanceThreshold', {
    name: `${MODULE_ID}.settings.distanceThreshold.name`,
    hint: `${MODULE_ID}.settings.distanceThreshold.hint`,
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
    range: {
      min: 1,
      max: 50,
      step: 1,
    },
  });

  game.settings!.register(MODULE_ID, 'suppressMovementVision', {
    name: `${MODULE_ID}.settings.suppressMovementVision.name`,
    hint: `${MODULE_ID}.settings.suppressMovementVision.hint`,
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
}
