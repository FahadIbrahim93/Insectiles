// ═══════════════════════════════════════════════════════════════════
// INSECTILES: APEX SWARM — GAME STATE MANAGER
// ═══════════════════════════════════════════════════════════════════

import { GameState, GameSession, Player, WaveState, BossState } from '../data/types';
import { CLASSES, DIFFS, DifficultyDef, ClassDef, BossDef, BOSSES } from '../data/constants';

export interface StateTransition {
  from: GameState;
  to: GameState;
  timestamp: number;
}

// ─── Game State Manager ───────────────────────────────────────────────

export class GameStateManager {
  private _state: GameState = 'MENU';
  private _previousState: GameState | null = null;
  private _stateHistory: StateTransition[] = [];
  private _session: GameSession | null = null;
  private _player: Player | null = null;
  private _waveState: WaveState | null = null;
  private _bossState: BossState | null = null;
  private _difficulty: DifficultyDef | null = null;
  private _classDef: ClassDef | null = null;
  private _pausedTime: number = 0;
  private _totalPausedTime: number = 0;
  private _lastTransitionTime: number = 0;

  // Listeners
  private onStateChangeListeners: Array<(prev: GameState, next: GameState) => void> = [];
  private onSessionChangeListeners: Array<(session: GameSession | null) => void> = [];

  // Getters
  get state(): GameState { return this._state; }
  get previousState(): GameState | null { return this._previousState; }
  get session(): GameSession | null { return this._session; }
  get player(): Player | null { return this._player; }
  get wave(): WaveState | null { return this._waveState; }
  get boss(): BossState | null { return this._bossState; }
  get difficulty(): DifficultyDef | null { return this._difficulty; }
  get classDef(): ClassDef | null { return this._classDef; }
  get isPaused(): boolean { return this._state === 'PAUSE'; }
  get isGameOver(): boolean { return this._state === 'GAME_OVER'; }
  get isPlaying(): boolean { return this._state === 'PLAYING' || this._state === 'BOSS'; }

  // State checks
  is(...states: GameState[]): boolean {
    return states.includes(this._state);
  }

  canTransitionTo(target: GameState): boolean {
    const allowed: Record<GameState, GameState[]> = {
      'MENU': ['CLASS_SELECT', 'DIFFICULTY'],
      'DIFFICULTY': ['CLASS_SELECT', 'MENU'],
      'CLASS_SELECT': ['PLAYING', 'DIFFICULTY'],
      'PLAYING': ['BOSS', 'LEVEL_UP', 'PAUSE', 'GAME_OVER'],
      'BOSS': ['LEVEL_UP', 'PLAYING', 'GAME_OVER', 'PAUSE'],
      'LEVEL_UP': ['PLAYING', 'BOSS', 'GAME_OVER'],
      'PAUSE': ['PLAYING', 'BOSS', 'MENU', 'GAME_OVER'],
      'GAME_OVER': ['MENU', 'DIFFICULTY', 'CLASS_SELECT'],
    };
    return allowed[this._state]?.includes(target) ?? false;
  }

  // State transitions
  transition(target: GameState, data?: any): boolean {
    if (!this.canTransitionTo(target)) {
      console.warn(`[State] Cannot transition from ${this._state} to ${target}`);
      return false;
    }

    const prev = this._state;
    this._previousState = prev;
    this._state = target;
    this._lastTransitionTime = Date.now();

    // Record history
    this._stateHistory.push({ from: prev, to: target, timestamp: Date.now() });
    if (this._stateHistory.length > 50) this._stateHistory.shift();

    // Handle transition logic
    this.handleTransition(prev, target, data);

    // Notify listeners
    this.onStateChangeListeners.forEach(fn => fn(prev, target));

    console.log(`[State] ${prev} → ${target}`);
    return true;
  }

  private handleTransition(from: GameState, to: GameState, data?: any): void {
    switch (to) {
      case 'DIFFICULTY':
        break;
      case 'CLASS_SELECT':
        break;
      case 'PLAYING':
        this.startGame(data);
        break;
      case 'BOSS':
        this.startBoss(data);
        break;
      case 'LEVEL_UP':
        this.handleLevelUp(data);
        break;
      case 'PAUSE':
        this._pausedTime = Date.now();
        break;
      case 'GAME_OVER':
        this.endGame(data);
        break;
      case 'MENU':
        this.reset();
        break;
    }

    if (from === 'PAUSE' && to !== 'PAUSE') {
      this._totalPausedTime += Date.now() - this._pausedTime;
    }
  }

