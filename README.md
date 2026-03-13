# Token Movement

A Foundry VTT module that gives GMs full control over token movement animation speed and fog-of-war behavior.

## Features

- **Animation Speed Control** — Choose from multiple animation modes: default, instant (disabled), fixed duration, or percentage of default speed.
- **Distance-Based Speed Scaling** — Short moves animate proportionally faster, with a configurable distance threshold.
- **Suppress Movement Vision** — Prevents the fog of war from being accidentally revealed along a token's movement path. Without this, moving a token across the map can expose areas the players shouldn't see yet, since vision updates on every animation frame. When enabled, vision and light source updates are suppressed mid-animation so that the fog of war is only revealed at the token's final position. This only applies to tokens moved by a GM — player-moved tokens behave normally. Affects tokens with vision as well as tokens that emit light, and accounts for position, elevation, size, and rotation changes.

## Compatibility

Foundry VTT v13+

## License

MIT
