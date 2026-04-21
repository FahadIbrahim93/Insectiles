import { Application } from 'pixi.js';
import { GameTicker } from './Ticker';
import { SpatialGrid } from '../systems/SpatialGrid';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderingSystem } from '../systems/RenderingSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { AudioSystem } from '../systems/AudioSystem';
import { InputManager } from '../systems/InputManager';
import { Pool, makeProjectile, resetProjectile, makeGem, resetGem } from '../systems/Pool';
import { Player, getEffectiveDmg } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { GAME_STATE } from './GameStateManager';
import { BRIDGE } from './GameBridge';
import { CLASSES, ENEMIES } from '../data/constants';

export interface EngineConfig {
    containerId: string;
    backgroundColor: number;
}

export class Engine {
    public app!: Application;
    private ticker!: GameTicker;
    private state = GAME_STATE;
    
    // Systems
    private grid = new SpatialGrid<any>(110);
    private renderer!: RenderingSystem;
    private particles!: ParticleSystem;
    private movement!: MovementSystem;
    private combat!: CombatSystem;
    private waves!: WaveSystem;
    private abilities!: AbilitySystem;
    private audio = new AudioSystem();
    private input = new InputManager();

    // Data
    private player: Player | null = null;
    private enemies: Enemy[] = [];
    private obstacles: any[] = [];
    
    // Pools
    private pools = {
        projs: new Pool(makeProjectile, resetProjectile),
        gems: new Pool(makeGem, resetGem),
        nums: new Pool(() => ({}), () => {}),
        parts: new Pool(() => ({}), () => {})
    };

    constructor() {
        this.ticker = new GameTicker(this.update.bind(this));
        this.movement = new MovementSystem(this.grid, this.input);
        this.waves = new WaveSystem(this.state as any, (e) => {
            this.enemies.push(e);
            const edef = ENEMIES[e.enemyType] || ENEMIES['ant'];
            const color = parseInt(edef.col.replace('#', '0x'), 16);
            this.renderer.registerEntity(e.id, color, e.r);
        });
    }

    /**
     * Initialize the PixiJS Application and configure the environment.
     */
    public async init(config: EngineConfig): Promise<void> {
        const container = document.getElementById(config.containerId) as HTMLElement;
        console.log('[Engine.init] Container:', !!container, container?.getBoundingClientRect());

        this.app = new Application();
        await this.app.init({
            resizeTo: container,
            backgroundColor: config.backgroundColor,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true,
        });
        console.log('[Engine.init] App inited, canvas:', this.app.canvas.width, 'x', this.app.canvas.height);

        container.appendChild(this.app.canvas);
        
        this.renderer = new RenderingSystem(this.app);
        this.renderer.createGrid();
        
        this.particles = new ParticleSystem(this.renderer.layers.fx);
        
        this.combat = new CombatSystem(this.grid, this.audio, this.renderer, this.particles, this.pools as any);
        this.abilities = new AbilitySystem(this.combat, this.audio);
        this.audio.init();

        console.log(`[ENGINE] Systems Online | Renderer: ${this.app.renderer.type === 0 ? 'WebGL' : 'WebGPU'}`);
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            // PixiJS auto-resizes, but we can hook into it here for UI recalculations
        });
    }

    /**
     * Start the game loop.
     */
    public start(): void {
        this.app.ticker.add(() => {
            this.ticker.tick(performance.now());
        });
    }

    /**
     * Set the player entity reference after external creation.
     */
    public setPlayer(player: Player): void {
        this.player = player;
        const cls = CLASSES[player.classId] || CLASSES['mantis'];
        const color = parseInt(cls.col.replace('#', '0x'), 16);
        this.renderer.registerEntity('player', color, player.r);
    }

    /**
     * Destroy the engine and release all resources.
     */
    public destroy(): void {
        this.app.destroy(true, { children: true });
        this.input.destroy();
        this.enemies = [];
        this.player = null;
        console.log('[ENGINE] Destroyed');
    }

    private update(dt: number): void {
        if (!this.state.is('PLAYING', 'BOSS')) return;

        if (this.player) {
            const dt60 = dt * 60; // Normalize for systems expecting 1/60th pulse
            
            this.input.update();
            this.movement.updatePlayer(this.player, dt, this.obstacles);
            this.movement.updateEnemies(this.enemies, this.player, dt, this.obstacles);
            this.combat.processPlayerAttacks(this.player, dt);
            this.abilities.update({ player: this.player, enemies: this.enemies, dt });
            this.waves.update(dt, { mHp: 1, mSpd: 1, mXp: 1 }); // Placeholder difficulty
            
            // Push to Bridge
            BRIDGE.updatePlayer(
                this.player.hp, this.player.stats.maxHp, 
                0, 100, // XP logic to be refined
                this.player.shield, this.player.stats.maxHp * 0.5,
                1
            );
            BRIDGE.updateWave(this.waves.currentWave, "00:00", 0);
            
            this.particles.update(dt);
            this.renderer.update(dt, this.player.x, this.player.y);
            
            // Build grid for next frame
            this.grid.clear();
            this.enemies.forEach(e => { 
                if (!e.dead) {
                    this.grid.insert(e);
                    this.renderer.updateEntity(e.id, e.x, e.y); // Port visuals
                }
            });
            this.renderer.updateEntity('player', this.player.x, this.player.y);
        }
    }
}
