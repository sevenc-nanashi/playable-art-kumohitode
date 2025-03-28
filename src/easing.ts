export const easeOutQuad = (t: number) => t * (2 - t);
export const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeOutCubic = (t: number) => --t * t * t + 1;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const easeOutQuart = (t: number) => 1 - --t * t * t * t;
export const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

export const clip = (value: number, min: number = 0, max: number = 1) =>
  Math.min(max, Math.max(min, value));

export const rightClip = (value: number, max: number = 1) =>
  Math.min(max, value);

export const leftClip = (value: number, min: number = 0) =>
  Math.max(min, value);

export const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

export const unlerp = (start: number, end: number, value: number) =>
  (value - start) / (end - start);
