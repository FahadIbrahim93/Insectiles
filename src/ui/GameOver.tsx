import React from 'react';
import { Theme, cyberpunkClip } from './Theme';

interface Stats {
  score?: number;
  waves?: number;
  kills?: number;
  time?: string;
}

export const GameOver: React.FC<{ 
  stats?: Stats;
  onRetry?: () => void; 
  onMenu?: () => void;
  score?: number;
  waves?: number;
  kills?: number;
  onRestart?: () => void;
}> = ({ stats, onRetry, onMenu, score, waves, kills, onRestart }) => {
  const finalScore = stats?.score ?? score ?? 0;
  const finalWaves = stats?.waves ?? waves ?? 0;
  const finalKills = stats?.kills ?? kills ?? 0;
  
  const handleRetry = onRetry || onRestart;
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(10, 0, 0, 0.95)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      zIndex: 3000
    }}>
      <h1 style={{ fontSize: '5rem', color: Theme.colors.neonRed, fontFamily: Theme.fonts.title, marginBottom: '10px', textShadow: '0 0 30px rgba(255, 68, 68, 0.5)' }}>SYSTEM TERMINATED</h1>
      <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '50px', letterSpacing: '5px' }}>SWARM OVERWHELMED</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '400px', marginBottom: '60px', fontFamily: Theme.fonts.main }}>
        <div style={{ padding: '15px', border: '1px solid #333' }}><div style={{ opacity: 0.4 }}>FINAL SCORE</div><div style={{ fontSize: '1.5rem', color: Theme.colors.neonGold }}>{finalScore.toLocaleString()}</div></div>
        <div style={{ padding: '15px', border: '1px solid #333' }}><div style={{ opacity: 0.4 }}>WAVES SURVIVED</div><div style={{ fontSize: '1.5rem' }}>{finalWaves}</div></div>
        <div style={{ padding: '15px', border: '1px solid #333' }}><div style={{ opacity: 0.4 }}>ENEMIES KILLED</div><div style={{ fontSize: '1.5rem' }}>{finalKills}</div></div>
        <div style={{ padding: '15px', border: '1px solid #333' }}><div style={{ opacity: 0.4 }}>TIME ELAPSED</div><div style={{ fontSize: '1.5rem' }}>--:--</div></div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={handleRetry} style={{ padding: '15px 40px', background: Theme.colors.neonRed, color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', clipPath: cyberpunkClip }}>RESTART SEQUENCE</button>
        <button onClick={onMenu} style={{ padding: '15px 40px', background: 'transparent', border: '1px solid #fff', color: '#fff', cursor: 'pointer', clipPath: cyberpunkClip }}>RTN TO MAIN</button>
      </div>
    </div>
  );
};
