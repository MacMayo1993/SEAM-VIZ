/**
 * Antipodal Color Picker Component
 *
 * This component demonstrates the quotient space concept through color selection.
 * When you pick one color, its antipodal pair is automatically determined,
 * just like how selecting [u] in quotient space determines both u and -u.
 *
 * The animation shows the "hex color sphere" finding the opposite color,
 * making the mathematical pairing visible and interactive.
 */

import React, { useState, useEffect, useRef } from 'react';
import { getAntipodalColor, getContrastColor, isValidHex } from './colorUtils';

interface AntipodalColorPickerProps {
  /**
   * The primary color (user-selected)
   */
  primaryColor: string;

  /**
   * Callback when the primary color changes
   */
  onPrimaryColorChange: (color: string) => void;

  /**
   * Labels for the colors (optional)
   */
  labels?: {
    primary?: string;
    antipodal?: string;
  };

  /**
   * Whether to show the first-time hint
   */
  showHint?: boolean;
}

export const AntipodalColorPicker: React.FC<AntipodalColorPickerProps> = ({
  primaryColor,
  onPrimaryColorChange,
  labels = { primary: 'u', antipodal: '-u' },
  showHint = false
}) => {
  const [antipodalColor, setAntipodalColor] = useState(getAntipodalColor(primaryColor));
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(showHint);
  const previousColorRef = useRef(primaryColor);

  // Update antipodal color when primary changes
  useEffect(() => {
    if (primaryColor !== previousColorRef.current) {
      // Trigger animation
      setIsAnimating(true);

      // Calculate new antipodal color after a brief pause
      setTimeout(() => {
        const newAntipodal = getAntipodalColor(primaryColor);
        setAntipodalColor(newAntipodal);

        // End animation
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 200);

      // Hide hint after first interaction
      if (showFirstTimeHint) {
        setTimeout(() => setShowFirstTimeHint(false), 3000);
      }

      previousColorRef.current = primaryColor;
    }
  }, [primaryColor, showFirstTimeHint]);

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (isValidHex(newColor)) {
      onPrimaryColorChange(newColor);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '4px'
      }}>
        Spotlight Colors
      </div>

      {/* First-time hint */}
      {showFirstTimeHint && (
        <div style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontStyle: 'italic',
          animation: 'fadeInOut 3s ease-in-out',
          marginBottom: '8px'
        }}>
          Some choices determine their opposite.
        </div>
      )}

      {/* Primary Color Picker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        border: '2px solid rgba(255, 255, 255, 0.15)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: primaryColor,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 0 12px ${primaryColor}40`,
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          flexShrink: 0
        }}
        onClick={() => document.getElementById('primary-color-input')?.click()}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {labels.primary}
          </div>
          <input
            id="primary-color-input"
            type="color"
            value={primaryColor}
            onChange={handlePrimaryChange}
            style={{
              width: '100%',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'transparent'
            }}
          />
        </div>

        <div style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'rgba(255, 255, 255, 0.7)',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {primaryColor.toUpperCase()}
        </div>
      </div>

      {/* Connection Line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '40px'
      }}>
        {/* Animated sphere visualization */}
        <div style={{
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${primaryColor}, ${antipodalColor})`,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          animation: isAnimating ? 'spin 0.5s ease-in-out' : 'none',
          boxShadow: '0 0 16px rgba(255, 255, 255, 0.2)'
        }} />

        {/* Connecting line */}
        <div style={{
          position: 'absolute',
          width: '2px',
          height: '100%',
          background: `linear-gradient(to bottom, ${primaryColor}, ${antipodalColor})`,
          opacity: 0.3
        }} />

        {/* Label */}
        <div style={{
          position: 'absolute',
          right: '-80px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontStyle: 'italic',
          whiteSpace: 'nowrap'
        }}>
          {isAnimating ? 'finding opposite...' : 'antipodal pair'}
        </div>
      </div>

      {/* Antipodal Color Display (non-editable) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        opacity: isAnimating ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
        position: 'relative'
      }}>
        {/* Lock icon overlay */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.3)'
        }}>
          🔒
        </div>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: antipodalColor,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 0 12px ${antipodalColor}40`,
          flexShrink: 0,
          opacity: isAnimating ? 0.5 : 1,
          transition: 'all 0.3s ease',
          transform: isAnimating ? 'scale(0.9)' : 'scale(1)'
        }} />

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {labels.antipodal}
          </div>
          <div style={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontStyle: 'italic'
          }}>
            Determined by {labels.primary}
          </div>
        </div>

        <div style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'rgba(255, 255, 255, 0.7)',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {antipodalColor.toUpperCase()}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
