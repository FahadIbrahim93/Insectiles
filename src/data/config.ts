// ═══════════════════════════════════════════════════════════════════
// INSECTILES: APEX SWARM — GAME CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

import { createDefaultSettings, GameSettings } from './types';

export interface GameConfig {
  debug: boolean;
  devTools: boolean;
  showFps: boolean;
  timeScale: number;
}

export interface EngineConfig {
  width: number;
  height: number;
  backgroundColor: number;
  resolution: number;
  antialias: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
}

export interface RenderConfig {
  pixelRatio: number;
  maxParticles: number;
  maxProjectiles: number;
  maxGems: number;
  effects: {
    bloom: boolean;
    chromaticAberration: boolean;
    screenShake: boolean;
    screenFlash: boolean;
  };
}

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
}

export interface NetworkConfig {
  enabled: boolean;
  apiUrl: string;
  saveInterval: number;
}

// ─── Default Configurations ─────────────────────────────────────────

export const DEFAULT_GAME_CONFIG: GameConfig = {
  debug: false,
  devTools: false,
  showFps: false,
  timeScale: 1,
};

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  width: 1280,
  height: 720,
  backgroundColor: 0x020408,
  resolution: 1,
  antialias: true,
  powerPreference: 'high-performance',
};

export const DEFAULT_RENDER_CONFIG: RenderConfig = {
  pixelRatio: 1,
  maxParticles: 500,
  maxProjectiles: 200,
  maxGems: 100,
  effects: {
    bloom: true,
    chromaticAberration: false,
    screenShake: true,
    screenFlash: true,
  },
};

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  masterVolume: 1,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  ambientVolume: 0.3,
};

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  enabled: false,
  apiUrl: '',
  saveInterval: 30000,
};

// ─── Configuration Manager ───────────────────────────────────────────

export class ConfigManager {
  private game: GameConfig;
  private engine: EngineConfig;
  private render: RenderConfig;
  private audio: AudioConfig;
  private network: NetworkConfig;
  private settings: GameSettings;

  constructor() {
    this.game = { ...DEFAULT_GAME_CONFIG };
    this.engine = { ...DEFAULT_ENGINE_CONFIG };
    this.render = { ...DEFAULT_RENDER_CONFIG };
    this.audio = { ...DEFAULT_AUDIO_CONFIG };
    this.network = { ...DEFAULT_NETWORK_CONFIG };
    this.settings = createDefaultSettings();
  }

  // Getters
  getGame(): GameConfig { return this.game; }
  getEngine(): EngineConfig { return this.engine; }
  getRender(): RenderConfig { return this.render; }
  getAudio(): AudioConfig { return this.audio; }
  getNetwork(): NetworkConfig { return this.network; }
  getSettings(): GameSettings { return this.settings; }

  // Setters
  setGame(config: Partial<GameConfig>): void {
    this.game = { ...this.game, ...config };
  }

  setEngine(config: Partial<EngineConfig>): void {
    this.engine = { ...this.engine, ...config };
  }

  setRender(config: Partial<RenderConfig>): void {
    this.render = { ...this.render, ...config };
  }

  setAudio(config: Partial<AudioConfig>): void {
    this.audio = { ...this.audio, ...config };
  }

  setNetwork(config: Partial<NetworkConfig>): void {
    this.network = { ...this.network, ...config };
  }

  setSettings(settings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  // Load/Save
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('insectiles_config');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.settings) this.settings = { ...this.settings, ...data.settings };
        if (data.game) this.game = { ...this.game, ...data.game };
        if (data.audio) this.audio = { ...this.audio, ...data.audio };
      }
    } catch (e) {
      console.warn('[Config] Failed to load from storage:', e);
    }
  }

  saveToStorage(): void {
    try {
      const data = {
        settings: this.settings,
        game: this.game,
        audio: this.audio,
      };
      localStorage.setItem('insectiles_config', JSON.stringify(data));
    } catch (e) {
      console.warn('[Config] Failed to save to storage:', e);
    }
  }

  // Apply settings to configs
  applySettings(): void {
    this.audio.musicVolume = this.settings.musicVolume;
    this.audio.sfxVolume = this.settings.sfxVolume;
    this.game.showFps = this.settings.showFps;
    this.render.effects.screenShake = this.settings.screenShake;
  }

  // Graphics preset
  setGraphicsPreset(preset: 'low' | 'medium' | 'high'): void {
    this.settings.graphics = preset;
    
    switch (preset) {
      case 'low':
        this.render.pixelRatio = 0.75;
        this.render.maxParticles = 200;
        this.render.maxProjectiles = 100;
        this.render.effects.bloom = false;
        this.engine.antialias = false;
        break;
      case 'medium':
        this.render.pixelRatio = 1;
        this.render.maxParticles = 350;
        this.render.maxProjectiles = 150;
        this.render.effects.bloom = true;
        this.engine.antialias = true;
        break;
      case 'high':
        this.render.pixelRatio = window.devicePixelRatio || 1;
        this.render.maxParticles = 500;
        this.render.maxProjectiles = 200;
        this.render.effects.bloom = true;
        this.engine.antialias = true;
        break;
    }
  }

  // Debug mode
  enableDebug(): void {
    this.game.debug = true;
    this.game.devTools = true;
    this.game.showFps = true;
  }
}

// Singleton instance
export const CONFIG = new ConfigManager();