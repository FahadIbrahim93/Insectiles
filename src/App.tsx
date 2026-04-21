import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Menu } from './ui/Menu';
import { ClassSelect } from './ui/ClassSelect';
import { Difficulty } from './ui/Difficulty';
import { GameHUD } from './ui/GameHUD';
import { BossHUD } from './ui/BossHUD';
import { LevelUp } from './ui/LevelUp';
import { GameOver } from './ui/GameOver';
import { CLASSES, DIFFS } from './data/constants';
import { GAME_STATE } from './core/GameStateManager';
import { BRIDGE } from './core/GameBridge';
import { Engine } from './core/Engine';
import { makePlayer } from './entities/Player';

type Screen = 'MENU' | 'CLASS_SELECT' | 'DIFFICULTY' | 'PLAYING' | 'BOSS' | 'LEVEL_UP' | 'PAUSE' | 'GAME_OVER';

// ─── Game Canvas ────────────────────────────────────────────────────────────

interface GameCanvasProps {
  onGameStateChange: (state: string) => void;
  playerClass: string;
  difficulty: string;
  gameState: Screen;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onGameStateChange,
  playerClass,
  difficulty,
  gameState,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const containerId = 'pixi-container';
  const [engineReady, setEngineReady] = useState(false);

  // Start engine when entering PLAYING or BOSS screen
  useEffect(() => {
    const shouldRun = gameState === 'PLAYING' || gameState === 'BOSS';
    const hasCanvas = canvasRef.current !== null;

    if (!shouldRun || !hasCanvas) return;

    const startEngine = async () => {
      const engine = new Engine();
      engineRef.current = engine;

      try {
        await engine.init({
          containerId,
          backgroundColor: 0x020408,
        });

        const player = makePlayer(playerClass);
        engine.setPlayer(player);
        engine.start();
        setEngineReady(true);
        console.log('[GameCanvas] PixiJS engine started');
      } catch (err) {
        console.error('[GameCanvas] Engine init failed:', err);
      }
    };

    startEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
        setEngineReady(false);
        console.log('[GameCanvas] PixiJS engine destroyed');
      }
    };
  }, [gameState, playerClass, difficulty]);

  // Listen for game-over events from the bridge
  useEffect(() => {
    const onGameOver = (stats: any) => {
      onGameStateChange('GAME_OVER');
    };
    BRIDGE.on('GAME_OVER', onGameOver);
    return () => {
      BRIDGE.off('GAME_OVER', onGameOver);
    };
  }, [onGameStateChange]);

  return (
    <div
      ref={canvasRef}
      id={containerId}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  );
};

