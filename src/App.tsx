import { useState, useEffect, useRef } from 'react';
import { initGame, startGame, getPlayerState, resumeGame, setAutoAttack as setEngineAutoAttack } from './game/engine';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import type { User } from 'firebase/auth';
import { loadUserData, saveUserData, userData } from './store';
import { HERO_CLASSES, player } from './game/player';
import { UPGRADE_DEFS } from './game/upgrades';
import type { UpgradeDefinition } from './game/upgrades';
import { applyUpgradeToPlayer } from './game/upgradeEffects';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState('loading'); // loading, title, classselect, playing, gameover, upgrading
  const [selectedClass, setSelectedClass] = useState(HERO_CLASSES[0]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [xp, setXp] = useState(0);
  const [maxXp, setMaxXp] = useState(100);
  const [level, setLevel] = useState(1);
  const [upgradePoints, setUpgradePoints] = useState(0);
  const [availableUpgrades, setAvailableUpgrades] = useState<UpgradeDefinition[]>([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (canvasRef.current && minimapRef.current) {
      initGame(
        canvasRef.current, 
        minimapRef.current,
        async (finalScore, finalWave) => {
          setScore(finalScore);
          setWave(finalWave);
          setGameState('gameover');
          
          if (user) {
            // Save high score
            if (finalScore > (userData.bestScore || 0)) {
              userData.bestScore = finalScore;
              userData.bestWave = Math.max(userData.bestWave || 0, finalWave);
              await saveUserData(user.uid);
            }
          }
        },
        (currentScore) => setScore(currentScore),
        () => {
          // On Level Up
          setGameState('upgrading');
          rollUpgrades();
        },
        (newWave) => {
          setWave(newWave);
          // Show wave announcement
          const announce = document.getElementById('wave-announce');
          const num = document.getElementById('wave-num');
          const desc = document.getElementById('wave-desc');
          if (announce && num && desc) {
            num.innerText = `WAVE ${newWave}`;
            desc.innerText = newWave % 5 === 0 ? "APEX PREDATOR DETECTED" : "THE SWARM GROWS";
            announce.classList.add('show');
            setTimeout(() => announce.classList.remove('show'), 3000);
          }
        }
      );
      setGameState('title'); // Transition to title screen after init
    }
  }, []);

  const [autoAttack, setAutoAttack] = useState(false);

  useEffect(() => {
    setEngineAutoAttack(autoAttack);
  }, [autoAttack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setAutoAttack(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [abilities, setAbilities] = useState<any[]>([]);

  // Update HUD
  useEffect(() => {
    let animationFrameId: number;
    const updateHUD = () => {
      if (gameState === 'playing') {
        const pState = getPlayerState();
        setHp(pState.hp);
        setMaxHp(pState.maxHp);
        setXp(pState.xp);
        setMaxXp(pState.maxXp);
        setLevel(pState.level);
        setUpgradePoints(pState.upgradePoints);
        setAbilities([...pState.abilities]);
      }
      animationFrameId = requestAnimationFrame(updateHUD);
    };
    if (gameState === 'playing') {
      updateHUD();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleStartGame = () => {
    setGameState('playing');
    startGame(selectedClass);
  };

  const rollUpgrades = () => {
    // Simple random selection for now
    const shuffled = [...UPGRADE_DEFS].sort(() => 0.5 - Math.random());
    setAvailableUpgrades(shuffled.slice(0, 3));
  };

  const handleSelectUpgrade = (upgrade: UpgradeDefinition) => {
    applyUpgradeToPlayer(player, upgrade);

    // Resume game
    setGameState('playing');
    resumeGame();
  };

  // Mobile controls
  useEffect(() => {
    if (gameState !== 'playing') return;

    const joystickZone = document.getElementById('touch-joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    const fireZone = document.getElementById('touch-fire-zone');
    const fireBtn = document.getElementById('touch-fire-btn');

    if (!joystickZone || !joystickBase || !joystickThumb || !fireZone || !fireBtn) return;

    let touchId: number | null = null;
    let fireTouchId: number | null = null;
    let basePos = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX < window.innerWidth / 2 && touchId === null) {
          touchId = t.identifier;
          basePos = { x: t.clientX, y: t.clientY };
          joystickBase.style.left = `${basePos.x - 50}px`;
          joystickBase.style.top = `${basePos.y - 50}px`;
          joystickThumb.style.left = `${basePos.x - 25}px`;
          joystickThumb.style.top = `${basePos.y - 25}px`;
          joystickBase.style.display = 'block';
          joystickThumb.style.display = 'block';
        } else if (t.clientX >= window.innerWidth / 2 && fireTouchId === null) {
          fireTouchId = t.identifier;
          fireBtn.style.transform = 'scale(0.9)';
          fireBtn.style.background = 'rgba(255, 255, 255, 0.4)';
          // Simulate mouse down for firing
          const canvas = canvasRef.current;
          if (canvas) {
            const event = new MouseEvent('mousedown');
            canvas.dispatchEvent(event);
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          const dx = t.clientX - basePos.x;
          const dy = t.clientY - basePos.y;
          const dist = Math.min(Math.hypot(dx, dy), 50);
          const angle = Math.atan2(dy, dx);
          
          joystickThumb.style.left = `${basePos.x + Math.cos(angle) * dist - 25}px`;
          joystickThumb.style.top = `${basePos.y + Math.sin(angle) * dist - 25}px`;

          // Simulate key presses based on joystick angle
          const eventUp = new KeyboardEvent('keyup', { key: 'w' });
          const eventDown = new KeyboardEvent('keyup', { key: 's' });
          const eventLeft = new KeyboardEvent('keyup', { key: 'a' });
          const eventRight = new KeyboardEvent('keyup', { key: 'd' });
          window.dispatchEvent(eventUp);
          window.dispatchEvent(eventDown);
          window.dispatchEvent(eventLeft);
          window.dispatchEvent(eventRight);

          if (dist > 10) {
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
              else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
            } else {
              if (dy > 0) window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
              else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
            }
          }
        } else if (t.identifier === fireTouchId) {
          // Update aim direction
          const canvas = canvasRef.current;
          if (canvas) {
            const event = new MouseEvent('mousemove', {
              clientX: t.clientX,
              clientY: t.clientY
            });
            canvas.dispatchEvent(event);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          touchId = null;
          joystickBase.style.display = 'none';
          joystickThumb.style.display = 'none';
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
        } else if (t.identifier === fireTouchId) {
          fireTouchId = null;
          fireBtn.style.transform = 'scale(1)';
          fireBtn.style.background = 'rgba(255, 255, 255, 0.2)';
          const canvas = canvasRef.current;
          if (canvas) {
            const event = new MouseEvent('mouseup');
            canvas.dispatchEvent(event);
          }
        }
      }
    };

    joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    joystickZone.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystickZone.addEventListener('touchend', handleTouchEnd, { passive: false });
    joystickZone.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    fireZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    fireZone.addEventListener('touchmove', handleTouchMove, { passive: false });
    fireZone.addEventListener('touchend', handleTouchEnd, { passive: false });
    fireZone.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Touch Ability Buttons
    const abBtns = document.querySelectorAll('.touch-ab-btn');
    const handleAbTouch = (e: Event) => {
      e.preventDefault();
      const btn = e.currentTarget as HTMLElement;
      const abIndex = btn.getAttribute('data-ab');
      let key = '';
      if (abIndex === '0') key = 'q';
      if (abIndex === '1') key = 'w';
      if (abIndex === '2') key = 'e';
      if (abIndex === '3') key = 'r';
      if (key) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key })), 100);
      }
    };
    abBtns.forEach(btn => btn.addEventListener('touchstart', handleAbTouch, { passive: false }));

    return () => {
      joystickZone.removeEventListener('touchstart', handleTouchStart);
      joystickZone.removeEventListener('touchmove', handleTouchMove);
      joystickZone.removeEventListener('touchend', handleTouchEnd);
      joystickZone.removeEventListener('touchcancel', handleTouchEnd);

      fireZone.removeEventListener('touchstart', handleTouchStart);
      fireZone.removeEventListener('touchmove', handleTouchMove);
      fireZone.removeEventListener('touchend', handleTouchEnd);
      fireZone.removeEventListener('touchcancel', handleTouchEnd);
      
      abBtns.forEach(btn => btn.removeEventListener('touchstart', handleAbTouch));
    };
  }, [gameState]);

  return (
    <>
      {/* LOADER */}
      {gameState === 'loading' && (
        <div id="loader" role="status" aria-live="polite" aria-label="Loading game systems">
          <div className="load-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} aria-label="Loading progress">
            <div className="load-fill" id="load-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="load-text">INITIALIZING SYSTEMS</div>
        </div>
      )}

      {/* TITLE SCREEN */}
      <div id="title-screen" className={gameState !== 'title' ? 'hidden' : ''} role="main" aria-label="Title screen">
        <div className="title-glow" aria-hidden="true"></div>
        <div className="title-text" aria-label="Insectiles">INSECTILES</div>
        <div className="title-sub">Survive the Swarm</div>
        
        <div id="auth-section" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          {!user ? (
            <button className="start-btn" id="login-btn" aria-label="Login with Google" style={{ marginTop: 0 }} onClick={handleLogin}>
              LOGIN WITH GOOGLE
            </button>
          ) : (
            <div id="user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'rgba(0,255,100,0.8)', fontFamily: "'Orbitron', monospace", fontSize: '14px', letterSpacing: '2px' }} id="welcome-msg">
                WELCOME, {user.displayName?.toUpperCase()}
              </div>
              <button className="start-btn" id="start-btn" aria-label="Start game and choose class" style={{ marginTop: '10px' }} onClick={() => setGameState('classselect')}>
                ENGAGE
              </button>
              <button id="logout-btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.8)', fontFamily: "'Orbitron', monospace", fontSize: '10px', cursor: 'pointer', letterSpacing: '2px', textDecoration: 'underline', marginTop: '10px' }} onClick={handleLogout}>
                LOGOUT
              </button>
            </div>
          )}
        </div>

        <div className="version-tag" aria-label="Version info">APEX SWARM EDITION v5.0 — PRODUCTION BUILD</div>
      </div>

      {/* CLASS SELECT SCREEN */}
      <div id="class-select" className={gameState === 'classselect' ? 'show' : ''} role="dialog" aria-modal="true" aria-label="Choose your hero class">
        <div className="cs-title">CHOOSE YOUR FORM</div>
        <div className="cs-sub">YOUR LINEAGE SHAPES YOUR DESTINY</div>
        <div className="cs-grid" id="cs-grid" role="radiogroup" aria-label="Hero classes">
          {HERO_CLASSES.map((cls) => (
            <div
              key={cls.id}
              className={`cs-card ${cls.id === selectedClass.id ? 'selected' : ''}`}
              style={{
                borderColor: cls.id === selectedClass.id ? cls.color : '',
                boxShadow: cls.id === selectedClass.id ? `0 0 25px ${cls.color}33` : '',
              }}
              onClick={() => setSelectedClass(cls)}
            >
              <span className="cs-emoji">{cls.emoji}</span>
              <div className="cs-name" style={{ color: cls.color }}>{cls.name}</div>
              <div className="cs-role">{cls.role}</div>
              <div className="cs-lore">{cls.lore}</div>
              <div className="cs-stats">
                <div className="cs-stat-row"><span style={{ width: '60px' }}>SPD</span><div className="cs-stat-bar"><div className="cs-stat-fill" style={{ width: `${cls.statLabels.speed}%`, background: cls.color }}></div></div></div>
                <div className="cs-stat-row"><span style={{ width: '60px' }}>VIT</span><div className="cs-stat-bar"><div className="cs-stat-fill" style={{ width: `${cls.statLabels.health}%`, background: cls.color }}></div></div></div>
                <div className="cs-stat-row"><span style={{ width: '60px' }}>ATK</span><div className="cs-stat-bar"><div className="cs-stat-fill" style={{ width: `${cls.statLabels.damage}%`, background: cls.color }}></div></div></div>
                <div className="cs-stat-row"><span style={{ width: '60px' }}>RANGE</span><div className="cs-stat-bar"><div className="cs-stat-fill" style={{ width: `${cls.statLabels.range}%`, background: cls.color }}></div></div></div>
              </div>
              <div style={{ marginTop: '10px', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: cls.color, opacity: 0.7 }}>✦ {cls.passive}</div>
            </div>
          ))}
        </div>
        <button className="cs-start-btn" id="cs-start-btn" aria-label="Begin run with selected class" onClick={handleStartGame}>ENTER THE SWARM</button>
      </div>

      {/* GAME OVER SCREEN */}
      <div id="game-over" className={gameState === 'gameover' ? 'show' : ''} role="dialog" aria-modal="true" aria-label="Game Over">
        <div className="go-title">SWARM OVERWHELM</div>
        <div className="go-stats">
          <div>FINAL SCORE: <span id="go-score" style={{ color: 'var(--c-accent)' }}>{score}</span></div>
          <div>WAVES SURVIVED: <span id="go-wave" style={{ color: 'var(--c-accent)' }}>{wave}</span></div>
          {user && userData && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>
              HIGH SCORE: {userData.bestScore || 0}
            </div>
          )}
        </div>
        <button className="start-btn" id="restart-btn" aria-label="Restart game" onClick={() => setGameState('title')}>RETURN TO NEST</button>
      </div>

      {/* GAME CANVAS */}
      <canvas id="game-canvas" ref={canvasRef} role="img" aria-label="Game world" style={{ display: gameState === 'playing' || gameState === 'gameover' || gameState === 'upgrading' ? 'block' : 'none' }}></canvas>

      {/* HUD */}
      <div id="hud" className={gameState === 'playing' ? 'show' : ''} role="region" aria-label="Game HUD" aria-live="polite">
        <div className="hud-left">
          <div className="hud-label" id="vitality-label">VITALITY</div>
          <div className="health-bar-container" role="progressbar" aria-labelledby="vitality-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={(hp / maxHp) * 100}>
            <div className="health-bar" id="health-bar" style={{ width: `${(hp / maxHp) * 100}%` }}></div>
          </div>
          <div className="hud-label" style={{ marginTop: '8px' }}>SCORE</div>
          <div className="hud-value" id="score-display" aria-label={`Score: ${score}`}>{score}</div>
        </div>
        <div className="hud-center">
          <div className="wave-title" id="wave-display" aria-label="Current wave">WAVE {wave}</div>
          <div className="combo-display" id="combo-display" aria-label="Combo multiplier" aria-live="polite">x1</div>
        </div>
        <div className="hud-right">
          <div className="hud-label">ENEMIES</div>
          <div className="hud-value" id="enemy-count" aria-label="Remaining enemies">0</div>
          <div className="hud-label" style={{ marginTop: '8px' }}>KILLS</div>
          <div className="hud-value" id="kill-count" style={{ fontSize: '20px' }} aria-label="Total kills">0</div>
        </div>
      </div>

      {/* ABILITY BAR */}
      <div className={`ability-bar ${gameState === 'playing' ? 'show' : ''}`} id="ability-bar" role="toolbar" aria-label="Abilities">
        {abilities.map((ab, idx) => {
          const keys = ['Q', 'W', 'E', 'R'];
          const icons = ['🔥', '⚡', '🛡️', '💀'];
          const isReady = ab.cooldown <= 0;
          const cdPercent = isReady ? 0 : (ab.cooldown / ab.maxCooldown) * 100;
          return (
            <div key={idx} className={`ability-slot ${isReady ? 'ready' : ''}`} id={`ab${idx}`} role="button" aria-label={`Ability ${idx + 1}: ${ab.name} (${keys[idx]})`} tabIndex={-1}>
              <span className="key" aria-hidden="true">{keys[idx]}</span>
              <span className="icon" aria-hidden="true">{icons[idx]}</span>
              <div className="cooldown-overlay" style={{ height: `${cdPercent}%` }} aria-hidden="true"></div>
            </div>
          );
        })}
      </div>

      {/* WAVE ANNOUNCEMENT OVERLAY */}
      <div className="wave-announce" id="wave-announce" role="alert" aria-live="assertive">
        <div className="wave-num" id="wave-num">WAVE 1</div>
        <div className="wave-desc" id="wave-desc">THE SWARM AWAKENS</div>
      </div>

      <div className="damage-vignette" id="damage-vignette" aria-hidden="true"></div>

      {/* SYNERGY BADGE BAR */}
      <div id="synergy-bar" role="region" aria-label="Active synergies" aria-live="polite"></div>

      {/* THREAT METER */}
      <div id="threat-meter" role="status" aria-label="Threat level indicator" style={{ display: gameState === 'playing' ? 'flex' : 'none' }}>
        <div className="threat-label">THREAT LEVEL</div>
        <div className="threat-bar-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
          <div className="threat-fill" id="threat-fill" style={{ width: '0%' }}></div>
        </div>
        <div className="threat-label-val" id="threat-val" aria-live="polite">CALM</div>
      </div>

      {/* Auto-attack mode indicator */}
      <div id="auto-indicator" aria-live="polite" aria-label="Auto-attack status" style={{ display: gameState === 'playing' ? 'block' : 'none' }}>[ TAB ] AUTO: {autoAttack ? 'ON' : 'OFF'}</div>

      {/* Daily seed badge */}
      <div id="daily-badge" aria-label="Daily seed run indicator" style={{ display: gameState === 'playing' ? 'block' : 'none' }}>
        <div className="daily-inner">
          <span className="daily-icon" aria-hidden="true">👑</span>
          <span className="daily-label" id="daily-label">DAILY SEED</span>
        </div>
      </div>

      {/* RUN JOURNAL */}
      <button id="journal-btn" aria-expanded="false" aria-controls="journal-panel" aria-label="Toggle hive journal" style={{ display: gameState === 'playing' ? 'block' : 'none' }}>📖 HIVE LOG</button>
      <div id="journal-panel" role="region" aria-label="Hive journal panel" aria-hidden="true">
        <div className="jp-title">⬡ HIVE JOURNAL</div>
        <div id="journal-content"></div>
      </div>

      {/* UPGRADE SCREEN */}
      <div id="upgrade-screen" className={gameState === 'upgrading' ? 'show' : ''} role="dialog" aria-modal="true" aria-label="Upgrade selection screen">
        <div className="upgrade-header">EVOLVE</div>
        <div className="upgrade-subheader">CHOOSE AN ADAPTATION</div>
        <div className="upgrade-points" id="upgrade-points" aria-live="polite" aria-label="Available upgrade points">{upgradePoints} PTS</div>
        <div className="upgrade-grid" id="upgrade-grid" role="list" aria-label="Available upgrades">
          {availableUpgrades.map((upg, i) => (
            <div key={i} className={`upgrade-card rarity-${upg.rarity}`} onClick={() => handleSelectUpgrade(upg)}>
              <div className="uc-icon">{upg.icon}</div>
              <div className="uc-content">
                <div className="uc-name">{upg.name}</div>
                <div className="uc-desc">{upg.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="upgrade-actions">
          <button className="reroll-btn" id="reroll-btn" aria-label="Reroll upgrade options" onClick={rollUpgrades}>
            <span className="reroll-spin" aria-hidden="true">⟳</span> REROLL
            <span id="reroll-cost">50</span> PTS
          </button>
          <button id="codex-toggle" aria-expanded="false" aria-controls="codex-panel" aria-label="Toggle synergy codex">
            ✦ SYNERGY CODEX <span className="codex-badge" id="codex-badge">0 / 8</span>
          </button>
          <div id="codex-panel" role="region" aria-label="Synergy codex" aria-hidden="true">
            <div className="codex-inner">
              <div className="codex-title">⬡ HIVE KNOWLEDGE</div>
              <div className="codex-grid" id="codex-grid" role="list" aria-label="Known synergies"></div>
            </div>
          </div>
          <button className="upgrade-continue" id="upgrade-continue" aria-label="Continue to next wave" onClick={() => { setGameState('playing'); resumeGame(); }}>CONTINUE</button>
        </div>
      </div>

      <div className="perf" id="perf" aria-hidden="true" role="status"></div>

      {/* ACCESSIBILITY */}
      <button id="accessibility-btn" aria-haspopup="true" aria-expanded="false" aria-controls="colorblind-panel" aria-label="Accessibility options">♿ A11Y</button>
      <div id="colorblind-panel" role="dialog" aria-label="Accessibility options panel" aria-hidden="true">
        <div className="cb-title">DISPLAY MODE</div>
        <label className="cb-option"><input type="radio" name="cb" value="normal" defaultChecked /> Normal</label>
        <label className="cb-option"><input type="radio" name="cb" value="protanopia" /> Protanopia</label>
        <label className="cb-option"><input type="radio" name="cb" value="deuteranopia" /> Deuteranopia</label>
        <label className="cb-option"><input type="radio" name="cb" value="tritanopia" /> Tritanopia</label>
        <label className="cb-option"><input type="radio" name="cb" value="high-contrast" /> High Contrast</label>
      </div>

      {/* MOBILE TOUCH CONTROLS */}
      <div id="touch-joystick-zone" aria-hidden="true" role="presentation"></div>
      <div id="joystick-base" aria-hidden="true"></div>
      <div id="joystick-thumb" aria-hidden="true"></div>
      <div id="touch-fire-zone" aria-hidden="true" role="presentation"></div>
      <div id="touch-fire-btn" aria-label="Fire" role="button" aria-hidden="true">🔥</div>
      <div id="touch-ability-bar" aria-hidden="true" role="toolbar" aria-label="Touch ability buttons">
        <div className="touch-ab-btn" data-ab="0" aria-label="Ability Q">🔥<div className="t-cd" style={{ height: '0%' }}></div></div>
        <div className="touch-ab-btn" data-ab="2" aria-label="Ability E">🛡️<div className="t-cd" style={{ height: '0%' }}></div></div>
        <div className="touch-ab-btn" data-ab="3" aria-label="Ability R">💀<div className="t-cd" style={{ height: '0%' }}></div></div>
      </div>

      {/* MINIMAP */}
      <div className={`minimap ${gameState === 'playing' ? 'active' : ''}`} id="minimap" role="img" aria-label="Mini-map showing enemy positions">
        <canvas id="minimap-canvas" ref={minimapRef} width="140" height="140"></canvas>
      </div>

    </>
  );
}
