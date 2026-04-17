import { WORLD_W, WORLD_H, PLAYER_R } from '../data/constants';
import { Player, getEffectiveSpd } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { InputManager } from './InputManager';
import { SpatialGrid } from './SpatialGrid';

export class MovementSystem {
  constructor(
    private grid: SpatialGrid<any>,
    private input: InputManager
  ) {}

  updatePlayer(p: Player, dt: number, obstacles: any[]): void {
    const vec = this.input.getMoveVector();
    const spd = getEffectiveSpd(p);
    
    let nx = p.x + vec.mx * spd * dt;
    let ny = p.y + vec.my * spd * dt;

    // Obstacle Collision
    const oc = this.checkObstacles(nx, ny, PLAYER_R, obstacles);
    if (oc) {
      nx += oc.nx * oc.overlap;
      ny += oc.ny * oc.overlap;
    }

    // World Bounds
    p.x = Math.max(20, Math.min(WORLD_W - 20, nx));
    p.y = Math.max(20, Math.min(WORLD_H - 20, ny));

    if (vec.mx !== 0 || vec.my !== 0) {
      p.angle = Math.atan2(vec.my, vec.mx);
    }

    // Trail logic
    p.trail.unshift({ x: p.x, y: p.y });
    if (p.trail.length > 10) p.trail.pop();
  }

  updateEnemies(enemies: Enemy[], p: Player, dt: number, obstacles: any[]): void {
    // Separation Phase (O(N) via Grid)
    for (const e of enemies) {
      if (e.dead) continue;
      e.sepX = 0;
      e.sepY = 0;
      const neighbors = this.grid.query(e.x, e.y, e.r * 2.8);
      for (const n of neighbors) {
        if (n === e || n.dead) continue;
        const dx = e.x - n.x;
        const dy = e.y - n.y;
        const dSq = dx * dx + dy * dy || 1;
        if (dSq < (e.r + n.r + 2) ** 2) {
          const d = Math.sqrt(dSq);
          e.sepX += (dx / d) * 38;
          e.sepY += (dy / d) * 38;
        }
      }
    }

    // Steering & Integration Phase
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const distSq = dx * dx + dy * dy || 1;
      const d = Math.sqrt(distSq);
      
      const stopR = e.ranged ? 255 : 0;
      
      if (d > stopR) {
        e.vx = (dx / d) * e.spd + e.sepX;
        e.vy = (dy / d) * e.spd + e.sepY;
      } else {
        e.vx *= 0.85;
        e.vy *= 0.85;
      }

      let nx = e.x + e.vx * dt;
      let ny = e.y + e.vy * dt;

      const oc = this.checkObstacles(nx, ny, e.r, obstacles);
      if (oc) {
        nx += oc.nx * (oc.overlap + 0.5);
        ny += oc.ny * (oc.overlap + 0.5);
      }

      e.x = Math.max(10, Math.min(WORLD_W - 10, nx));
      e.y = Math.max(10, Math.min(WORLD_H - 10, ny));
      
      e.wobble += e.wobbleSpd * dt;
    }
  }

  private checkObstacles(px: number, py: number, pr: number, obstacles: any[]) {
    for (const o of obstacles) {
      const dx = px - o.x;
      const dy = py - o.y;
      const dSq = dx * dx + dy * dy;
      const rSum = o.r + pr + 2;
      if (dSq < rSum * rSum) {
        const d = Math.sqrt(dSq);
        const nx = dx / (d || 1);
        const ny = dy / (d || 1);
        const overlap = rSum - d;
        return { nx, ny, overlap };
      }
    }
    return null;
  }
}
