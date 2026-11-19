import { random } from '../../utils/random';

export interface Point {
  x: number;
  y: number;
}

export interface Particle extends Point {
  vx: number;
  vy: number;
  /** Direction (radians) the logo steers towards; it turns a little at random so the drift meanders. */
  heading: number;
  /** Parallax layer: smaller, fainter and slower (0.6) up to full size (1). */
  depth: number;
}

export interface Link {
  from: Point;
  to: Point;
  /** 0 (about to disappear) to 1 (touching). */
  strength: number;
}

export interface Field {
  width: number;
  height: number;
  margin: number;
  speed: number;
  /** Frames at 30 FPS since the last step; 0 freezes the motion. */
  dt: number;
  pointer?: Point;
}

const DRAG = 0.02;
/** Largest random turn per frame, in radians. */
const TURN = 0.12;
const CRUISE = 3;
const EDGE_STIFFNESS = 0.002;
/** Logos start turning away from an edge this many logo sizes before reaching it. */
const EDGE_ZONE = 2;
const EDGE_TURN = 0.15;
const MAGNET_RADIUS = 220;
/** Logos hover this far from the cursor: closer repels, farther attracts. */
const MAGNET_HOLD = 70;
const MAGNET_FORCE = 0.3;

export const createParticles = ({ width, height, margin }: Field, count: number): Particle[] =>
  Array.from({ length: count }, () => ({
    x: random(margin, Math.max(width - margin, margin + 1)),
    y: random(margin, Math.max(height - margin, margin + 1)),
    vx: 0,
    vy: 0,
    heading: random(0, Math.PI * 2),
    depth: random(0.6, 1),
  }));

/** How far (negative: before the near edge, positive: past the far edge) a value is inside the edge zone. */
const edgeDepth = (value: number, zone: number, max: number) =>
  Math.max(zone - value, 0) - Math.max(value - (max - zone), 0);

/** Turns the heading towards the inside of the canvas, more the deeper the logo is in the edge zone. */
const steerInward = (heading: number, inward: Point, zone: number, dt: number) => {
  const difference = Math.atan2(inward.y, inward.x) - heading;
  const wrapped = Math.atan2(Math.sin(difference), Math.cos(difference));
  const depth = Math.min(Math.hypot(inward.x, inward.y) / zone, 1);
  return heading + wrapped * depth * EDGE_TURN * dt;
};

/** Pulls logos in towards the cursor and keeps them from collapsing onto it. */
const magnet = (particle: Particle, pointer?: Point): Point => {
  const dx = (pointer?.x ?? particle.x) - particle.x;
  const dy = (pointer?.y ?? particle.y) - particle.y;
  const distance = Math.hypot(dx, dy);
  const reach = pointer && distance < MAGNET_RADIUS ? 1 - distance / MAGNET_RADIUS : 0;
  const pull = (MAGNET_FORCE * ((distance - MAGNET_HOLD) / MAGNET_RADIUS) * reach) / Math.max(distance, 1);
  return { x: dx * pull, y: dy * pull };
};

export const stepParticle = (particle: Particle, field: Field): Particle => {
  const { width, height, margin, speed, dt, pointer } = field;
  const pull = magnet(particle, pointer);
  const zone = margin * EDGE_ZONE;
  const inward = { x: edgeDepth(particle.x, zone, width), y: edgeDepth(particle.y, zone, height) };
  const heading = steerInward(particle.heading + random(-1, 1) * TURN * dt, inward, zone, dt);
  const thrust = DRAG * speed * CRUISE * particle.depth;
  const ax = thrust * Math.cos(heading) + EDGE_STIFFNESS * inward.x + pull.x;
  const ay = thrust * Math.sin(heading) + EDGE_STIFFNESS * inward.y + pull.y;
  const vx = particle.vx + (ax - particle.vx * DRAG) * dt;
  const vy = particle.vy + (ay - particle.vy * DRAG) * dt;

  return {
    ...particle,
    heading,
    vx,
    vy,
    x: Math.min(Math.max(particle.x + vx * dt, 0), width),
    y: Math.min(Math.max(particle.y + vy * dt, 0), height),
  };
};

/** Lines between logos (and the cursor) that are close enough, fading out with distance. */
export const createLinks = (points: Point[], maxDistance: number): Link[] =>
  points
    .flatMap((from, index) => points.slice(index + 1).map((to) => ({ from, to })))
    .map(({ from, to }) => ({ from, to, strength: 1 - Math.hypot(from.x - to.x, from.y - to.y) / maxDistance }))
    .filter(({ strength }) => strength > 0);

export const linkDistance = (width: number, height: number, count: number) =>
  Math.max(140, Math.sqrt((width * height) / Math.max(count, 1)) * 1.1);

export const magnetRadius = MAGNET_RADIUS;
