export const WORLD_SIZE = 4000;
export const TAU = Math.PI * 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
export const dist = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
export const angle = (x1: number, y1: number, x2: number, y2: number) => Math.atan2(y2 - y1, x2 - x1);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));

export function seededRand(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function hsl(h: number, s: number, l: number, a = 1) { return `hsla(${h},${s}%,${l}%,${a})`; }
export function rgb(r: number, g: number, b: number, a = 1) { return `rgba(${r},${g},${b},${a})`; }

export const Log = (() => {
  const PREFIX = '[INSECTILES]';
  const VERBOSE = false;
  return {
    info(scope: string, msg: string, data?: any) {
      if (!VERBOSE) return;
      console.info(`${PREFIX} [${scope}]`, msg, data !== undefined ? data : '');
    },
    warn(scope: string, msg: string, data?: any) {
      console.warn(`${PREFIX} [${scope}]`, msg, data !== undefined ? data : '');
    },
    error(scope: string, msg: string, err?: any) {
      console.error(`${PREFIX} [${scope}]`, msg, err !== undefined ? err : '');
    },
  };
})();
