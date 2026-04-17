# Insectiles Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        ENGINE                               │
├─────────────────────────────────────────────────────────────┤
│  ECS (Entity Component System)                              │
│  ├── Entity: Unique ID + Components                         │
│  ├── Component: Data (Position, Velocity, Health, etc)      │
│  └── System: Logic (Movement, Collision, Spawning)          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐           ┌─────────┐           ┌─────────┐
   │PLAYER   │           │ ENEMY   │           │PROJECTILE│
   │Systems  │           │Systems  │           │Systems   │
   └─────────┘           └─────────┘           └─────────┘
```

## Core Modules

### 1. Engine (src/core/Engine.ts)
- **Responsibility:** Initialize game, manage game loop, handle canvas
- **API:** `init()`, `start()`, `stop()`, `getCanvas()`

### 2. ECS (src/core/ECS.ts)
- **Responsibility:** Manage entities, components, and systems
- **API:** `createEntity()`, `addComponent()`, `addSystem()`, `update()`

### 3. Ticker (src/core/Ticker.ts)
- **Responsibility:** Fixed timestep game loop
- **API:** `start()`, `stop()`, `onTick(callback)`

## Entities

| Entity | Components | Description |
|--------|------------|--------------|
| Player | Position, Velocity, Health, XP, Shield, Class, Abilities | Main character |
| Enemy | Position, Velocity, Health, Type, AI | Wave enemies |
| Boss | Position, Velocity, Health, Phase, Abilities | Boss battles |
| Projectile | Position, Velocity, Damage, Owner | Player/enemy shots |
| Particle | Position, Velocity, Life, Color | Visual effects |

## Systems

| System | Purpose |
|--------|---------|
| MovementSystem | Update position based on velocity |
| CollisionSystem | Detect and handle entity collisions |
| SpawnSystem | Handle enemy wave spawning |
| CombatSystem | Process damage, death, HP changes |
| UISystem | Update HUD, menus, health bars |
| LevelUpSystem | Handle XP threshold, upgrade choices |
| ComboSystem | Track and decay combo multiplier |

## Data Structures

### Insect Class (src/data/classes.ts)
```typescript
interface InsectClass {
  id: string;
  name: string;
  role: 'Striker' | 'Tank' | 'Support' | 'Assassin';
  icon: string;
  abilities: string[];
  stats: {
    health: number;
    speed: number;
    damage: number;
    shield: number;
  };
}
```

### Wave Configuration (src/data/waves.ts)
```typescript
interface Wave {
  waveNumber: number;
  enemies: EnemySpawn[];
  boss?: BossConfig;
  spawnRate: number;
}
```

## Rendering Pipeline

1. **Clear** - Clear canvas with background color
2. **Entities** - Render all entities (back to front)
3. **Particles** - Render visual effects
4. **UI** - Render HUD and overlays

## Input Handling

- **Keyboard:** WASD for movement
- **Mouse:** Aim and shoot
- **Touch:** Virtual joystick (mobile)

## Performance Targets

- 60 FPS on modern browsers
- Max 500 entities on screen
- Object pooling for projectiles/particles

---

*Architecture v1.0 - Last updated 2026-04-18*