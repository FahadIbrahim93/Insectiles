import { Enemy, makeEnemy } from '../entities/Enemy';
import { ENEMIES, BOSSES, WORLD_W, WORLD_H, WAVES } from '../data/constants';
import { GameStateManager } from '../core/GameStateManager';
import { BRIDGE } from '../core/GameBridge';

export class WaveSystem {
  public currentWave = 1;
  public waveTime = 0;
  public spawnTimer = 0;
  public killCount = 0;
  
  public isBossPhase = false;
  private isPreWave = true;
  private preWaveTimer = 3;

  constructor(
    private state: GameStateManager,
    private onSpawn: (e: any) => void
  ) {}

  public update(dt: number, difficulty: any): void {
    if (!this.state.is('PLAYING', 'BOSS')) return;
    if (this.isBossPhase) return;

    if (this.isPreWave) {
      this.preWaveTimer -= dt;
      if (this.preWaveTimer <= 0) {
        this.isPreWave = false;
      }
      return;
    }

    this.waveTime += dt;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnEnemy(difficulty);
      this.spawnTimer = Math.max(0.2, 1.2 - (this.waveTime * 0.01));
    }

    // Complete wave after roughly 30s for demo
    if (this.waveTime >= 30) {
      this.completeWave();
    }
  }

  private spawnEnemy(diff: any): void {
    let x, y;
    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? -50 : WORLD_W + 50;
      y = Math.random() * WORLD_H;
    } else {
      x = Math.random() * WORLD_W;
      y = Math.random() > 0.5 ? -50 : WORLD_H + 50;
    }

    // Pick random enemy from constants
    const types = Object.keys(ENEMIES);
    const typeId = types[Math.floor(Math.random() * types.length)];
    
    const e = makeEnemy(typeId, x, y);
    e.hp *= (diff.mHp || 1);
    
    this.onSpawn(e);
  }

  private completeWave(): void {
    this.currentWave++;
    this.waveTime = 0;
    this.spawnTimer = 0;
    this.isPreWave = true;
    this.preWaveTimer = 3;
    
    // Notify Bridge
    BRIDGE.updatePlayer(100, 100, 0, 100, 0, 50, this.currentWave);
    this.state.transition('LEVEL_UP');
  }
}
