import React, { useState, useRef } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color, Ion } from 'cesium';
import { Link } from 'react-router-dom';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Set Cesium Ion access token (optional - will use default assets if not set)
// To use high-res imagery, sign up at ion.cesium.com and add token to .env as VITE_CESIUM_TOKEN
const cesiumToken = (import.meta as any).env?.VITE_CESIUM_TOKEN;
if (cesiumToken) {
  Ion.defaultAccessToken = cesiumToken;
}

const Tutorials: React.FC = () => {
  // Default point at equator/prime meridian
  const [point, setPoint] = useState<Cartesian3>(Cartesian3.fromDegrees(0, 0, 0));
  const [clickCount, setClickCount] = useState(0);

  // Calculate antipodal point by negating the Cartesian3 vector
  const antipodal = Cartesian3.negate(point, new Cartesian3());

  // Store viewer reference
  const viewerRef = useRef<any>(null);

  const handleScreenSpaceEvent = (movement: any) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
    if (cartesian) {
      setPoint(cartesian.clone());
      setClickCount(prev => prev + 1);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a2e' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        textAlign: 'center',
        zIndex: 1000,
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Tutorial: Understanding Antipodality
        </h2>
        <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
          Click any point on Earth to see its <strong>antipodal opposite</strong> instantly highlighted.
          This demonstrates the fundamental concept of antipodal identification: points that are directly opposite on a sphere.
        </p>
        {clickCount > 0 && (
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#00e5bc' }}>
            Points clicked: {clickCount} • Try clicking different locations!
          </p>
        )}
      </div>

      {/* Cesium Globe Viewer */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Viewer
          full
          ref={viewerRef}
          onClick={handleScreenSpaceEvent}
          timeline={false}
          animation={false}
          baseLayerPicker={false}
          geocoder={false}
          homeButton={false}
          sceneModePicker={false}
          navigationHelpButton={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Selected Point (Red) */}
          <Entity
            position={point}
            point={{
              pixelSize: 20,
              color: Color.RED,
              outlineColor: Color.WHITE,
              outlineWidth: 3,
            }}
            label={{
              text: 'Selected Point',
              font: '14px sans-serif',
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              verticalOrigin: 1, // BOTTOM
              pixelOffset: new Cartesian3(0, -20, 0),
              showBackground: true,
              backgroundColor: Color.fromCssColorString('rgba(0, 0, 0, 0.7)'),
            }}
          />

          {/* Antipodal Point (Cyan) */}
          <Entity
            position={antipodal}
            point={{
              pixelSize: 20,
              color: Color.CYAN,
              outlineColor: Color.WHITE,
              outlineWidth: 3,
            }}
            label={{
              text: 'Antipodal Point',
              font: '14px sans-serif',
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              verticalOrigin: 1, // BOTTOM
              pixelOffset: new Cartesian3(0, -20, 0),
              showBackground: true,
              backgroundColor: Color.fromCssColorString('rgba(0, 0, 0, 0.7)'),
            }}
          />
        </Viewer>
      </div>

      {/* Footer Navigation */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        zIndex: 1000,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
            ← Back to Menu
          </button>
        </Link>

        <Link to="/quotient" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#00e5bc',
            color: '#1a1a2e',
            border: '2px solid #00e5bc',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
            Next: Quotient Symmetry Explorer →
          </button>
        </Link>
      </div>

      {/* Info Box */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        maxWidth: '350px',
        zIndex: 500,
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#00e5bc' }}>💡 Key Concept</h3>
        <p>
          Two points on a sphere are <strong>antipodal</strong> if they are diametrically opposite
          (connected by a line through the center). In projective geometry, we identify antipodal
          points as equivalent: <strong>u ≡ −u</strong>.
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.7 }}>
          This concept is fundamental to understanding quotient spaces and projective planes.
        </p>
      </div>
    </div>
  );
};

export default Tutorials;
