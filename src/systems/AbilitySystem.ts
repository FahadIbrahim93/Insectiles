import { Player } from '../data/types';
import { Enemy } from '../data/types';
import { CombatSystem } from './CombatSystem';
import { AudioSystem } from './AudioSystem';

export interface AbilityContext {
  player: Player;
  enemies: Enemy[];
  dt: number;
}

export class AbilitySystem {
  constructor(
    private combat: CombatSystem,
    private audio: AudioSystem
  ) {}

  public update(ctx: AbilityContext): void {
    const { player, dt } = ctx;
    
    // Manage cooldowns
    if (player.abilCooldown > 0) player.abilCooldown -= dt;

    // Auto-trigger logic
    if (player.abilCooldown <= 0 && player.abilReady) {
      this.triggerClassAbility(ctx);
    }
  }

  private triggerClassAbility(ctx: AbilityContext): void {
    const { player } = ctx;
    
    switch (player.classId.toUpperCase()) {
      case 'MANTIS':
        this.executeMantisAbility(ctx);
        break;
      case 'SCARAB':
        this.executeScarabAbility(ctx);
        break;
      case 'BEE':
        this.executeBeeAbility(ctx);
        break;
    }
  }

  private executeMantisAbility(ctx: AbilityContext): void {
    const { player, enemies } = ctx;
    player.abilCooldown = 5.0;
    
    const radius = 150;
    this.audio.play('abil');
    
    enemies.forEach(e => {
      if (e.dead) return;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      if (dx * dx + dy * dy < radius * radius) {
        this.combat.damageEnemy(e, player.stats.dmg * 2.5, true);
      }
    });
  }

  private executeScarabAbility(ctx: AbilityContext): void {
    const { player } = ctx;
    player.abilCooldown = 7.0;
    player.shield = Math.min(player.maxHp * 0.5, player.shield + 20);
    this.audio.play('abil');
  }

  private executeBeeAbility(ctx: AbilityContext): void {
    const { player } = ctx;
    player.abilCooldown = 3.0;
    this.audio.play('abil');
  }
}
