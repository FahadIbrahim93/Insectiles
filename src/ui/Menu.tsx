import React from 'react';
import { Theme, cyberpunkClip } from './Theme';

export const Menu: React.FC<{ onStart: () => void; onClasses: () => void }> = ({ onStart, onClasses }) => {
  return (
    <div style={{
      width: '100vw', height: '100vh', 
      background: Theme.colors.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'linear-gradient(rgba(0, 255, 136, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.05) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      fontFamily: Theme.fonts.main
    }}>
      <h1 style={{
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        color: Theme.colors.neonGreen,
        fontFamily: Theme.fonts.title,
        letterSpacing: '15px',
        textShadow: `0 0 30px ${Theme.colors.neonGreen}`,
        marginBottom: '40px',
        textAlign: 'center'
      }}>INSECTILES</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {['START', 'CLASSES', 'OPTIONS', 'QUIT'].map(label => (
          <button 
            key={label}
            onClick={label === 'START' ? onStart : label === 'CLASSES' ? onClasses : undefined}
            style={{
              padding: '15px 60px',
              background: 'transparent',
              border: `2px solid ${Theme.colors.neonGreen}`,
              color: Theme.colors.neonGreen,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              clipPath: cyberpunkClip,
              transition: 'all 0.3s',
              fontFamily: Theme.fonts.title,
              letterSpacing: '4px'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(0, 255, 136, 0.1)';
              (e.target as HTMLElement).style.boxShadow = `0 0 20px ${Theme.colors.neonGreen}`;
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
              (e.target as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
