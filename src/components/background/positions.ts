import { random } from '../../utils/random';

export interface PositionOptions {
  width: number;
  height: number;
  imageSize: number;
  speed: number;
  speedTolerance: number;
}

export interface Position {
  speed: number;
  imageSize: number;
  maxWidth: number;
  maxHeight: number;
  velocityX: number;
  velocityY: number;
  previousX?: number;
  previousY?: number;
  readonly x: number;
  readonly y: number;
}

type PositionState = Omit<Position, 'x' | 'y'>;

const directedVelocity = (current: number | undefined, magnitude: number) => {
  if (current === undefined) {
    return random(0, 2) > 1 ? -magnitude : magnitude;
  }
  return current < 0 ? -magnitude : magnitude;
};

const bounce = (
  previous: number | undefined,
  velocity: number,
  size: number,
  max: number
) => {
  const next = (previous || random(size, max, true)) + velocity;
  const overflow = next > max ? next - max : 0;
  const reflectedVelocity = overflow > 0 ? -velocity : velocity;
  const reflected = next - 2 * overflow;
  const underflow = reflected - size < 0 ? reflected - size : 0;
  return {
    value: reflected - underflow,
    velocity: underflow < 0 ? -reflectedVelocity : reflectedVelocity,
  };
};

/** Applies (new) dimensions and speed to a position, keeping its direction. */
export const configurePosition = <T extends Partial<PositionState>>(
  position: T,
  { width, height, imageSize, speed, speedTolerance }: PositionOptions
): T & PositionState =>
  Object.assign(position, {
    speed,
    imageSize,
    maxWidth: width,
    maxHeight: height,
    velocityX: directedVelocity(
      position.velocityX,
      speed * random(1 - speedTolerance, 1 + speedTolerance)
    ),
    velocityY: directedVelocity(
      position.velocityY,
      speed * random(1 - speedTolerance, 1 + speedTolerance)
    ),
  });

/** A position that moves (and bounces off the edges) every time x and y are read. */
export const createPosition = (options: PositionOptions): Position => {
  const state = configurePosition<Partial<PositionState>>({}, options) as PositionState;

  return Object.defineProperties(state, {
    x: {
      enumerable: true,
      get: () => {
        const result = bounce(state.previousX, state.velocityX, state.imageSize, state.maxWidth);
        state.velocityX = result.velocity;
        state.previousX = result.value;
        return result.value;
      },
    },
    y: {
      enumerable: true,
      get: () => {
        const result = bounce(state.previousY, state.velocityY, state.imageSize, state.maxHeight);
        state.velocityY = result.velocity;
        state.previousY = result.value;
        return result.value;
      },
    },
  }) as Position;
};
