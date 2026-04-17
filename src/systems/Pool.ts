// ═══════════════════════════════════════════════════════════════════
// OBJECT POOL — Zero-allocation recycling for hot-path objects
// ═══════════════════════════════════════════════════════════════════

export class Pool<T> {
  private free: T[] = [];

  constructor(
    private readonly factory: () => T,
    private readonly reset: (obj: T) => void,
    initialSize = 64,
  ) {
    for (let i = 0; i < initialSize; i++) this.free.push(factory());
  }

  get(): T {
    return this.free.length > 0 ? this.free.pop()! : this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.free.push(obj);
  }
}

// ─── Pool-able entity types ────────────────────────────────────────

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  col: string; sz: number; life: number; maxLife: number; active: boolean;
}
export function makeParticle(): Particle {
  return { x:0, y:0, vx:0, vy:0, col:'#fff', sz:3, life:0, maxLife:0.5, active:false };
}
export function resetParticle(p: Particle): void { p.active = false; }

export interface DamageNumber {
  x: number; y: number; vy: number; val: number;
  col: string; life: number; maxLife: number; crit: boolean; active: boolean;
}
export function makeDamageNumber(): DamageNumber {
  return { x:0, y:0, vy:0, val:0, col:'#fff', life:0, maxLife:1.1, crit:false, active:false };
}
export function resetDamageNumber(d: DamageNumber): void { d.active = false; }

export interface Projectile {
  x: number; y: number; vx: number; vy: number;
  dmg: number; col: string; r: number;
  owner: 'player' | 'enemy';
  poison: number; life: number;
  trail: Array<{x:number;y:number}>;
  active: boolean;
}
export function makeProjectile(): Projectile {
  return { x:0, y:0, vx:0, vy:0, dmg:0, col:'#fff', r:5, owner:'player', poison:0, life:0, trail:[], active:false };
}
export function resetProjectile(p: Projectile): void { p.active = false; p.trail.length = 0; }

export interface Gem {
  x: number; y: number; val: number; col: string; r: number; bob: number; active: boolean;
}
export function makeGem(): Gem {
  return { x:0, y:0, val:0, col:'#0f5', r:5, bob:0, active:false };
}
export function resetGem(g: Gem): void { g.active = false; }
