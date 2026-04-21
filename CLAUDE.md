# Insectiles: Apex Swarm — Project Context

## 1. PROJECT OVERVIEW

**Insectiles: Apex Swarm** is a browser-based survival roguelite game by Hope Theory (@hopetheory__). Players control insectoid characters through procedurally generated waves, leveling up with tactical upgrade choices.

**Status:** Alpha — UI shell built, PixiJS game engine NOT yet wired. The state machine and HUD are functional; actual gameplay rendering is stubbed.

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
├── core/                # ⚠️ EXCLUDED from build — PixiJS engine stub
│   ├── Engine.ts
│   ├── GameStateManager.ts
│   └── ...
├── entities/
│   ├── Player.ts        # ⚠️ EXCLUDED
│   └── Enemy.ts         # ⚠️ EXCLUDED
└── systems/             # ⚠️ EXCLUDED
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

## 5. CURRENT BLOCKERS

1. **PixiJS Engine NOT Wired** — src/core, entities, systems excluded from tsconfig to prevent build errors. Actual game rendering is a blank canvas.

2. **No Game Loop** — GameCanvas component is a placeholder. The `setTimeout` hack simulates "PLAYING" state but doesn't render enemies/waves.

3. **Upgrade System is Mock** — LevelUp choices are hardcoded arrays, not connected to actual player stats modifications.

4. **Missing UI Screens** — Leaderboard and Settings screens referenced but not implemented.

5. **Pause State** — Pause overlay shows but doesn't actually pause game logic.

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
