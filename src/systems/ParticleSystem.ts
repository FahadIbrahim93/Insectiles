import { Container, Graphics } from 'pixi.js';
import { Pool } from './Pool';

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: number;
  size: number;
  alpha: number;
  active: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private pool: Pool<Particle>;
  private container = new Container();

  constructor(parent: Container) {
    parent.addChild(this.container);
    
    this.pool = new Pool<Particle>(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, color: 0, size: 0, alpha: 1, active: false }),
      (p) => { p.active = false; }
    );
  }

  public spawn(x: number, y: number, color: number, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      const p = this.pool.get();
      const angle = Math.random() * Math.PI * 2;
      const force = 50 + Math.random() * 150;
      
      p.x = x; p.y = y;
      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;
      p.life = 0.5 + Math.random() * 0.5;
      p.maxLife = p.life;
      p.color = color;
      p.size = 2 + Math.random() * 4;
      p.alpha = 1;
      p.active = true;
      
      this.particles.push(p);
    }
  }

  public update(dt: number): void {
    const g = new Graphics();
    this.container.removeChildren();
    this.container.addChild(g);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95; // Friction
      p.vy *= 0.95;
      p.life -= dt;
      p.alpha = p.life / p.maxLife;

      if (p.life <= 0) {
        p.active = false;
        this.pool.release(p);
        this.particles.splice(i, 1);
        continue;
      }

      g.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
    }
  }
}
