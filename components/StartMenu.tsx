import React from 'react';
import { Link } from 'react-router-dom';

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '800px', color: 'white' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.2em' }}>
          SEAM VIZ
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '1rem', fontStyle: 'italic', opacity: 0.9 }}>
          Stochastic Eversion of Antipodal Manifolds
        </p>
        <p style={{ fontSize: '0.875rem', marginBottom: '3rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto 3rem' }}>
          Your engine for exploring quotient spaces, projective geometry, and antipodal identifications
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Link to="/tutorials" style={{ textDecoration: 'none', width: '100%', maxWidth: '400px' }}>
            <button style={{
              width: '100%',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              🌍 Start Tutorials
            </button>
          </Link>

          <Link to="/quotient" style={{ textDecoration: 'none', width: '100%', maxWidth: '400px' }}>
            <button style={{
              width: '100%',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              🎯 Quotient Symmetry Explorer
            </button>
          </Link>

          {/* Future: SEAM FLY mode */}
          {/* <Link to="/fly" style={{ textDecoration: 'none', width: '100%', maxWidth: '400px' }}>
            <button style={{
              width: '100%',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
            }}>
              ✈️ Enter SEAM FLY Mode
            </button>
          </Link> */}
        </div>

        <div style={{ marginTop: '4rem', opacity: 0.6, fontSize: '0.75rem' }}>
          <p>S² / ± • TOPOLOGICAL IDENTIFICATION INSTRUMENT</p>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
