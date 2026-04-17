import test from 'node:test';
import assert from 'node:assert/strict';
import { applyUpgradeToPlayer, type UpgradeTarget } from './upgradeEffects';
import type { UpgradeDefinition } from './upgrades';

function createPlayer(): UpgradeTarget {
  return {
    attackDamage: 25,
    speed: 220,
    maxHp: 100,
    hp: 60,
    attackRate: 0.25,
    attackRange: 80,
    abilities: [
      { cooldown: 2, maxCooldown: 5 },
      { cooldown: 0, maxCooldown: 8 },
    ],
  };
}

function mkUpgrade(id: string, value: number): UpgradeDefinition {
  return {
    id,
    value,
    icon: 'x',
    name: 'test',
    desc: 'test',
    maxLevel: 1,
    rarity: 'common',
    costs: [100],
  };
}

test('applies damage upgrade', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('dmg_1', 10));
  assert.equal(p.attackDamage, 35);
});

test('applies speed upgrade', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('spd_1', 20));
  assert.equal(p.speed, 240);
});

test('applies hp upgrade to max and current hp', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('hp_1', 20));
  assert.equal(p.maxHp, 120);
  assert.equal(p.hp, 80);
});

test('applies attack rate upgrade with minimum floor', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('rate_1', 0.9));
  assert.equal(p.attackRate, 0.05);
});

test('applies range upgrade', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('range_1', 20));
  assert.equal(p.attackRange, 100);
});

test('heal upgrade is capped at max hp', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('heal_1', 100));
  assert.equal(p.hp, 100);
});

test('cooldown upgrade updates ability max cooldown and caps current cooldown', () => {
  const p = createPlayer();
  applyUpgradeToPlayer(p, mkUpgrade('cooldown_1', 0.1));

  assert.deepEqual(p.abilities, [
    { cooldown: 2, maxCooldown: 4.5 },
    { cooldown: 0, maxCooldown: 7.2 },
  ]);
});
