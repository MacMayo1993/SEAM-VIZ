import React, { useState, useRef } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color, Ion } from 'cesium';
import { Link } from 'react-router-dom';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Set Cesium Ion access token
const cesiumToken = (import.meta as any).env?.VITE_CESIUM_TOKEN;
if (cesiumToken) {
  Ion.defaultAccessToken = cesiumToken;
}

// Section type for navigation
type TutorialSection = 'intro' | 'terminology' | 'concepts' | 'interactive' | 'shapes';

const Tutorials: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<TutorialSection>('intro');

  // Interactive demo state (for the Cesium globe section)
  const [point, setPoint] = useState<Cartesian3>(Cartesian3.fromDegrees(0, 0, 0));
  const [clickCount, setClickCount] = useState(0);
  const antipodal = Cartesian3.negate(point, new Cartesian3());
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

  // Section navigation
  const sections: { id: TutorialSection; title: string; emoji: string }[] = [
    { id: 'intro', title: 'Introduction', emoji: '🌐' },
    { id: 'terminology', title: 'Key Concepts', emoji: '📚' },
    { id: 'concepts', title: 'Quotient Spaces', emoji: '🔄' },
    { id: 'interactive', title: 'Interactive Demo', emoji: '🌍' },
    { id: 'shapes', title: 'Shape Gallery', emoji: '🎯' },
  ];

  const getSectionIndex = () => sections.findIndex(s => s.id === currentSection);
  const canGoPrev = getSectionIndex() > 0;
  const canGoNext = getSectionIndex() < sections.length - 1;

  const handlePrev = () => {
    if (canGoPrev) setCurrentSection(sections[getSectionIndex() - 1].id);
  };

  const handleNext = () => {
    if (canGoNext) setCurrentSection(sections[getSectionIndex() + 1].id);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      position: 'relative',
    }}>

      {/* Header Navigation */}
      <nav style={{
        padding: '20px 40px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem', letterSpacing: '0.15em' }}>
            SEAM VIZ TUTORIAL
          </h1>
          <p style={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>
            Learning Through Play: Topology, Quotient Spaces, and Projective Geometry
          </p>
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '10px 20px',
            fontSize: '14px',
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
      </nav>

      {/* Section Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        flexWrap: 'wrap',
      }}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(section.id)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: currentSection === section.id ? 'bold' : 'normal',
              backgroundColor: currentSection === section.id
                ? 'rgba(0, 229, 188, 0.3)'
                : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              border: currentSection === section.id
                ? '2px solid #00e5bc'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {section.emoji} {section.title}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '40px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>

        {/* Introduction Section */}
        {currentSection === 'intro' && (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#00e5bc' }}>
              Welcome to Topological Exploration
            </h2>

            <section style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00e5bc' }}>
                What is Topology?
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Topology is the mathematical study of shapes and spaces that focuses on properties
                preserved under <strong>continuous deformations</strong>—stretching, bending, and twisting—but
                not tearing or gluing (unless specified).
              </p>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Think of it like playing with clay: you can mold a sphere into an egg shape, or flatten
                it slightly, and topologically it's still "the same" object. But if you poke a hole through it,
                you've fundamentally changed its topology—now it's more like a donut (torus)!
              </p>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(0, 229, 188, 0.1)',
                borderLeft: '4px solid #00e5bc',
                borderRadius: '8px',
                marginTop: '1.5rem',
              }}>
                <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>
                  💡 <strong>Key Insight:</strong> In topology, a coffee cup and a donut are considered
                  equivalent because you can continuously deform one into the other (they both have one hole).
                  This idea of "equivalence under transformation" is central to understanding quotient spaces.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00e5bc' }}>
                Why Study Manifolds?
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                A <strong>manifold</strong> is a topological space that locally looks like ordinary Euclidean
                space (the familiar flat space of everyday geometry), but globally can have interesting structure.
              </p>
              <ul style={{ fontSize: '1.1rem', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  A <strong>circle (S¹)</strong> is a 1-dimensional manifold—locally it looks like a line segment
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  A <strong>sphere (S²)</strong> is a 2-dimensional manifold—locally it looks like a flat plane
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Our universe might be a 3-dimensional manifold with complex global topology!
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00e5bc' }}>
                The Power of Identification
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                One of topology's most powerful techniques is <strong>identification</strong>: declaring that
                certain distinct points should be considered "the same." This creates <strong>quotient spaces</strong>.
              </p>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                When you identify points, you're not physically moving or gluing anything—you're changing the
                <em>information structure</em> of the space. You're deciding which distinctions matter and which don't.
              </p>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginTop: '1.5rem',
              }}>
                <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                  <strong>Example:</strong> Take a rectangular piece of paper. If you identify (glue)
                  the left and right edges, you get a cylinder. If you also identify the top and bottom edges,
                  you get a torus (donut shape). Same paper, different identifications, radically different topology!
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Terminology Section */}
        {currentSection === 'terminology' && (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#00e5bc' }}>
              Key Concepts & Terminology
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem' }}>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.5rem' }}>
                  📐 Manifold
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  A topological space that locally resembles Euclidean space. Examples: circles, spheres,
                  tori. Think of the Earth's surface—locally flat, globally spherical.
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.5rem' }}>
                  🔄 Quotient Space
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  A new space formed by declaring certain points equivalent via an <strong>identification rule</strong>.
                  Notation: <code style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>X / ~</code> means "space X with equivalence relation ~"
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic' }}>
                  The quotient "forgets" certain distinctions, collapsing states that are equivalent under the rule.
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(0, 229, 188, 0.1)',
                borderRadius: '12px',
                border: '2px solid #00e5bc',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.5rem' }}>
                  🎯 Real Projective Plane (ℝP²)
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  The quotient space formed by identifying <strong>antipodal points</strong> on a sphere S².
                </p>
                <p style={{
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  margin: '1rem 0',
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                }}>
                  ℝP² = S² / (u ≡ −u)
                </p>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  This space is <strong>non-orientable</strong>: you cannot consistently define "inside" vs "outside"
                  or "clockwise" vs "counterclockwise" globally. ℝP² cannot be embedded in 3D space without self-intersection.
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.5rem' }}>
                  ⚡ Antipodal Points
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  Two points on a sphere are <strong>antipodal</strong> if they are diametrically opposite—connected
                  by a straight line through the center. On Earth: the North and South Poles, or New York and a point
                  in the Indian Ocean.
                </p>
                <p style={{
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                }}>
                  If u is a point, then −u is its antipodal opposite.
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.5rem' }}>
                  🌀 Morphing vs. Eversion
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  <strong>Morphing:</strong> A continuous deformation from one shape to another (e.g., sphere → ellipsoid).
                </p>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  <strong>Eversion:</strong> Turning a surface inside-out through continuous deformation. The famous
                  "sphere eversion" proves that a sphere can be turned inside out in 4D space without creating holes or creases!
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.5rem' }}>
                  🧭 Orientability
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  A surface is <strong>orientable</strong> if you can define a consistent "clockwise" direction everywhere.
                  A sphere is orientable. A Möbius strip and ℝP² are <strong>non-orientable</strong>—if you travel around them,
                  your orientation flips!
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Core Concepts Section */}
        {currentSection === 'concepts' && (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#00e5bc' }}>
              Understanding Quotient Symmetry
            </h2>

            <section style={{ marginBottom: '2.5rem', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#00e5bc' }}>
                The Core Idea: u ≡ −u
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                The projective plane emerges from a simple but profound identification rule:
                <strong> opposite directions are equivalent</strong>.
              </p>
              <div style={{
                padding: '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                border: '2px solid #00e5bc',
                margin: '1.5rem 0',
              }}>
                <p style={{ fontSize: '1.3rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
                  Direction Space: S²
                </p>
                <p style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.9 }}>
                  Every direction in 3D space corresponds to a point on the unit sphere
                </p>
                <p style={{
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  padding: '15px',
                  backgroundColor: 'rgba(0, 229, 188, 0.15)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}>
                  u ≡ −u
                </p>
                <p style={{ fontSize: '1rem', textAlign: 'center', opacity: 0.9 }}>
                  When orientation is discarded, antipodal points become identical
                </p>
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                This isn't a physical transformation—we're not moving or gluing points. We're declaring an
                <strong> information-theoretic equivalence</strong>: if you can't distinguish direction from its
                opposite, then <code style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>u</code> and <code style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>−u</code> represent the same state.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#00e5bc' }}>
                Why This Creates Non-Orientability
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                On the original sphere S², you could paint one hemisphere red and the other blue, creating
                a consistent "orientation." But in ℝP², since u ≡ −u, those hemispheres are <em>identified</em>.
              </p>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                <p style={{ fontSize: '1rem', fontStyle: 'italic', opacity: 0.9 }}>
                  Imagine walking along a path on the projective plane. When you return to your starting point,
                  you might find that "left" and "right" have swapped! This is the hallmark of non-orientability.
                </p>
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                The quotient operation collapses the sphere's antipodal symmetry, and this collapse
                <strong> necessarily produces</strong> a non-orientable space. It's not a choice or an artifact—it's
                a mathematical inevitability.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#00e5bc' }}>
                Visualizing the Identification
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                SEAM VIZ uses <strong>antipodal spotlights</strong> to make this identification visible without
                cutting or deforming anything:
              </p>
              <ul style={{ fontSize: '1.1rem', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  Select a direction <strong>u</strong> on the sphere
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Its antipodal opposite <strong>−u</strong> is automatically highlighted
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Points on the object are colored if they align with either <strong>u</strong> or <strong>−u</strong>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  You cannot select one without the other—they are <em>identified</em>
                </li>
              </ul>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(0, 229, 188, 0.1)',
                borderLeft: '4px solid #00e5bc',
                borderRadius: '8px',
              }}>
                <p style={{ fontSize: '1rem' }}>
                  💡 <strong>The Power of This Approach:</strong> By making equivalence classes visible as
                  simultaneous highlights, you can <em>see</em> how the quotient works without needing to imagine
                  impossible 3D embeddings of ℝP².
                </p>
              </div>
            </section>

            <section style={{ lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#00e5bc' }}>
                From Abstraction to Interaction
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                In the next sections, you'll interact with these concepts directly:
              </p>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{
                  padding: '15px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #00e5bc',
                }}>
                  <strong>Interactive Demo:</strong> Click on Earth to see antipodal identification in action
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #00e5bc',
                }}>
                  <strong>Shape Gallery:</strong> Explore how different shapes respond to projective identification
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #00e5bc',
                }}>
                  <strong>Main Explorer:</strong> Play with the full instrument to discover emergent properties
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Interactive Demo Section */}
        {currentSection === 'interactive' && (
          <div style={{ animation: 'fadeIn 0.5s ease-in', height: '100%' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00e5bc' }}>
              Interactive Demonstration: Antipodal Points on Earth
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Click anywhere on the globe below to select a point. Watch as its <strong>antipodal opposite</strong>
              is instantly highlighted on the other side of Earth. This demonstrates the fundamental concept of
              antipodal identification: <code style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>u ≡ −u</code>
            </p>

            {clickCount > 0 && (
              <div style={{
                padding: '15px 20px',
                backgroundColor: 'rgba(0, 229, 188, 0.2)',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00e5bc' }}>
                  🎯 Points clicked: {clickCount} • Keep exploring different locations!
                </p>
              </div>
            )}

            {/* Cesium Globe */}
            <div style={{
              height: '500px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(0, 229, 188, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 229, 188, 0.2)',
            }}>
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
                    text: 'Point u',
                    font: '16px sans-serif',
                    fillColor: Color.WHITE,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    verticalOrigin: 1,
                    pixelOffset: new Cartesian3(0, -25, 0),
                    showBackground: true,
                    backgroundColor: Color.fromCssColorString('rgba(255, 0, 0, 0.8)'),
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
                    text: 'Point −u (Antipodal)',
                    font: '16px sans-serif',
                    fillColor: Color.WHITE,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    verticalOrigin: 1,
                    pixelOffset: new Cartesian3(0, -25, 0),
                    showBackground: true,
                    backgroundColor: Color.fromCssColorString('rgba(0, 229, 188, 0.8)'),
                  }}
                />
              </Viewer>
            </div>

            {/* Explanation Box */}
            <div style={{
              marginTop: '1.5rem',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#00e5bc' }}>
                💡 What You're Seeing
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.7', marginBottom: '0.75rem' }}>
                The red point (<strong>u</strong>) and cyan point (<strong>−u</strong>) are always diametrically
                opposite, connected by a line through Earth's center.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: '1.7', marginBottom: '0.75rem' }}>
                In projective geometry, these two points represent the <em>same</em> equivalence class <strong>[u]</strong>
                because we've identified u ≡ −u. The distinction between "this direction" and "the opposite direction"
                has been erased.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                This is the foundation of the real projective plane ℝP². In the main explorer, you'll see how
                this identification applies to <em>all</em> antipodal pairs simultaneously, creating a complete
                quotient space structure.
              </p>
            </div>
          </div>
        )}

        {/* Shape Gallery Section */}
        {currentSection === 'shapes' && (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00e5bc' }}>
              Shape Gallery: Exploring Quotient Identification
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              SEAM VIZ includes a variety of shapes to explore projective identification. Each shape responds
              to the antipodal spotlight in different ways, revealing how quotient symmetry works across different geometries.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

              {/* Sphere */}
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 229, 188, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.75rem' }}>
                  🌐 Sphere (S²)
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  The canonical example. The sphere's antipodal symmetry is built-in: every point has a natural
                  opposite through the center.
                </p>
                <div style={{
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}>
                  S² / (u ≡ −u) = ℝP²
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                  When you select a direction on the sphere, both "caps" light up simultaneously—perfect symmetry.
                </p>
              </div>

              {/* Circle */}
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 229, 188, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.75rem' }}>
                  ⭕ Circle (S¹)
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  A 1-dimensional manifold embedded in 3D. Antipodal identification on a circle creates a
                  fascinating result.
                </p>
                <div style={{
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}>
                  S¹ / (u ≡ −u) = ℝP¹ ≅ S¹
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                  Interestingly, ℝP¹ is topologically equivalent to a circle—identifying opposite points "wraps" the circle!
                </p>
              </div>

              {/* Cube */}
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 229, 188, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.75rem' }}>
                  📦 Cube
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  A polyhedral shape with flat faces and edges. Watch how antipodal identification creates
                  symmetric patterns across opposite faces.
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                  The cube's corners and edges reveal how quotient identification works on discrete symmetries—pairs
                  of opposite faces light up together.
                </p>
              </div>

              {/* Torus */}
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 229, 188, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.75rem' }}>
                  🍩 Torus
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  The donut shape has two independent cycles and different curvature regions (positive on the outside,
                  negative on the inside).
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                  Antipodal identification on the torus creates interesting asymmetric patterns—the shape doesn't have
                  built-in antipodal symmetry like the sphere!
                </p>
              </div>

              {/* Triangle */}
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 229, 188, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.75rem' }}>
                  🔺 Triangle
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  A flat planar shape embedded in 3D space. The simplest polygon demonstrates how 2D surfaces
                  respond to 3D direction identification.
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                  Planar shapes have only two "sides" (front and back), so antipodal identification shows a stark
                  binary pattern.
                </p>
              </div>

              {/* Square */}
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 229, 188, 0.3)',
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#00e5bc', marginBottom: '0.75rem' }}>
                  ⬛ Square
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  Another planar shape, but with four-fold symmetry. Demonstrates how quotient identification
                  interacts with existing geometric symmetries.
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                  The square's right angles create clean boundaries for the antipodal spotlight cones.
                </p>
              </div>

            </div>

            <div style={{
              marginTop: '2rem',
              padding: '25px',
              backgroundColor: 'rgba(0, 229, 188, 0.1)',
              borderRadius: '12px',
              border: '2px solid #00e5bc',
            }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#00e5bc' }}>
                🚀 Ready to Explore?
              </h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1rem' }}>
                Now that you understand the concepts, it's time to experience them interactively!
                The Quotient Symmetry Explorer lets you:
              </p>
              <ul style={{ fontSize: '1rem', marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  Click any shape to select directions and see antipodal identification in real-time
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Adjust the spotlight aperture to control the identification "resolution"
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Switch between shapes to compare how different geometries respond
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Enter Drive Mode (click the sphere) to navigate the quotient space continuously
                </li>
              </ul>
              <p style={{ fontSize: '1rem', lineHeight: '1.7', fontStyle: 'italic', opacity: 0.9 }}>
                Remember: you're not just looking at shapes—you're exploring an <strong>information-theoretic instrument</strong>
                that reveals how distinctions collapse under quotient symmetry. Play, experiment, and discover!
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer Navigation */}
      <footer style={{
        padding: '25px 40px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: canGoPrev ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            color: canGoPrev ? 'white' : 'rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
          }}
        >
          ← Previous
        </button>

        <div style={{ fontSize: '14px', opacity: 0.7, textAlign: 'center' }}>
          Section {getSectionIndex() + 1} of {sections.length}: {sections[getSectionIndex()].title}
        </div>

        {canGoNext ? (
          <button
            onClick={handleNext}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#00e5bc',
              color: '#1a1a2e',
              border: '2px solid #00e5bc',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            Next →
          </button>
        ) : (
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
              Launch Explorer →
            </button>
          </Link>
        )}
      </footer>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Tutorials;
