import { Player, getEffectiveDmg, getEffectiveAS } from '../entities/Player';
import { Enemy } from '../data/types';
import { SpatialGrid } from './SpatialGrid';
import { AudioSystem } from './AudioSystem';
import { RenderingSystem } from './RenderingSystem';
import { ParticleSystem } from './ParticleSystem';
import { Pool, Projectile, Gem } from './Pool';
import { CRIT_MULT, COLL_R } from '../data/constants';

export class CombatSystem {
  // Use a local timer for player attacks instead of mutating entity directly
  private playerAttackTimer = 0;

  constructor(
    private grid: SpatialGrid<any>,
    private audio: AudioSystem,
    private renderer: RenderingSystem,
    private particles: ParticleSystem,
    private pools: {
      projs: Pool<Projectile>,
      nums: Pool<any>,
      parts: Pool<any>,
      gems: Pool<Gem>
    }
  ) {}

  public processPlayerAttacks(p: any, dt: number): void {
    this.playerAttackTimer -= dt;
    if (this.playerAttackTimer <= 0) {
      const target = this.findNearestEnemy(p, p.stats.range);
      if (target) {
        this.playerAttackTimer = 1 / getEffectiveAS(p);
        this.executeAttack(p, target);
      }
    }
  }

  private executeAttack(p: any, target: Enemy): void {
    const isCrit = Math.random() < p.stats.critChance;
    const baseDmg = getEffectiveDmg(p);
    const dmg = isCrit ? baseDmg * CRIT_MULT : baseDmg;
    
    // Simplification for port: melee vs ranged logic
    this.meleeHit(p, target, dmg, isCrit);
  }

  private meleeHit(p: any, e: Enemy, dmg: number, isCrit: boolean): void {
    this.damageEnemy(e, dmg, isCrit);
  }

  public damageEnemy(e: Enemy, dmg: number, isCrit: boolean): void {
    if (e.dead) return;
    
    e.hp -= dmg;
    this.renderer.flashEntity(e.id);
    this.renderer.spawnFloaty(e.x, e.y, Math.round(dmg).toString(), isCrit ? '#ffd700' : '#fff');
    this.particles.spawn(e.x, e.y, 0x00ff88, isCrit ? 8 : 4);
    
    this.audio.play(isCrit ? 'crit' : 'hit');
    
    if (e.hp <= 0) {
      this.killEnemy(e);
    }
  }

  private killEnemy(e: Enemy): void {
    if (e.dead) return;
    e.dead = true;
    
    // Spawn Gems
    const g = this.pools.gems.get();
    g.x = e.x; g.y = e.y; g.value = e.xp; g.color = e.elite ? '#ffd700' : '#00ff88';
    g.r = e.elite ? 7 : 5;
    g.collected = false;
    
    this.audio.play('death');
  }

  private findNearestEnemy(p: any, range: number): Enemy | null {
    let best: Enemy | null = null;
    let bDistSq = range * range;
    
    const candidates = this.grid.query(p.x, p.y, range);
    for (const e of candidates) {
      if (e.dead) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < bDistSq) {
        bDistSq = dSq;
        best = e;
      }
    }
    return best;
  }
}
