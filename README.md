# Insectiles

A browser-based top-down survival action game where you control insect heroes, survive escalating enemy waves, and scale your build through upgrades.

## Current status

This project is playable and includes core gameplay loops (movement, attacking, waves, class selection, upgrades, and basic persistence), but it is still in active refinement.

## Tech stack

- React 19 + TypeScript
- Vite 6
- Firebase (Auth + Firestore)
- Canvas rendering for real-time gameplay

## Prerequisites

- Node.js 20+ (recommended)
- npm
- Firebase project config values available in `firebase-applet-config.json`

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the app at:
   - `http://localhost:3000` (or the host URL shown by Vite)

## Build and type-check

```bash
npm run build
npm run lint
```

## Controls

### Desktop

- Move: `W A S D` or arrow keys
- Aim: mouse cursor
- Attack: hold left mouse button
- Toggle auto-attack: `Tab`
- Use ability: `Q` (depends on selected class and cooldown state)

### Mobile / touch

- Left side: virtual joystick movement
- Right side: touch fire zone for aiming/attacking

## Game flow overview

1. App initializes auth state and game engine.
2. Player lands on title/class selection.
3. `startGame` resets state and begins wave progression.
4. During play, HUD updates from engine state.
5. On level-up, game pauses for upgrade selection, then resumes.
6. On game over, score/wave are shown and high score can be saved for signed-in users.

## Project structure

```text
src/
  App.tsx             # Main UI and game-screen orchestration
  firebase.ts         # Firebase initialization + auth/firestore exports
  store.ts            # User data load/save helpers
  game/
    engine.ts         # Main loop, input handling, combat/waves
    player.ts         # Hero classes and player model
    enemies.ts        # Enemy definitions and lifecycle state
    upgrades.ts       # Upgrade definitions and rarity/synergy metadata
    renderer.ts       # Canvas rendering implementation
    particles.ts      # Visual effects state/helpers
    audio.ts          # SFX and audio helper logic
    utils.ts          # Math and utility helpers
```

## Known limitations (as of 2026-04-17)

- `App.tsx` currently owns too many responsibilities (UI state + game orchestration + some domain logic).
- Several systems still rely on loose typing and `any`, increasing refactor risk.
- Automated tests for deterministic gameplay logic are not yet in place.

## Recommended next engineering steps

1. Extract upgrade application logic into a typed game-domain module.
2. Add unit tests for upgrade effects and edge cases.
3. Reduce direct DOM manipulation patterns in React components.
4. Introduce CI checks for type safety and tests.

## Session accomplishments (2026-04-17)

- Replaced template project docs with game-specific contributor documentation.
- Extracted upgrade application into `src/game/upgradeEffects.ts` and wired `App.tsx` to use typed upgrade handling.
- Added upgrade effect tests (`npm run test:upgrades`) covering core stat-change behavior and edge-case caps/floors.
- Fixed TypeScript issues that previously blocked linting and ensured `npm run lint` / `npm run build` succeed.
- Removed unused dependencies (`@google/genai`, `dotenv`, `express`, `@types/express`, `lucide-react`, `motion`) and removed an unused React import from `engine.ts`.