// ─── Main App ────────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<Screen>('MENU');
  const [selectedClass, setSelectedClass] = useState<string>('mantis');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');

  const [playerData, setPlayerData] = useState({
    hp: 100,
    maxHp: 100,
    shield: 0,
    maxShield: 0,
    xp: 0,
    xpToNext: 24,
    level: 1,
    time: 0,
    wave: 1,
    score: 0,
    kills: 0,
    combo: 0,
  });

  const [bossData, setBossData] = useState({
    name: '',
    hp: 0,
    maxHp: 0,
    phase: 0,
  });

  const [upgradeChoices, setUpgradeChoices] = useState<any[]>([]);
  const [finalStats, setFinalStats] = useState({
    score: 0,
    waves: 0,
    kills: 0,
  });

  // Wire GAME_STATE changes into React state
  useEffect(() => {
    const unsub = GAME_STATE.onStateChange((_prev, next) => {
      setGameState(next as Screen);
    });
    return unsub;
  }, []);

  // Forward React state changes back into GAME_STATE so engine stays in sync
  useEffect(() => {
    const handler = (next: Screen) => {
      const stateMap: Partial<Record<Screen, string>> = {
        MENU: 'MENU',
        CLASS_SELECT: 'CLASS_SELECT',
        DIFFICULTY: 'DIFFICULTY',
        PLAYING: 'PLAYING',
        BOSS: 'BOSS',
        LEVEL_UP: 'LEVEL_UP',
        PAUSE: 'PAUSE',
        GAME_OVER: 'GAME_OVER',
      };
      const stateId = stateMap[next];
      if (stateId && !GAME_STATE.is(stateId as any)) {
        GAME_STATE.transition(stateId as any);
      }
    };
    // Sync on mount so initial state matches
    handler(gameState);
  }, [gameState]);

  // Listen for real game updates from Engine via Bridge
  useEffect(() => {
    const onPlayerUpdate = (data: any) =>
      setPlayerData((prev) => ({ ...prev, ...data }));

    const onWaveUpdate = (data: any) =>
      setPlayerData((prev) => ({ ...prev, ...data }));

    const onBossSpawn = (data: any) =>
      setBossData({ name: data.name || 'BOSS', hp: data.hp, maxHp: data.maxHp, phase: data.phase });

    const onLevelUp = (choices: any[]) => {
      setUpgradeChoices(choices);
      setGameState('LEVEL_UP');
    };

    BRIDGE.on('PLAYER_UPDATE', onPlayerUpdate);
    BRIDGE.on('WAVE_UPDATE', onWaveUpdate);
    BRIDGE.on('BOSS_SPAWN', onBossSpawn);
    BRIDGE.on('LEVEL_UP', onLevelUp);

    return () => {
      BRIDGE.off('PLAYER_UPDATE', onPlayerUpdate);
      BRIDGE.off('WAVE_UPDATE', onWaveUpdate);
      BRIDGE.off('BOSS_SPAWN', onBossSpawn);
      BRIDGE.off('LEVEL_UP', onLevelUp);
    };
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    GAME_STATE.setDifficulty(selectedDifficulty);
    GAME_STATE.setClass(selectedClass);
    setGameState('CLASS_SELECT');
  }, [selectedDifficulty, selectedClass]);

  const handleClasses = useCallback(() => {
    setGameState('CLASS_SELECT');
  }, []);

  const handleClassSelect = useCallback((classId: string) => {
    setSelectedClass(classId);
    GAME_STATE.setClass(classId);
    setGameState('DIFFICULTY');
  }, []);

  const handleStartGame = useCallback(() => {
    GAME_STATE.setDifficulty(selectedDifficulty);
    GAME_STATE.setClass(selectedClass);
    GAME_STATE.transition('PLAYING', { classId: selectedClass, diffId: selectedDifficulty });
    setGameState('PLAYING');
  }, [selectedClass, selectedDifficulty]);

  const handlePause = useCallback(() => {
    if (gameState === 'PLAYING' || gameState === 'BOSS') {
      GAME_STATE.transition('PAUSE');
      setGameState('PAUSE');
    } else if (gameState === 'PAUSE') {
      GAME_STATE.transition('PLAYING');
      setGameState('PLAYING');
    }
  }, [gameState]);

  const handleLevelUp = useCallback(() => {
    GAME_STATE.transition('PLAYING');
    setGameState('PLAYING');
  }, []);

  const handleGameOver = useCallback(() => {
    GAME_STATE.transition('GAME_OVER');
    setFinalStats({
      score: playerData.score,
      waves: playerData.wave,
      kills: playerData.kills,
    });
    setGameState('GAME_OVER');
  }, [playerData]);

  const handleRestart = useCallback(() => {
    GAME_STATE.transition('MENU');
    setGameState('MENU');
    setPlayerData({
      hp: 100, maxHp: 100, shield: 0, maxShield: 0,
      xp: 0, xpToNext: 24, level: 1, time: 0,
      wave: 1, score: 0, kills: 0, combo: 0,
    });
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (gameState) {
      case 'MENU':
        return <Menu onStart={handleStart} onClasses={handleClasses} />;

      case 'CLASS_SELECT':
        return (
          <ClassSelect
            classes={CLASSES}
            selected={selectedClass}
            onSelect={handleClassSelect}
            onBack={() => setGameState('MENU')}
          />
        );

      case 'DIFFICULTY':
        return (
          <Difficulty
            difficulties={DIFFS}
            selected={selectedDifficulty}
            onSelect={(diffId: string) => {
              setSelectedDifficulty(diffId);
              handleStartGame();
            }}
            onBack={() => setGameState('CLASS_SELECT')}
          />
        );

      case 'PLAYING':
        return (
          <>
            <GameCanvas
              onGameStateChange={(state) => {
                if (state === 'GAME_OVER') handleGameOver();
              }}
              playerClass={selectedClass}
              difficulty={selectedDifficulty}
              gameState={gameState}
            />
            <GameHUD
              {...playerData}
              abilities={[{ name: 'ABILITY', cooldown: 0, maxCooldown: 5, ready: true }]}
            />
          </>
        );

      case 'BOSS':
        return (
          <>
            <GameCanvas
              onGameStateChange={() => {}}
              playerClass={selectedClass}
              difficulty={selectedDifficulty}
              gameState={gameState}
            />
            <GameHUD {...playerData} abilities={[]} />
            <BossHUD
              name={bossData.name || 'BOSS'}
              hp={bossData.hp}
              maxHp={bossData.maxHp}
              phase={bossData.phase}
            />
          </>
        );

      case 'LEVEL_UP':
        return (
          <LevelUp
            level={playerData.level + 1}
            choices={upgradeChoices}
            onSelect={handleLevelUp}
          />
        );

      case 'GAME_OVER':
        return (
          <GameOver
            score={finalStats.score}
            waves={finalStats.waves}
            kills={finalStats.kills}
            onRestart={handleRestart}
            onMenu={() => setGameState('MENU')}
          />
        );

      case 'PAUSE':
        return (
          <>
            <GameCanvas
              onGameStateChange={() => {}}
              playerClass={selectedClass}
              difficulty={selectedDifficulty}
              gameState={gameState}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
                textAlign: 'center',
                color: '#00ff88',
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>PAUSED</h1>
              <p>Press ESC to resume</p>
            </div>
          </>
        );

      default:
        return <Menu onStart={handleStart} onClasses={handleClasses} />;
    }
  };

  return (
    <div
      id="app"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#020408',
      }}
    >
      {renderContent()}
    </div>
  );
};

// ─── Bootstrap ───────────────────────────────────────────────────────────────

const container = document.getElementById('ui-root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log('[BOOTSTRAP] React App Initialized');
}
