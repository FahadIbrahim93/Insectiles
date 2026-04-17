import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Menu } from './ui/Menu';
import { ClassSelect } from './ui/ClassSelect';
import { Difficulty } from './ui/Difficulty';
import { GameHUD } from './ui/GameHUD';
import { BossHUD } from './ui/BossHUD';
import { LevelUp } from './ui/LevelUp';
import { GameOver } from './ui/GameOver';
import { GAME_STATE } from './core/GameStateManager';
import { CLASSES, DIFFS } from './data/constants';
import './style/main.css';

// Game Canvas Component
const GameCanvas: React.FC<{ 
  onGameStateChange: (state: string) => void;
  playerClass: string;
  difficulty: string;
}> = ({ onGameStateChange, playerClass, difficulty }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize PixiJS game here
    // For now, just a placeholder that reports playing state
    const timer = setTimeout(() => {
      onGameStateChange('PLAYING');
    }, 2000);

    return () => clearTimeout(timer);
  }, [playerClass, difficulty]);

  return (
    <canvas 
      ref={canvasRef}
      id="game-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  );
};

// Main App
export const App: React.FC = () => {
  const [gameState, setGameState] = useState<string>('MENU');
  const [selectedClass, setSelectedClass] = useState<string>('mantis');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');
  
  // Game data
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
    combo: 0
  });
  
  const [bossData, setBossData] = useState({
    name: '',
    hp: 0,
    maxHp: 0,
    phase: 0
  });

  const [upgradeChoices, setUpgradeChoices] = useState<any[]>([]);
  const [finalStats, setFinalStats] = useState({
    score: 0,
    waves: 0,
    kills: 0
  });

  // Handle state transitions
  const handleStart = useCallback(() => {
    GAME_STATE.setDifficulty(selectedDifficulty);
    GAME_STATE.setClass(selectedClass);
    GAME_STATE.transition('CLASS_SELECT');
    setGameState('CLASS_SELECT');
  }, [selectedDifficulty, selectedClass]);

  const handleClasses = useCallback(() => {
    GAME_STATE.transition('CLASS_SELECT');
    setGameState('CLASS_SELECT');
  }, []);

  const handleDifficultySelect = useCallback(() => {
    GAME_STATE.transition('PLAYING', { classId: selectedClass, diffId: selectedDifficulty });
    setGameState('PLAYING');
  }, [selectedClass, selectedDifficulty]);

  const handleClassSelect = useCallback((classId: string) => {
    setSelectedClass(classId);
    GAME_STATE.transition('DIFFICULTY');
    setGameState('DIFFICULTY');
  }, []);

  const handleStartGame = useCallback(() => {
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

  const handleLevelUp = useCallback((id: string) => {
    // Apply upgrade choice logic
    GAME_STATE.transition('PLAYING');
    setGameState('PLAYING');
  }, []);

  const handleGameOver = useCallback(() => {
    GAME_STATE.transition('GAME_OVER');
    setFinalStats({
      score: playerData.score,
      waves: playerData.wave,
      kills: playerData.kills
    });
    setGameState('GAME_OVER');
  }, [playerData]);

  const handleRestart = useCallback(() => {
    GAME_STATE.transition('MENU');
    setGameState('MENU');
    setPlayerData({
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
      combo: 0
    });
  }, []);

  // Listen for game state changes
  useEffect(() => {
    GAME_STATE.onStateChange((prev, next) => {
      setGameState(next);
    });
  }, []);

  // Listen for real game updates from Engine via Bridge
  useEffect(() => {
    const onPlayerUpdate = (data: any) => setPlayerData(prev => ({ ...prev, ...data }));
    const onWaveUpdate = (data: any) => setPlayerData(prev => ({ ...prev, ...data }));
    
    BRIDGE.on('PLAYER_UPDATE', onPlayerUpdate);
    BRIDGE.on('WAVE_UPDATE', onWaveUpdate);
    
    return () => {
      BRIDGE.off('PLAYER_UPDATE', onPlayerUpdate);
      BRIDGE.off('WAVE_UPDATE', onWaveUpdate);
    };
  }, []);

  // Check for level up
  useEffect(() => {
    if (playerData.xp >= playerData.xpToNext && gameState === 'PLAYING') {
      setGameState('LEVEL_UP');
      // Mock upgrade choices
      setUpgradeChoices([
        { id: 'dmg', name: 'Venom Fang', desc: '+20% Damage', icon: '⚔️' },
        { id: 'as', name: 'Frenzy Glands', desc: '+15% Attack Speed', icon: '⚡' },
        { id: 'hp', name: 'Iron Chitin', desc: '+35 Max HP', icon: '🛡' }
      ]);
    }
  }, [playerData.xp, playerData.xpToNext, gameState]);

  // Render based on game state
  const renderContent = () => {
    switch (gameState) {
      case 'MENU':
        return (
          <Menu 
            onStart={handleStart}
            onClasses={handleClasses}
          />
        );

      case 'CLASS_SELECT':
        return (
          <ClassSelect
            classes={CLASSES}
            selected={selectedClass}
            onSelect={handleClassSelect}
            onBack={() => {
              GAME_STATE.transition('MENU');
              setGameState('MENU');
            }}
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
            onBack={() => {
              GAME_STATE.transition('CLASS_SELECT');
              setGameState('CLASS_SELECT');
            }}
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
            />
            <GameHUD 
              {...playerData}
              timer={playerData.time.toString()}
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
            onMenu={() => {
              GAME_STATE.transition('MENU');
              setGameState('MENU');
            }}
          />
        );

      case 'PAUSE':
        return (
          <>
            <GameCanvas 
              onGameStateChange={() => {}}
              playerClass={selectedClass}
              difficulty={selectedDifficulty}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              textAlign: 'center',
              color: '#00ff88',
              fontFamily: "'Orbitron', sans-serif",
            }}>
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
    <div id="app" style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#020408'
    }}>
      {renderContent()}
    </div>
  );
};

// Bootstrap
const container = document.getElementById('ui-root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log('[BOOTSTRAP] React App Initialized');
}