// ═══════════════════════════════════════════════════════════════════
// INSECTILES: APEX SWARM — TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

import { ClassDef, EnemyTypeDef, BossDef, UpgradeDef, DifficultyDef } from './constants';

// ─── Core Game Types ─────────────────────────────────────────────────

export type GameState = 'MENU' | 'CLASS_SELECT' | 'DIFFICULTY' | 'PLAYING' | 'BOSS' | 'LEVEL_UP' | 'PAUSE' | 'GAME_OVER';

export type EntityType = 'PLAYER' | 'ENEMY' | 'PROJECTILE' | 'GEM' | 'OBSTACLE' | 'PARTICLE';

// ─── Player Types ────────────────────────────────────────────────────

export interface PlayerStats {
  hp: number;
  maxHp: number;
  spd: number;
  dmg: number;
  as: number;
  range: number;
  critChance: number;
  critMult: number;
  lifesteal: number;
  thorns: number;
  regen: number;
  gemMagnet: number;
  aoeRadius: number;
  multiStrike: number;
  poisonDps: number;
  bonusHp: number;
  dmgMult: number;
  spdMult: number;
  asMult: number;
  cdMult: number;
  xpMult: number;
  revive: boolean;
}

export interface PlayerUpgradeState {
  [key: string]: number;
}

export interface PlayerSynergies {
  [key: string]: boolean;
}

export interface Player {
  id: string;
  type: 'PLAYER';
  classId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  stats: PlayerStats;
  upgrades: PlayerUpgradeState;
  synergies: PlayerSynergies;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  shield: number;
  maxShield: number;
  abilCooldown: number;
  abilReady: boolean;
  combo: number;
  kills: number;
  damageDealt: number;
  timeAlive: number;
  dead: boolean;
}

// ─── Enemy Types ──────────────────────────────────────────────────────

export interface Enemy {
  id: string;
  type: 'ENEMY';
  enemyType: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
  maxHp: number;
  dmg: number;
  xp: number;
  sc: number;
  elite: boolean;
  ranged: boolean;
  targetId: string | null;
  state: 'IDLE' | 'CHASE' | 'ATTACK' | 'STUNNED' | 'DEAD';
  stunTime: number;
  poison: number;
  dead: boolean;
}

// ─── Projectile Types ────────────────────────────────────────────────

export type ProjectileOwner = 'PLAYER' | 'ENEMY';

export interface Projectile {
  id: string;
  type: 'PROJECTILE';
  owner: ProjectileOwner;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  dmg: number;
  pierce: number;
  poison: number;
  life: number;
  dead: boolean;
}

// ─── Collectible Types ────────────────────────────────────────────────

export interface Gem {
  id: string;
  type: 'GEM';
  x: number;
  y: number;
  r: number;
  value: number;
  color: string;
  life: number;
  collected: boolean;
}

// ─── Particle Types ──────────────────────────────────────────────────

export interface Particle {
  id: string;
  type: 'PARTICLE';
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  dead: boolean;
}

// ─── Wave Types ──────────────────────────────────────────────────────

export interface WaveSpawn {
  type: string;
  count: number;
  interval: number;
  delay: number;
}

export interface Wave {
  wave: number;
  spawns: WaveSpawn[];
  boss?: string;
  duration: number;
}

export interface WaveState {
  current: number;
  enemiesRemaining: number;
  spawned: number;
  timeRemaining: number;
  complete: boolean;
}

// ─── Game Session Types ─────────────────────────────────────────────

export interface GameSession {
  id: string;
  startTime: number;
  difficulty: DifficultyDef;
  classId: string;
  score: number;
  wavesCompleted: number;
  enemiesKilled: number;
  damageDealt: number;
  damageTaken: number;
  timePlayed: number;
}

// ─── UI Types ────────────────────────────────────────────────────────

export interface HUDData {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  xp: number;
  xpToNext: number;
  level: number;
  time: number;
  wave: number;
  score: number;
  kills: number;
  combo: number;
  abilities: AbilityHUD[];
}

export interface AbilityHUD {
  name: string;
  cooldown: number;
  maxCooldown: number;
  ready: boolean;
}

export interface UpgradeChoice {
  upgrade: UpgradeDef;
  level: number;
  description: string;
}

// ─── Boss Types ──────────────────────────────────────────────────────

export interface BossState {
  def: BossDef;
  hp: number;
  maxHp: number;
  phase: number;
  state: 'IDLE' | 'ATTACK' | 'SPECIAL' | 'DEAD';
  attackTimer: number;
  nextAttack: string;
}

// ─── Input Types ─────────────────────────────────────────────────────

export interface InputState {
  moveUp: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  aimX: number;
  aimY: number;
  shoot: boolean;
  ability: boolean;
  pause: boolean;
}

// ─── Save/Load Types ───────────────────────────────────────────────

export interface SaveData {
  version: string;
  session: GameSession;
  player: Player;
  upgrades: PlayerUpgradeState;
  settings: GameSettings;
  unlocked: string[];
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  showFps: boolean;
  fullscreen: boolean;
  graphics: 'low' | 'medium' | 'high';
}

// ─── Factory Functions ───────────────────────────────────────────────

export function createDefaultPlayerStats(classDef: ClassDef): PlayerStats {
  return {
    hp: classDef.hp,
    maxHp: classDef.hp,
    spd: classDef.spd,
    dmg: classDef.dmg,
    as: classDef.as,
    range: classDef.range,
    critChance: 0.12,
    critMult: 2.2,
    lifesteal: 0,
    thorns: 0,
    regen: 0,
    gemMagnet: 60,
    aoeRadius: 0,
    multiStrike: 0,
    poisonDps: 0,
    bonusHp: 0,
    dmgMult: 1,
    spdMult: 1,
    asMult: 1,
    cdMult: 1,
    xpMult: 1,
    revive: false,
  };
}

export function createDefaultSettings(): GameSettings {
  return {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    screenShake: true,
    showFps: false,
    fullscreen: false,
    graphics: 'high',
  };
}