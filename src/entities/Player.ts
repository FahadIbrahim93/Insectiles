import { Player as PlayerType, createDefaultPlayerStats } from '../data/types';
import { CLASSES, WORLD_W, WORLD_H } from '../data/constants';

export function makePlayer(id: string): PlayerType {
  const def = CLASSES[id] || CLASSES['mantis'];
  return {
    id: 'player',
    type: 'PLAYER',
    classId: id,
    x: WORLD_W / 2,
    y: WORLD_H / 2,
    vx: 0,
    vy: 0,
    r: 17,
    angle: 0,
    stats: createDefaultPlayerStats(def),
    upgrades: {},
    synergies: {},
    level: 1,
    xp: 0,
    xpToNext: 24,
    hp: def.hp,
    shield: 0,
    maxShield: 0,
    abilCooldown: 0,
    abilReady: true,
    combo: 0,
    kills: 0,
    damageDealt: 0,
    timeAlive: 0,
    dead: false,
  };
}

export function getEffectiveDmg(p: PlayerType): number {
  return p.stats.dmg * p.stats.dmgMult;
}

export function getEffectiveSpd(p: PlayerType): number {
  return p.stats.spd * p.stats.spdMult;
}

export function getEffectiveAS(p: PlayerType): number {
  return p.stats.as * p.stats.asMult;
}
