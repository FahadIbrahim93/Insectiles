import type { UpgradeDefinition } from './upgrades';

export interface UpgradeAbility {
  cooldown: number;
  maxCooldown: number;
}

export interface UpgradeTarget {
  attackDamage: number;
  speed: number;
  maxHp: number;
  hp: number;
  attackRate: number;
  attackRange: number;
  abilities?: UpgradeAbility[];
}

const MIN_ATTACK_RATE = 0.05;

export function applyUpgradeToPlayer(target: UpgradeTarget, upgrade: UpgradeDefinition): void {
  if (upgrade.id.startsWith('dmg_')) {
    target.attackDamage += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('spd_')) {
    target.speed += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('hp_')) {
    target.maxHp += upgrade.value;
    target.hp += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('rate_')) {
    target.attackRate = Math.max(MIN_ATTACK_RATE, target.attackRate * (1 - upgrade.value));
    return;
  }

  if (upgrade.id.startsWith('range_')) {
    target.attackRange += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('heal_')) {
    target.hp = Math.min(target.maxHp, target.hp + upgrade.value);
    return;
  }

  if (upgrade.id.startsWith('cooldown_') && target.abilities) {
    target.abilities = target.abilities.map((ability) => {
      const nextMaxCooldown = Math.max(0.25, ability.maxCooldown * (1 - upgrade.value));
      return {
        ...ability,
        maxCooldown: nextMaxCooldown,
        cooldown: Math.min(ability.cooldown, nextMaxCooldown),
      };
    });
  }
}
