import { lerp, rand, randInt, TAU } from './utils';

export class Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; endSize: number;
  color: string; endColor: string | null;
  gravity: number; drag: number;
  rotation: number; rotSpeed: number;
  shape: string; alpha: number;
  turbulence: number;
  currentSize: number;

  constructor(x: number, y: number, config: any = {}) {
    this.x = x; this.y = y;
    this.vx = config.vx || 0; this.vy = config.vy || 0;
    this.life = config.life || 1; this.maxLife = this.life;
    this.size = config.size || 3; this.endSize = config.endSize || 0;
    this.color = config.color || '#00ff64';
    this.endColor = config.endColor || null;
    this.gravity = config.gravity || 0;
    this.drag = config.drag || 0.98;
    this.rotation = config.rotation || 0;
    this.rotSpeed = config.rotSpeed || 0;
    this.shape = config.shape || 'circle';
    this.alpha = 1;
    this.turbulence = config.turbulence || 0;
    this.currentSize = this.size;
  }

  update(dt: number, gameTime: number) {
    this.life -= dt;
    if (this.life <= 0) return false;
    const t = 1 - this.life / this.maxLife;
    this.vx *= this.drag; this.vy *= this.drag;
    this.vy += this.gravity * dt;
    if (this.turbulence) {
      this.vx += Math.sin(gameTime * 5 + this.x * 0.01) * this.turbulence * dt;
      this.vy += Math.cos(gameTime * 5 + this.y * 0.01) * this.turbulence * dt;
    }
    this.x += this.vx * dt * 60; this.y += this.vy * dt * 60;
    this.rotation += this.rotSpeed * dt;
    this.alpha = Math.pow(1 - t, 0.5);
    this.currentSize = lerp(this.size, this.endSize, t);
    return true;
  }

  draw(cx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (this.alpha <= 0 || this.currentSize <= 0) return;
    cx.save();
    cx.globalAlpha = this.alpha;
    cx.translate(this.x - cameraX, this.y - cameraY);
    cx.rotate(this.rotation);
    if (this.shape === 'circle') {
      cx.beginPath(); cx.arc(0, 0, this.currentSize, 0, TAU);
      cx.fillStyle = this.color; cx.fill();
    } else if (this.shape === 'spark') {
      cx.beginPath();
      cx.moveTo(-this.currentSize * 2, 0);
      cx.lineTo(0, -this.currentSize * 0.3);
      cx.lineTo(this.currentSize * 2, 0);
      cx.lineTo(0, this.currentSize * 0.3);
      cx.closePath();
      cx.fillStyle = this.color; cx.fill();
    } else if (this.shape === 'ring') {
      cx.beginPath(); cx.arc(0, 0, this.currentSize, 0, TAU);
      cx.strokeStyle = this.color; cx.lineWidth = 1.5; cx.stroke();
    } else if (this.shape === 'glow') {
      const g = cx.createRadialGradient(0, 0, 0, 0, 0, this.currentSize);
      g.addColorStop(0, this.color);
      g.addColorStop(1, 'transparent');
      cx.fillStyle = g;
      cx.fillRect(-this.currentSize, -this.currentSize, this.currentSize * 2, this.currentSize * 2);
    }
    cx.restore();
  }
}

export const particles: Particle[] = [];

export function spawnParticles(x: number, y: number, count: number, config: any = {}) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, TAU), spd = rand(config.minSpeed || 1, config.maxSpeed || 4);
    particles.push(new Particle(x + rand(-5, 5), y + rand(-5, 5), {
      vx: Math.cos(a) * spd + (config.vx || 0),
      vy: Math.sin(a) * spd + (config.vy || 0),
      life: rand(config.minLife || 0.3, config.maxLife || 1),
      size: rand(config.minSize || 2, config.maxSize || 5),
      endSize: config.endSize || 0,
      color: config.colors ? config.colors[randInt(0, config.colors.length - 1)] : config.color || '#00ff64',
      gravity: config.gravity || 0,
      drag: config.drag || 0.96,
      shape: config.shape || 'circle',
      rotSpeed: rand(-3, 3),
      turbulence: config.turbulence || 0
    }));
  }
}
