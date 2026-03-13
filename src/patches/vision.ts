import { MODULE_ID } from '~/constants';

type TokenInstance = InstanceType<typeof foundry.canvas.placeables.Token>;

interface TokenProtoPatchable {
  _isVisionSource(): boolean;
  _isLightSource(): boolean;
  _onUpdate(changed: Record<string, unknown>, options: Record<string, unknown>, userId: string): void;
  _onAnimationUpdate(changed: Token.PartialAnimationData, context: Token.AnimationContext): void;
  initializeSources(): void;
}

const suppressedTokens = new Set<string>();

function getClientStorage(): Storage {
  return (game.settings!.storage as unknown as Map<string, Storage>).get('client')!;
}

export function patchMovementVision(): void {
  const tokenClass = CONFIG.Token.objectClass as unknown as { prototype: TokenProtoPatchable };

  // eslint-disable-next-line @typescript-eslint/unbound-method -- intentionally capturing for prototype patching
  const originalOnUpdate = tokenClass.prototype._onUpdate;

  tokenClass.prototype._onUpdate = function _onUpdate(
    this: TokenInstance,
    changed: Record<string, unknown>,
    options: Record<string, unknown>,
    userId: string,
  ): void {
    const suppress = game.settings!.get(MODULE_ID, 'suppressMovementVision') as boolean;

    const mover = game.users!.get(userId);
    if (suppress && mover?.isGM) {
      const positionChanged = 'x' in changed || 'y' in changed;
      const elevationChanged = 'elevation' in changed;
      const sizeChanged = 'width' in changed || 'height' in changed;
      const rotationChanged = 'rotation' in changed && this.hasLimitedSourceAngle;
      const perspectiveChanged = positionChanged || elevationChanged || sizeChanged || rotationChanged;
      const visionChanged = perspectiveChanged && this.hasSight;
      const lightChanged = perspectiveChanged
        && (this as unknown as TokenProtoPatchable)._isLightSource();

      if (visionChanged || lightChanged) {
        suppressedTokens.add(this.document.id!);
      }
    }

    return originalOnUpdate.call(this as unknown as TokenProtoPatchable, changed, options, userId);
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method -- intentionally capturing for prototype patching
  const originalOnAnimationUpdate = tokenClass.prototype._onAnimationUpdate;

  tokenClass.prototype._onAnimationUpdate = function _onAnimationUpdate(
    this: TokenInstance,
    changed: Token.PartialAnimationData,
    context: Token.AnimationContext,
  ): void {
    if (!suppressedTokens.has(this.document.id!)) {
      originalOnAnimationUpdate.call(this as unknown as TokenProtoPatchable, changed, context);
      return;
    }

    const clientStorage = getClientStorage();
    const stored = clientStorage.getItem('core.visionAnimation');
    clientStorage.setItem('core.visionAnimation', 'false');

    originalOnAnimationUpdate.call(this as unknown as TokenProtoPatchable, changed, context);

    if (stored !== null) {
      clientStorage.setItem('core.visionAnimation', stored);
    } else {
      clientStorage.removeItem('core.visionAnimation');
    }

    // On the final frame, initialize sources ourselves since Foundry's
    // post-animation fallback only triggers if visionAnimation was false
    // at the start of _onUpdate, not temporarily during animation frames.
    if (context.time >= context.duration) {
      suppressedTokens.delete(this.document.id!);
      (this as unknown as TokenProtoPatchable).initializeSources();
    }
  };
}
