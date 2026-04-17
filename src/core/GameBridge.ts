import { EventEmitter } from 'eventemitter3';

/**
 * Enterprise Standard: GameBridge
 * Decouples the High-Performance Engine from the React UI Layer.
 */
class GameBridge extends EventEmitter {
  public updatePlayer(hp: number, maxHp: number, xp: number, maxXp: number, shield: number, maxSh: number, level: number) {
    this.emit('PLAYER_UPDATE', { hp, maxHp, xp, maxXp, shield, maxSh, level });
  }

  public updateWave(wave: number, timer: string, score: number) {
    this.emit('WAVE_UPDATE', { wave, timer, score });
  }

  public triggerLevelUp(choices: any[]) {
    this.emit('LEVEL_UP', choices);
  }

  public triggerGameOver(stats: any) {
    this.emit('GAME_OVER', stats);
  }

  public triggerBoss(bossData: any) {
    this.emit('BOSS_SPAWN', bossData);
  }
}

export const BRIDGE = new GameBridge();
