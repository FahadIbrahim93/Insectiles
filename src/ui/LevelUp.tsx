import React from 'react';
import { Theme } from './Theme';

interface UpgradeChoice {
  id: string;
  name: string;
  desc: string;
  icon?: string;
}

export const LevelUp: React.FC<{ 
  level?: number;
  choices?: UpgradeChoice[];
  onSelect?: (id: string) => void;
  onChoose?: (id: string) => void;
}> = ({ level = 1, choices, onSelect, onChoose }) => {
  const mockUpgrades = choices || [
    { id: 'dmg', name: 'Nano-Blades', desc: 'Increases base damage by 20%.', icon: '⚔️' },
    { id: 'as', name: 'Overclock', desc: 'Increases attack speed by 15%.', icon: '⚡' },
    { id: 'hp', name: 'Carapace Plating', desc: 'Adds +50 Max Health.', icon: '🛡' }
  ];
  
  const handleSelect = (id: string) => {
    if (onSelect) onSelect(id);
    if (onChoose) onChoose(id);
  };
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0, 0, 5, 0.9)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      zIndex: 2000
    }}>
      <h2 style={{ color: Theme.colors.neonGold, fontFamily: Theme.fonts.title, fontSize: '2.5rem', marginBottom: '50px', letterSpacing: '10px' }}>EVOLUTION AVAILABLE</h2>
      
      <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
        {mockUpgrades.map(u => (
          <div 
            key={u.id}
            onClick={() => handleSelect(u.id)}
            style={{
              width: '260px',
              padding: '40px 25px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${u.col}44`,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'center'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = `${u.col}11`; e.currentTarget.style.borderColor = u.col; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = `${u.col}44`; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{ width: '60px', height: '60px', border: `2px solid ${u.col}`, margin: '0 auto 20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.col, fontSize: '1.5rem' }}>+</div>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '10px' }}>{u.name}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>{u.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
