import { registerSettings } from '~/settings';
import { patchAnimationSpeed } from '~/patches/animation';
import { patchMovementVision } from '~/patches/vision';

Hooks.once('init', () => {
  registerSettings();
});

Hooks.once('ready', () => {
  patchAnimationSpeed();
  patchMovementVision();
});