  // Game setup
  setDifficulty(diffId: string): void {
    this._difficulty = DIFFS.find(d => d.id === diffId) || DIFFS[0];
  }

  setClass(classId: string): void {
    this._classDef = CLASSES[classId] || CLASSES['mantis'];
  }

  private startGame(data?: any): void {
    if (!this._classDef || !this._difficulty) {
      console.error('[State] Cannot start game without class and difficulty');
      return;
    }

    // Initialize session
    this._session = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      difficulty: this._difficulty,
      classId: this._classDef.name,
      score: 0,
      wavesCompleted: 0,
      enemiesKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      timePlayed: 0,
    };

    // Initialize wave state
    this._waveState = {
      current: 1,
      enemiesRemaining: 0,
      spawned: 0,
      timeRemaining: 0,
      complete: false,
    };

    // Initialize player (basic - will be fully created by game systems)
    this._player = {
      id: 'player',
      type: 'PLAYER',
      classId: this._classDef.name,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 17,
      angle: 0,
      stats: {
        hp: this._classDef.hp,
        maxHp: this._classDef.hp,
        spd: this._classDef.spd,
        dmg: this._classDef.dmg,
        as: this._classDef.as,
        range: this._classDef.range,
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
        xpMult: this._difficulty.xpMult,
        revive: false,
      },
      upgrades: {},
      synergies: {},
      level: 1,
      xp: 0,
      xpToNext: 24,
      hp: this._classDef.hp,
      shield: 0,
      maxShield: 0,
      abilCooldown: 0,
      abilReady: true,
      combo: 0,
      kills: 0,
      damageDealt: 0,
      timeAlive: 0,
      dead: false,
      trail: [],
    };

    console.log(`[Game] Started - Class: ${this._classDef.name}, Diff: ${this._difficulty.name}`);
  }

  private startBoss(bossId: string): void {
    const bossDef = BOSSES.find(b => b.id === bossId);
    if (!bossDef) return;

    this._bossState = {
      def: bossDef,
      hp: bossDef.hp,
      maxHp: bossDef.hp,
      phase: 0,
      state: 'IDLE',
      attackTimer: 0,
      nextAttack: '',
    };

    console.log(`[Boss] Started - ${bossDef.name}`);
  }

  private handleLevelUp(data?: any): void {
    if (!this._player) return;

    this._player.level++;
    this._player.xp = 0;
    // XP to next level formula
    this._player.xpToNext = Math.floor(24 * Math.pow(1.15, this._player.level));
  }

  private endGame(data?: any): void {
    if (!this._session) return;

    this._session.timePlayed = Date.now() - this._session.startTime - this._totalPausedTime;
    console.log(`[Game] Ended - Score: ${this._session.score}, Waves: ${this._session.wavesCompleted}`);
  }

  private reset(): void {
    this._session = null;
    this._player = null;
    this._waveState = null;
    this._bossState = null;
    this._totalPausedTime = 0;
    this._difficulty = null;
    this._classDef = null;
  }

  // Update methods
  updateWave(wave: Partial<WaveState>): void {
    if (this._waveState) {
      this._waveState = { ...this._waveState, ...wave };
    }
  }

  updateBoss(boss: Partial<BossState>): void {
    if (this._bossState) {
      this._bossState = { ...this._bossState, ...boss };
    }
  }

  addScore(points: number): void {
    if (this._session) {
      this._session.score += points;
    }
  }

  // Listeners
  onStateChange(fn: (prev: GameState, next: GameState) => void): void {
    this.onStateChangeListeners.push(fn);
  }

  onSessionChange(fn: (session: GameSession | null) => void): void {
    this.onSessionChangeListeners.push(fn);
  }

  // Debug
  getHistory(): StateTransition[] {
    return [...this._stateHistory];
  }

  debug(): void {
    console.table({
      state: this._state,
      session: this._session ? 'active' : 'none',
      player: this._player ? `HP: ${this._player.hp}/${this._player.stats.maxHp}` : 'none',
      wave: this._waveState?.current || 'none',
      boss: this._bossState?.def.name || 'none',
    });
  }
}

// Singleton
export const GAME_STATE = new GameStateManager();