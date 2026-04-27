import React, { useState, useEffect, useRef } from 'react';
import { getAntipodalColor, isValidHex } from './colorUtils';

interface AntipodalColorPickerProps {
  primaryColor: string;
  onPrimaryColorChange: (color: string) => void;
  labels?: { primary?: string; antipodal?: string };
  showHint?: boolean;
}

export const AntipodalColorPicker: React.FC<AntipodalColorPickerProps> = ({
  primaryColor,
  onPrimaryColorChange,
  labels = { primary: 'u', antipodal: '−u' },
}) => {
  const [antipodalColor, setAntipodalColor] = useState(getAntipodalColor(primaryColor));
  const [isAnimating, setIsAnimating] = useState(false);
  const previousColorRef = useRef(primaryColor);

  useEffect(() => {
    if (primaryColor !== previousColorRef.current) {
      setIsAnimating(true);
      setTimeout(() => {
        setAntipodalColor(getAntipodalColor(primaryColor));
        setTimeout(() => setIsAnimating(false), 200);
      }, 150);
      previousColorRef.current = primaryColor;
    }
  }, [primaryColor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidHex(e.target.value)) onPrimaryColorChange(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', minWidth: 0 }}>
      <label style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>
        Spotlight Colors
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {/* u — editable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div
            style={{ width: '22px', height: '22px', borderRadius: '50%', background: primaryColor, border: '2px solid #e2e8f0', flexShrink: 0, cursor: 'pointer', boxShadow: `0 0 0 2px ${primaryColor}30` }}
            onClick={() => document.getElementById('acp-primary')?.click()}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{labels.primary}</div>
            <input
              id="acp-primary"
              type="color"
              value={primaryColor}
              onChange={handleChange}
              style={{ width: '100%', height: '18px', border: 'none', borderRadius: '3px', cursor: 'pointer', background: 'transparent', padding: 0 }}
            />
          </div>
        </div>

        {/* −u — derived */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: isAnimating ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: antipodalColor, border: '2px solid #e2e8f0', flexShrink: 0, transform: isAnimating ? 'scale(0.88)' : 'scale(1)', transition: 'transform 0.2s', boxShadow: `0 0 0 2px ${antipodalColor}30` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{labels.antipodal}</div>
            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{antipodalColor.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
