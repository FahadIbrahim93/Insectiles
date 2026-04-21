import { Enemy as EnemyType } from '../data/types';
import { ENEMIES } from '../data/constants';

export type { Enemy } from '../data/types';

export function makeEnemy(typeId: string, x: number, y: number): EnemyType {
  const def = ENEMIES[typeId] || ENEMIES['ant'];
  return {
    id: `e_${Math.random().toString(36).substr(2, 9)}`,
    type: 'ENEMY',
    enemyType: typeId,
    x, y,
    vx: 0, vy: 0,
    r: def.r,
    hp: def.hp,
    maxHp: def.hp,
    dmg: def.dmg,
    xp: def.xp,
    sc: def.xp,
    elite: false,
    ranged: def.ranged || false,
    targetId: 'player',
    state: 'CHASE',
    stunTime: 0,
    poison: 0,
    dead: false,
    sepX: 0,
    sepY: 0,
    spd: def.spd,
    wobble: 0,
    wobbleSpd: 1.5 + Math.random() * 1.5,
  };
}
