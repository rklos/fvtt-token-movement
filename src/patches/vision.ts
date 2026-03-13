import { MODULE_ID } from '~/constants';

type TokenInstance = InstanceType<typeof foundry.canvas.placeables.Token>;

export function patchMovementVision(): void {
  const TokenProto = foundry.canvas.placeables.Token.prototype;
  // eslint-disable-next-line @typescript-eslint/unbound-method -- intentionally capturing for prototype patching
  const originalAnimate = TokenProto.animate;

  TokenProto.animate = async function animate(
    this: TokenInstance,
    to: Token.PartialAnimationData,
    options?: Token.AnimateOptions,
  ): Promise<void> {
    const suppress = game.settings!.get(MODULE_ID, 'suppressMovementVision') as boolean;

    if (!suppress || !this.document.sight.enabled) {
      return originalAnimate.call(this, to, options);
    }

    const visionSource = this.vision;
    const hadActiveVision = visionSource?.active ?? false;

    if (hadActiveVision && visionSource) {
      visionSource.remove();
    }

    try {
      return await originalAnimate.call(this, to, options);
    } finally {
      if (hadActiveVision) {
        this.initializeSources();
        canvas!.perception.update({ refreshVision: true, refreshLighting: true });
      }
    }
  };
}
