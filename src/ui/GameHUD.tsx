import React from 'react';
import { Theme } from './Theme';

interface HudProps {
  hp: number;
  maxHp: number;
  shield?: number;
  maxShield?: number;
  xp: number;
  xpToNext: number;
  level: number;
  time?: number;
  wave?: number;
  score?: number;
  kills?: number;
  combo?: number;
  abilities?: Array<{ name: string; cooldown: number; maxCooldown: number; ready: boolean }>;
}

export const GameHUD: React.FC<HudProps> = (props) => {
  const hpPct = (props.hp / props.maxHp) * 100;
  const xpPct = (props.xp / props.xpToNext) * 100;
  const shPct = props.maxShield ? (props.shield! / props.maxShield!) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', padding: '20px', fontFamily: Theme.fonts.main, zIndex: 1000 }}>
      {/* Top Left: Vitals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '250px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: Theme.colors.neonRed, fontSize: '0.8rem', width: '25px' }}>HP</span>
          <div style={{ flex: 1, height: '12px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
            <div style={{ width: `${hpPct}%`, height: '100%', background: `linear-gradient(90deg, #cc2222, ${Theme.colors.neonRed})`, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: Theme.colors.neonGreen, fontSize: '0.8rem', width: '25px' }}>XP</span>
          <div style={{ flex: 1, height: '8px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <div style={{ width: `${xpPct}%`, height: '100%', background: Theme.colors.neonGreen, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: Theme.colors.neonCyan, fontSize: '0.8rem', width: '25px' }}>SHD</span>
          <div style={{ flex: 1, height: '8px', background: 'rgba(0, 255, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
            <div style={{ width: `${shPct}%`, height: '100%', background: Theme.colors.neonCyan, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', color: Theme.colors.neonGreen, marginTop: '5px' }}>LEVEL {props.level}</div>
      </div>

      {/* Top Center: Timer */}
      <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold', letterSpacing: '2px' }}>{props.time ?? 0}</div>
        <div style={{ fontSize: '0.7rem', color: Theme.colors.neonGreen, opacity: 0.6 }}>TIME</div>
      </div>

      {/* Top Right: Stats */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', textAlign: 'right' }}>
        <div style={{ fontSize: '1.5rem', color: Theme.colors.neonGold }}>WAVE {props.wave}</div>
        <div style={{ fontSize: '0.9rem', color: '#fff' }}>SCORE: {(props.score ?? 0).toLocaleString()}</div>
      </div>
    </div>
  );
};
