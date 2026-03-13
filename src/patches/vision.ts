import { MODULE_ID } from '~/constants';

type TokenInstance = InstanceType<typeof foundry.canvas.placeables.Token>;

interface TokenProtoPatchable {
  _onUpdate(changed: Record<string, unknown>, options: Record<string, unknown>, userId: string): void;
  _onAnimationUpdate(changed: Token.PartialAnimationData, context: Token.AnimationContext): void;
}

const suppressedTokens = new Set<string>();

function isVisionAffected(token: TokenInstance, changed: Record<string, unknown>): boolean {
  if (!token.document.sight.enabled) return false;
  return 'x' in changed || 'y' in changed || 'elevation' in changed;
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

    if (suppress && isVisionAffected(this, changed)) {
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
  };

  Hooks.on('updateToken', (document: TokenDocument) => {
    suppressedTokens.delete(document.id!);
  });
}
