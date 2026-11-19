import aleaRandom from 'alea-random';

/**
 * Random number between `min` and `max` (inclusive).
 * Floating point by default, integer when `integer` is true.
 */
export const random = (min: number, max: number, integer = false): number =>
  aleaRandom(min, max, !integer);
