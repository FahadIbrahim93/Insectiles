export const ENEMY_TYPES: Record<string, any> = {
  beetle: { health: 50, speed: 80, size: 14, damage: 10, score: 10, rendType: 'basic', aiType: 'chase', color: '#2a5c2a', gemColor: '#00ff88' },
  soldier: { health: 100, speed: 60, size: 20, damage: 20, score: 25, rendType: 'soldier', aiType: 'chase', color: '#5c2a2a', gemColor: '#ff6644' },
  wasp: { health: 30, speed: 160, size: 12, damage: 15, score: 20, rendType: 'wasp', aiType: 'chase', color: '#8c7a1a', gemColor: '#ffdd00' },
  scout: { health: 25, speed: 200, size: 10, damage: 8, score: 18, rendType: 'wasp', aiType: 'chase', color: '#aa9900', gemColor: '#ffee44' },
  moth: { health: 40, speed: 100, size: 16, damage: 8, score: 15, rendType: 'moth', aiType: 'chase', color: '#4a3a6a', gemColor: '#cc44ff' },
  spitter: { health: 45, speed: 65, size: 15, damage: 12, score: 22, rendType: 'moth', aiType: 'ranged', color: '#336655', gemColor: '#44ffaa', rangeKeep: 180, fireRate: 2.2 },
  tank: { health: 220, speed: 45, size: 26, damage: 30, score: 40, rendType: 'soldier', aiType: 'chase', color: '#4a1a00', gemColor: '#ff4400' },
  berserker: { health: 70, speed: 130, size: 16, damage: 22, score: 30, rendType: 'soldier', aiType: 'chase', color: '#8a1a1a', gemColor: '#ff2200' },
  shaman: { health: 60, speed: 70, size: 18, damage: 10, score: 35, rendType: 'queen', aiType: 'healer', color: '#2a0060', gemColor: '#aa66ff', healRadius: 130, healRate: 0.8 },
  charger: { health: 80, speed: 90, size: 18, damage: 35, score: 35, rendType: 'soldier', aiType: 'charger', color: '#660011', gemColor: '#ff0033', chargeSpeed: 380, chargeCooldown: 4 },
  phantom: { health: 55, speed: 110, size: 14, damage: 18, score: 45, rendType: 'moth', aiType: 'phantom', color: '#002244', gemColor: '#44ccff', phaseTime: 2.5 },
  hiveMother: { health: 800, speed: 50, size: 40, damage: 40, score: 500, rendType: 'queen', aiType: 'boss', color: '#003322', gemColor: '#00ff88', bossPhases: 2 },
  voidQueen: { health: 1600, speed: 60, size: 50, damage: 55, score: 1200, rendType: 'queen', aiType: 'boss', color: '#1a004a', gemColor: '#aa44ff', bossPhases: 3 },
};

export let enemies: any[] = [];

export function setEnemies(newEnemies: any[]) {
  enemies = newEnemies;
}
