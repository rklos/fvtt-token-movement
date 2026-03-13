import { MODULE_ID } from '~/constants';

type TokenInstance = InstanceType<typeof foundry.canvas.placeables.Token>;

interface TokenProtoPatchable {
  _isVisionSource(): boolean;
  _onUpdate(changed: Record<string, unknown>, options: Record<string, unknown>, userId: string): void;
  _onAnimationUpdate(changed: Token.PartialAnimationData, context: Token.AnimationContext): void;
}

const suppressedTokens = new Set<string>();

function isVisionAffected(token: TokenInstance, changed: Record<string, unknown>): boolean {
  const proto = token as unknown as TokenProtoPatchable;
  if (!proto._isVisionSource()) return false;

  const positionChanged = 'x' in changed || 'y' in changed;
  const elevationChanged = 'elevation' in changed;
  const sizeChanged = 'width' in changed || 'height' in changed;
  const rotationChanged = 'rotation' in changed && token.hasLimitedSourceAngle;

  return positionChanged || elevationChanged || sizeChanged || rotationChanged;
}

function getClientStorage(): Storage {
  return (game.settings!.storage as unknown as Map<string, Storage>).get('client')!;
}

export function patchMovementVision(): void {
  const proto = foundry.canvas.placeables.Token.prototype as unknown as TokenProtoPatchable;

  // eslint-disable-next-line @typescript-eslint/unbound-method -- intentionally capturing for prototype patching
  const originalOnUpdate = proto._onUpdate;

  proto._onUpdate = function _onUpdate(
    this: TokenInstance,
    changed: Record<string, unknown>,
    options: Record<string, unknown>,
    userId: string,
  ): void {
    const suppress = game.settings!.get(MODULE_ID, 'suppressMovementVision') as boolean;

    if (suppress && game.user!.id === userId && isVisionAffected(this, changed)) {
      suppressedTokens.add(this.document.id!);
    }

    return originalOnUpdate.call(this as unknown as TokenProtoPatchable, changed, options, userId);
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method -- intentionally capturing for prototype patching
  const originalOnAnimationUpdate = proto._onAnimationUpdate;

  proto._onAnimationUpdate = function _onAnimationUpdate(
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

    if (context.time >= context.duration) {
      suppressedTokens.delete(this.document.id!);
    }
  };
}
