# Insectiles: Apex Swarm — Project Context

## 1. PROJECT OVERVIEW

**Insectiles: Apex Swarm** is a browser-based survival roguelite game by Hope Theory (@hopetheory__). Players control insectoid characters through procedurally generated waves, leveling up with tactical upgrade choices.

**Status:** Alpha — PixiJS 8 game engine fully wired. WASD movement, enemy AI, camera follow, grid rendering, wave system. Gameplay functional.

**Tech Stack:**
- TypeScript 6.x + Vite 8.x (build)
- React 19.x (UI layer)
- PixiJS 8.x (game engine — excluded from build due to import errors)
- GSAP 3.x (animation)
- Vercel (deployment)

**Live URL:** https://insectiles.vercel.app

---

## 2. KEY FILES

```
src/
├── App.tsx              # Main state machine + screen router
├── ui/
│   ├── Menu.tsx         # Main menu
│   ├── ClassSelect.tsx  # Character class selection
│   ├── Difficulty.tsx   # Difficulty picker
│   ├── GameHUD.tsx      # In-game vitals display (HP/XP/Shield/Level)
│   ├── BossHUD.tsx      # Boss health bar
│   ├── LevelUp.tsx      # Upgrade selection overlay
│   ├── GameOver.tsx     # Death screen + stats
│   └── Theme.tsx        # Design tokens (colors, fonts)
├── data/
│   └── constants.ts    # Classes, difficulties, upgrades data
├── core/                # PixiJS 8 game engine
│   ├── Engine.ts        # Game loop, entity management, state
│   ├── GameBridge.ts    # React ↔ Engine bidirectional bridge
│   ├── GameStateManager.ts  # Singleton game state + events
│   ├── Ticker.ts        # Fixed timestep game ticker
│   └── types.ts         # Shared TypeScript interfaces
├── entities/
│   ├── Player.ts        # Player entity with stats, abilities, trail
│   └── Enemy.ts         # Enemy with flocking AI, death pool
└── systems/
    ├── RenderingSystem.ts   # PixiJS 8 Graphics rendering, camera
    ├── MovementSystem.ts   # Player movement + enemy AI
    ├── WaveSystem.ts       # Wave spawning, difficulty scaling
    ├── CollisionSystem.ts  # Circle-circle collision detection
    ├── ParticleSystem.ts   # Death particles, upgrade sparkles
    └── Pool.ts             # Object pooling for enemies
```

**Entry Points:**
- `src/App.tsx` — React root, game state routing
- `src/ui/GameHUD.tsx` — Player stats overlay (HP, XP, Shield, Level, Score, Wave)
- `src/ui/LevelUp.tsx` — Upgrade selection modal

---

## 3. CONVENTIONS

**Code Style:**
- Functional React components with explicit `React.FC` typing
- Inline styles with Theme constants (no CSS modules yet)
- CamelCase for components/functions, kebab-case avoided in JSX props

**Naming:**
- Screen components: PascalCase (Menu, GameOver, LevelUp)
- Hooks: camelCase with use prefix
- Constants/data: SCREAMING_SNAKE_CASE

**State Management:**
- Local React state in App.tsx for game flow
- GAME_STATE stub object (no-op) for future engine integration
- BRIDGE object for engine → React communication (currently unused)

**Testing:**
- Manual browser testing via `npm run dev`
- No unit tests yet
- tsconfig `strict: true` enforced

---

## 4. DEPLOYMENT

**Platform:** Vercel
**Auto-deploy:** On push to main branch
**Build Command:** `npm run build` (tsc + vite build)
**Output:** `dist/` directory

**Aliases:**
- Primary: https://insectiles.vercel.app
- Vercel project: `insectiles-7lswxpjbr-hopetheorybd-2156s-projects`

**Environment:** No environment variables currently needed.

---

## 5. KNOWN ISSUES & NEXT STEPS

**Done:**
- ✅ PixiJS 8 engine fully wired to React
- ✅ WASD movement with InputManager
- ✅ Enemy AI (flocking/separation behavior)
- ✅ Camera follows player
- ✅ Wave spawning system
- ✅ Collision detection (damage + death)
- ✅ Particle effects (death bursts, upgrade sparkles)
- ✅ Game state → React HUD sync

**To do:**
- [ ] Mobile touch controls
- [ ] Boss wave system
- [ ] Sound/music integration
- [ ] Leaderboard persistence (Supabase)
- [ ] Settings screen
- [ ] Leaderboard screen
- [ ] Pause actually pauses game logic
- [ ] Upgrade system wired to actual player stats

---

## 6. QUALITY BAR

**Target:** 9.5/10

- Zero placeholder comments in production paths
- All screens fully functional, no dead UI elements
- PixiJS engine integrated and rendering at 60fps
- Smooth state transitions with GSAP animations
- Mobile-responsive touch controls
- Sound design and music integration
- Leaderboard persistence (Supabase/Firebase)

**Anti-Loop Safeguards:**
- Max 20 tool calls per session
- If stuck on same action 3x, stop and report
- Each PR: one focused change, tested before continuing
- Keep CLAUDE.md updated when project structure changes

---

## 7. KEY COMMANDS

- `npm run dev` — start dev server (use Windows cmd.exe for Node.js compatibility)
- `npm run build` — production build
- `npx tsc --noEmit` — type check

**Dev server from WSL:** `cmd.exe /c "cd /d H:\DevJourney\Projects\Insectiles && npm run dev"`
**Git push from WSL:** `cmd.exe /c "cd /d H:\DevJourney\Projects\Insectiles && git push"` (WSL git lacks GitHub credentials — use Windows git via cmd.exe)

---

## 8. COMMON PITFALLS

### Camera starts at (0,0)
Player starts at (1600, 1600). If camera initializes at (0,0), everything renders off-screen for ~10 frames. Always initialize camera to `WORLD_W/2, WORLD_H/2`.

### InputManager.update() must be called every frame
The movement system reads from `input.state`, which is only populated by `InputManager.update()`. Without this call in Engine.update(), the player cannot move.

### Grid rendering — use PixiJS v8 Graphics API
```typescript
// Correct:
g.moveTo(x1, y1).lineTo(x2, y2).stroke({ color: 0x00ff88, alpha: 0.04, width: 1 });
// Wrong (v7 API):
g.lineStyle(1, 0x00ff88, 0.04); g.moveTo(x1, y1); g.lineTo(x2, y2);
```

### PIXI v8 resizeTo captures 0x0 if container hasn't been laid out
PIXI v8's `resizeTo: container` uses ResizeObserver internally, which fires on *changes* — not initial layout. If the container hasn't been painted yet, canvas ends up 0x0. Fix: use explicit `width`/`height` + CSS `position: absolute; width: 100%; height: 100%` on the canvas element after init.

### Double createRoot() crashes React
Both `main.ts` and `App.tsx` calling `createRoot()` on `#ui-root` causes: "createRoot() on a container that has already been passed to createRoot()". Only `main.ts` should bootstrap — `App.tsx` should export the component only.

### Debugging canvas sizing
Use puppeteer headless browser to get concrete DOM data: `canvas.width`, `canvas.height`, `getBoundingClientRect()`. A 0x0 canvas is the #1 cause of "game screen blank but no errors".
