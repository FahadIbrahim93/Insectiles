import React from 'react';
import { Theme } from './Theme';

export const BossHUD: React.FC<{ name: string; hp: number; maxHp: number; phase: number; warning?: string }> = ({ name, hp, maxHp, phase, warning }) => {
  const hpPct = (hp / maxHp) * 100;
  
  return (
    <div style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: '800px', textAlign: 'center', pointerEvents: 'none' }}>
      <div style={{ color: Theme.colors.neonRed, fontFamily: Theme.fonts.title, fontSize: '1.2rem', marginBottom: '5px', letterSpacing: '4px' }}>
        {name.toUpperCase()} <span style={{ opacity: 0.5 }}>- PHASE {phase}</span>
      </div>
      <div style={{ width: '100%', height: '20px', background: 'rgba(255, 0, 0, 0.1)', border: '2px solid rgba(255, 0, 0, 0.3)', boxShadow: '0 0 20px rgba(255, 0, 0, 0.2)' }}>
        <div style={{ width: `${hpPct}%`, height: '100%', background: `linear-gradient(90deg, #880000, ${Theme.colors.neonRed})`, transition: 'width 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)' }} />
      </div>
      
      {warning && (
        <div style={{ marginTop: '40px', color: '#ff0', background: 'rgba(255, 0, 0, 0.2)', padding: '10px 30px', border: '1px solid #ff0', display: 'inline-block', fontSize: '1.2rem', animation: 'blink 0.5s infinite' }}>
          WARNING: {warning.toUpperCase()}
        </div>
      )}

      <style>{`
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};
