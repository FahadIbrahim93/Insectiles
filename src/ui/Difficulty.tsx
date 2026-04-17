import React from 'react';
import { Theme } from './Theme';
import { DifficultyDef, DIFFS } from '../data/constants';

export const Difficulty: React.FC<{ 
  difficulties?: DifficultyDef[];
  selected?: string;
  onSelect: (id: string) => void;
  onBack?: () => void;
}> = ({ difficulties = DIFFS, selected, onSelect, onBack }) => {
  const diffList = difficulties;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: Theme.colors.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px'
    }}>
      <h2 style={{ color: '#fff', fontFamily: Theme.fonts.title, marginBottom: '50px', letterSpacing: '5px' }}>SELECT INTENSITY</h2>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {diffList.map(d => {
          const isSelected = selected === d.id;
          return (
            <div 
              key={d.id}
              onClick={() => onSelect(d.id)}
              style={{
                width: '280px',
                padding: '40px 30px',
                background: isSelected ? `${d.col}11` : 'rgba(255, 255, 255, 0.01)',
                border: `2px solid ${isSelected ? d.col : d.col + '33'}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                ...(isSelected ? { boxShadow: `0 0 30px ${d.col}44` } : {})
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = `${d.col}11`; e.currentTarget.style.borderColor = d.col; }}
              onMouseOut={(e) => { e.currentTarget.style.background = isSelected ? `${d.col}11` : 'rgba(255, 255, 255, 0.01)'; e.currentTarget.style.borderColor = isSelected ? d.col : `${d.col}33`; }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '5px' }}>{d.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: d.col, fontFamily: Theme.fonts.title, marginBottom: '10px' }}>{d.name}</div>
              <p style={{ color: '#aaa', fontSize: '0.9rem', minHeight: '40px', marginBottom: '30px' }}>{d.desc}</p>
              <div style={{ borderTop: `1px solid ${d.col}22`, paddingTop: '20px', display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', color: '#fff' }}>
                <div><div style={{ opacity: 0.5 }}>HP</div>{d.hpMult}x</div>
                <div><div style={{ opacity: 0.5 }}>DMG</div>{d.dmgMult}x</div>
                <div><div style={{ opacity: 0.5 }}>XP</div>{d.xpMult}x</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {onBack && (
        <button 
          onClick={onBack}
          style={{
            marginTop: '40px',
            padding: '15px 40px',
            background: 'transparent',
            border: '1px solid #444',
            color: '#888',
            fontFamily: Theme.fonts.title,
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = Theme.colors.neonGreen; e.currentTarget.style.color = Theme.colors.neonGreen; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; }}
        >
          ← BACK
        </button>
      )}
    </div>
  );
};