import React from 'react';
import { Theme } from './Theme';
import { ClassDef, CLASSES } from '../data/constants';

// Use constants or prop
export const ClassSelect: React.FC<{ 
  classes?: Record<string, ClassDef>;
  selected?: string;
  onSelect: (id: string) => void;
  onBack?: () => void;
}> = ({ classes = CLASSES, selected, onSelect, onBack }) => {
  const classList = Object.values(classes);
  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: Theme.colors.bg,
      padding: '60px 20px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      backgroundImage: 'radial-gradient(circle at center, #0a1018 0%, #020408 100%)'
    }}>
      <h2 style={{ color: Theme.colors.neonGreen, fontFamily: Theme.fonts.title, marginBottom: '40px', letterSpacing: '8px' }}>SELECT WARRIOR</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', width: '100%', maxWidth: '1200px' }}>
        {classList.map(c => {
          const isSelected = selected === c.name.toLowerCase().replace(' ', '');
          return (
          <div 
            key={c.name}
            onClick={() => onSelect(c.name.toLowerCase().replace(' ', ''))}
            style={{
              padding: '30px',
              background: isSelected ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              border: `2px solid ${isSelected ? c.col : c.col + '44'}`,
              borderTop: `4px solid ${c.col}`,
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: Theme.fonts.main,
              ...(isSelected ? { boxShadow: `0 0 30px ${c.col}44` } : {})
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = c.col; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = isSelected ? c.col : c.col + '44'; }}
          >
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '10px' }}>{c.icon}</div>
            <div style={{ fontSize: '0.8rem', color: c.col, opacity: 0.6 }}>UNIT TYPE</div>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '5px 0', fontFamily: Theme.fonts.title }}>{c.name.toUpperCase()}</h3>
            <div style={{ color: c.col, marginBottom: '20px' }}>{c.role}</div>
            
            {[
              { k: 'HP', v: (c.hp / 250) * 100 },
              { k: 'SPD', v: (c.spd / 250) * 100 },
              { k: 'DMG', v: (c.dmg / 30) * 100 },
              { k: 'AS', v: (c.as / 4) * 100 }
            ].map(stat => (
              <div key={stat.k} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888' }}>
                  <span>{stat.k}</span>
                  <span>{Math.round(stat.v)}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#222', marginTop: '4px' }}>
                  <div style={{ width: `${Math.min(stat.v, 100)}%`, height: '100%', background: c.col }} />
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '15px', fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>
              {c.desc}
            </div>
          </div>
        )})}
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
