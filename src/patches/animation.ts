import { MODULE_ID } from '~/constants';
import type { AnimationMode } from '~/constants';

export function patchAnimationSpeed(): void {
  Hooks.on('preUpdateToken', (
    document: TokenDocument,
    change: TokenDocument.UpdateData,
    options: TokenDocument.Database.PreUpdateOptions,
  ) => {
    const mode = game.settings!.get(MODULE_ID, 'animationMode') as AnimationMode;

    if (mode === 'default') return;

    const animationOptions = options as { animation: TokenAnimationBag };

    if (mode === 'disabled') {
      animationOptions.animation = { duration: 0 };
      return;
    }

    const speedValue = game.settings!.get(MODULE_ID, 'speedValue');
    const { defaultSpeed } = CONFIG.Token.movement;

    let movementSpeed: number;

    if (mode === 'fixed') {
      movementSpeed = 1000 / speedValue;
    } else {
      movementSpeed = defaultSpeed * (speedValue / 100);
    }

    const distanceScaling = game.settings!.get(MODULE_ID, 'distanceScaling') as boolean;

    if (distanceScaling && ('x' in change || 'y' in change)) {
      const threshold = game.settings!.get(MODULE_ID, 'distanceThreshold');
      const newX = (change.x as number | undefined) ?? document.x;
      const newY = (change.y as number | undefined) ?? document.y;
      const dx = newX - document.x;
      const dy = newY - document.y;
      const gridSize = canvas!.grid?.size ?? 100;
      const distance = Math.sqrt(dx * dx + dy * dy) / gridSize;

      if (distance > 0 && distance < threshold) {
        const MIN_DURATION_RATIO = 0.3;
        const maxMultiplier = 1 / MIN_DURATION_RATIO;
        const scaleFactor = Math.min(threshold / distance, maxMultiplier);
        movementSpeed *= scaleFactor;
      }
    }

    animationOptions.animation = { ...animationOptions.animation, movementSpeed };
  });
}
