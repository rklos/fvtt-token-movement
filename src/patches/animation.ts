import { MODULE_ID } from '~/constants';
import type { AnimationMode } from '~/constants';

const MIN_DURATION_RATIO = 0.3;

function computeDistance(document: TokenDocument, change: TokenDocument.UpdateData): number {
  const newX = (change.x as number | undefined) ?? document.x;
  const newY = (change.y as number | undefined) ?? document.y;
  const dx = newX - document.x;
  const dy = newY - document.y;
  const gridSize = canvas!.grid?.size ?? 100;
  return Math.sqrt(dx * dx + dy * dy) / gridSize;
}

export function patchAnimationSpeed(): void {
  Hooks.on('preUpdateToken', (
    document: TokenDocument,
    change: TokenDocument.UpdateData,
    options: TokenDocument.Database.PreUpdateOptions,
  ) => {
    const mode = game.settings!.get(MODULE_ID, 'animationMode') as AnimationMode;

    if (mode === 'default') return;

    const animationOptions = options as { animation: TokenAnimationBag };

    const speedValue = game.settings!.get(MODULE_ID, 'speedValue');
    const { defaultSpeed } = CONFIG.Token.movement;
    const hasPositionChange = 'x' in change || 'y' in change;
    const distance = hasPositionChange ? computeDistance(document, change) : 0;

    let movementSpeed: number;

    if (mode === 'disabled' || mode === 'fixed') {
      const duration = mode === 'disabled' ? 1 : speedValue;
      // Convert fixed total duration (ms) to movementSpeed (grid spaces/sec)
      // speed = distance / (duration / 1000)
      const effectiveDistance = Math.max(distance, 1);
      movementSpeed = (effectiveDistance * 1000) / duration;
    } else {
      movementSpeed = defaultSpeed * (speedValue / 100);
    }

    const distanceScaling = game.settings!.get(MODULE_ID, 'distanceScaling') as boolean;

    if (distanceScaling && distance > 0) {
      const threshold = game.settings!.get(MODULE_ID, 'distanceThreshold');

      if (distance < threshold) {
        const maxMultiplier = 1 / MIN_DURATION_RATIO;
        const scaleFactor = Math.min(threshold / distance, maxMultiplier);
        movementSpeed *= scaleFactor;
      }
    }

    animationOptions.animation = { ...animationOptions.animation, movementSpeed };
  });
}
