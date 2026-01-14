import React from 'react';
import { Link } from 'react-router-dom';

// Scientific icons
const Icon = {
  Laboratory: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5" />
    </svg>
  ),
  Book: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h15v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
    </svg>
  ),
};

const StartMenu: React.FC = () => {
  return (
    <div
      className="start-menu"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        textAlign: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.3,
      }} />

      <div style={{ maxWidth: '900px', color: 'white', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
            SEAM-VIZ
          </h1>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.6, fontWeight: 'bold' }}>
            Projective Identification Instrument
          </p>
        </div>

        <div style={{
          padding: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          marginBottom: '3rem',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
            An interactive instrument for exploring <strong>quotient geometry</strong>, <strong>topology</strong>,
            and <strong>information-theoretic identification</strong> through the real projective plane ℝP².
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            opacity: 0.8,
          }}>
            <span>• Antipodal Identification</span>
            <span>• Orientation Parity</span>
            <span>• Fiber Bundles</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/tutorials" style={{ textDecoration: 'none', width: '100%', maxWidth: '500px' }}>
            <button style={{
              width: '100%',
              padding: '1.5rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <Icon.Book />
              <span>Educational Tutorial</span>
            </button>
          </Link>

          <Link to="/quotient" style={{ textDecoration: 'none', width: '100%', maxWidth: '500px' }}>
            <button style={{
              width: '100%',
              padding: '1.5rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: 'white',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.7)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.2)';
            }}
            >
              <Icon.Laboratory />
              <span>Launch Laboratory</span>
            </button>
          </Link>
        </div>

        <div style={{
          marginTop: '4rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold' }}>
            Topological Identification Protocol
          </p>
          <p style={{ fontSize: '1rem', fontFamily: 'monospace', opacity: 0.9 }}>
            S² / (u ≡ −u) = ℝP²
          </p>
          <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>
            k* = 1/(2 ln 2) ≈ 0.721347520...
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
