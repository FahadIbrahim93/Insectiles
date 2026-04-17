# INSECTILES: Apex Swarm Edition

A sci-fi cyberpunk browser-based survival game where you command insectoid warriors against endless waves of enemies.

## 🚀 Tech Stack
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Framework:** React 18
- **Game Rendering:** PixiJS v8

## 🎮 Game Features
- 5 unique insect classes (Mantis, Scarab, Black Widow, Wasp, Moth)
- 3 difficulty levels (Normal, Hard, Nightmare)
- Wave-based combat with boss battles
- Level-up system with upgrades and synergies
- Combo and score tracking

## 🏗️ Project Structure
```
src/
├── core/           # Engine, State Machine, Ticker
├── data/           # Types, Constants, Config
├── entities/       # Player, Enemy definitions
├── systems/        # Game systems (Combat, Movement, etc)
├── ui/             # React UI screens
│   ├── Menu.tsx
│   ├── ClassSelect.tsx
│   ├── Difficulty.tsx
│   ├── GameHUD.tsx
│   ├── BossHUD.tsx
│   ├── LevelUp.tsx
│   ├── GameOver.tsx
│   └── Theme.ts
├── style/          # CSS styling
├── App.tsx         # Main React App
└── main.ts         # Entry point
```

## 🛠️ Development
### Setup
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📋 Game Flow
```
MENU → CLASS_SELECT → DIFFICULTY → PLAYING → (Level Up / Boss) → GAME_OVER
```

## 🎨 Visual Design
- Cyberpunk aesthetic with neon green (#00ff88) accents
- Dark background (#020408)
- Custom fonts: Orbitron (titles), Share Tech Mono (body)

## 📜 Legacy
The original prototype is preserved in [`legacy/proto.html`](./legacy/proto.html).

---
**Built with Principal Engineer 9.5+ quality standards**