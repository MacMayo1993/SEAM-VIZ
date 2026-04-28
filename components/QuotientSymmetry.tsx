
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Center, Environment, OrbitControls, Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vec3, Mesh, makeShapeMesh, ShapeId } from '../core';
import { AntipodalColorPicker } from '../app/ui/AntipodalColorPicker';
import { getAntipodalColor } from '../app/ui/colorUtils';
import { FiberBundles } from '../app/rendering/FiberBundle';
import { updatePositionFromWASD, moveOnSphere, type WASDState } from '../app/ui/sphericalNavigation';
import { Link } from 'react-router-dom';

// --- Semantic Constants ---
const THEME_DARK = "#2D3436";
const INACTIVE_GRAY = "#E2E8F0";

// --- Assets: High-Fidelity Scientific Icons ---
const Icon = {
  Home: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Laboratory: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5" />
    </svg>
  ),

  Library: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h15v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
    </svg>
  ),
  Pulse: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Chevron: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
};

// --- Components ---

const InternalCone = ({ dir, color, angle, renderOrder }: { dir: Vec3, color: string, angle: number, renderOrder: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const upRef = useRef(new THREE.Vector3(0, 1, 0));
  const targetRef = useRef(new THREE.Vector3());

  useFrame(() => {
    if (groupRef.current) {
      targetRef.current.set(...dir).normalize();
      if (upRef.current.dot(targetRef.current) < -0.9999) {
        // Antiparallel singularity: rotate 180° around X-axis instead
        groupRef.current.quaternion.set(1, 0, 0, 0);
      } else {
        groupRef.current.quaternion.setFromUnitVectors(upRef.current, targetRef.current);
      }
    }
  });

  const coneHeight = Math.cos(Math.min(angle, Math.PI / 2));
  const coneRadius = Math.sin(Math.min(angle, Math.PI / 2));
  const interiorOpacity = 0.35;

  return (
    <group ref={groupRef}>
      <mesh position={[0, coneHeight / 2, 0]} rotation={[Math.PI, 0, 0]} renderOrder={renderOrder}>
        <coneGeometry args={[coneRadius, coneHeight, 64, 1, false]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={interiorOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh renderOrder={renderOrder + 1}>
        <sphereGeometry args={[1.002, 64, 32, 0, Math.PI * 2, 0, angle]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

const IdentificationCones = ({ direction, angle, uColor, negUColor }: { direction: Vec3, angle: number, uColor: string, negUColor: string }) => {
  const u = useMemo(() => Vec3.normalize(direction), [direction]);
  const um = useMemo(() => Vec3.neg(u), [u]);

  return (
    <group>
      <InternalCone dir={u} color={uColor} angle={angle} renderOrder={10} />
      <InternalCone dir={um} color={negUColor} angle={angle} renderOrder={11} />
      <mesh renderOrder={20}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshBasicMaterial color={THEME_DARK} />
      </mesh>
    </group>
  );
};

const ObjectMesh = ({
  meshData,
  direction,
  angle,
  uColor,
  negUColor,
  onUpdate
}: {
  meshData: Mesh,
  direction: Vec3,
  angle: number,
  uColor: string,
  negUColor: string,
  onUpdate?: (dir: Vec3) => void
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meshData.vertices.flat()), 3));
    g.setIndex(meshData.indices);
    g.computeVertexNormals();
    return { geometry: g };
  }, [meshData]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uDir.value.set(...direction).normalize();
      materialRef.current.uniforms.uAperture.value = angle;
      materialRef.current.uniforms.uColorU.value.set(uColor);
      materialRef.current.uniforms.uColorNegU.value.set(negUColor);
    }
  });

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uDir: { value: new THREE.Vector3(...direction).normalize() },
      uAperture: { value: angle },
      uColorU: { value: new THREE.Color(uColor) },
      uColorNegU: { value: new THREE.Color(negUColor) },
      uInactiveColor: { value: new THREE.Color(INACTIVE_GRAY) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uDir;
      uniform float uAperture;
      uniform vec3 uColorU;
      uniform vec3 uColorNegU;
      uniform vec3 uInactiveColor;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 posDir = normalize(vPosition);

        float dotU = dot(posDir, uDir);
        float dotNegU = dot(posDir, -uDir);

        float cosAperture = cos(uAperture);

        // Anti-aliased boundary
        float edgeWidth = 0.01;
        float maskU = smoothstep(cosAperture - edgeWidth, cosAperture + edgeWidth, dotU);
        float maskNegU = smoothstep(cosAperture - edgeWidth, cosAperture + edgeWidth, dotNegU);

        vec3 color = mix(uInactiveColor, uColorU, maskU);
        color = mix(color, uColorNegU, maskNegU);

        // Subtle Lambertian shading for depth
        float diff = max(dot(n, normalize(vec3(1.0, 1.0, 1.0))), 0.4);
        gl_FragColor = vec4(color * (diff * 0.8 + 0.2), 1.0);
      }
    `
  }), [uColor, negUColor]);

  return (
    <mesh geometry={geometry} onPointerDown={(e) => { e.stopPropagation(); onUpdate?.([e.point.x, e.point.y, e.point.z]); }} castShadow>
      <shaderMaterial
        ref={materialRef}
        args={[shaderArgs]}
        side={THREE.DoubleSide}
      />
      <Edges color="#94a3b8" threshold={25} />
    </mesh>
  );
};

// Drive Controller - handles continuous WASD movement
const DriveController = ({
  active,
  keys,
  currentPosition,
  onPositionUpdate,
  flipDir,
}: {
  active: boolean;
  keys: WASDState;
  currentPosition: Vec3;
  onPositionUpdate: (pos: Vec3) => void;
  flipDir: boolean;
}) => {
  useFrame((state, delta) => {
    if (!active) return;

    const drivePos: Vec3 = flipDir ? Vec3.neg(currentPosition) : currentPosition;
    const newDrivePos = updatePositionFromWASD(drivePos, keys, delta, 2.0);
    const newPosition: Vec3 = flipDir ? Vec3.neg(newDrivePos) : newDrivePos;

    if (!Vec3.approxEq(newPosition, currentPosition, 0.0001)) {
      onPositionUpdate(newPosition);
    }
  });

  return null; // This component doesn't render anything
};

const SelectorInstrument = ({
  direction,
  angle,
  uColor,
  negUColor,
  onUpdate,
  driveMode
}: {
  direction: Vec3,
  angle: number,
  uColor: string,
  negUColor: string,
  onUpdate: (dir: Vec3) => void;
  driveMode: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const handlePointer = useCallback((e: ThreeEvent<PointerEvent>) => {
    // Only update if it was a click/tap, not a drag (to distinguish from OrbitControls)
    if (e.type === 'pointerdown' || (e.type === 'pointerup' && e.distance < 2)) {
      const n = e.point.clone().normalize();
      onUpdate([n.x, n.y, n.z]);
    }
  }, [onUpdate]);

  return (
    <group>
      {/* Interaction Shell - Invisible but catches clicks */}
      <mesh ref={meshRef} onPointerDown={handlePointer} renderOrder={100}>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <IdentificationCones direction={direction} angle={angle} uColor={uColor} negUColor={negUColor} />

      {/* Visual Sphere Shell */}
      <mesh renderOrder={50}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      <mesh renderOrder={51}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial color="#94a3b8" wireframe transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
};

const StampedDirections = ({
  stamps,
  meshData,
}: {
  stamps: Array<{ dir: Vec3; color: string; id: number }>;
  meshData: Mesh;
}) => {
  // Project each stamp direction onto the closest vertex on the actual mesh surface
  // so stamps land on the mesh rather than floating on the bounding sphere.
  const positions = useMemo<Vec3[]>(() => stamps.map(stamp => {
    const n = Vec3.normalize(stamp.dir);
    let bestDot = -Infinity;
    let bestVert: Vec3 = n;
    for (const v of meshData.vertices) {
      const d = Vec3.dot(Vec3.normalize(v), n);
      if (d > bestDot) { bestDot = d; bestVert = v; }
    }
    return Vec3.scale(Vec3.normalize(bestVert), Vec3.norm(bestVert) * 1.04);
  }), [stamps, meshData]);

  return (
    <group>
      {stamps.map((stamp, i) => (
        <mesh key={stamp.id} position={positions[i]} renderOrder={30}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            color={stamp.color}
            emissive={stamp.color}
            emissiveIntensity={0.3}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

const UDirectionMarkers = ({
  direction,
  uColor,
  negUColor
}: {
  direction: Vec3;
  uColor: string;
  negUColor: string;
}) => {
  const u = useMemo(() => Vec3.normalize(direction), [direction]);
  const negU = useMemo(() => Vec3.neg(u), [u]);
  const r = 1.14;

  const labelStyle = (color: string): React.CSSProperties => ({
    color,
    fontWeight: 900,
    fontSize: '9px',
    fontFamily: 'Georgia, serif',
    background: 'rgba(255,255,255,0.92)',
    padding: '0px 4px',
    borderRadius: '3px',
    userSelect: 'none',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    border: `1px solid ${color}55`,
    marginLeft: '5px',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  });

  return (
    <group>
      <mesh position={[u[0] * r, u[1] * r, u[2] * r]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={uColor} />
        <Html center distanceFactor={6} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div style={labelStyle(uColor)}>u</div>
        </Html>
      </mesh>
      <mesh position={[negU[0] * r, negU[1] * r, negU[2] * r]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={negUColor} />
        <Html center distanceFactor={6} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div style={labelStyle(negUColor)}>−u</div>
        </Html>
      </mesh>
    </group>
  );
};

interface StampCapData {
  dir: Vec3;
  aperture: number;
  uColor: string;
  negUColor: string;
  id: number;
}

// A single frozen stamp rendered as a shader pass on the actual mesh geometry.
// Uses normalize(position) for direction, matching ObjectMesh's live highlight exactly,
// so the stamp conforms perfectly to any mesh shape (torus, cube, sphere, etc.).
const MeshCapStamp = ({ dir, aperture, uColor, negUColor, meshData }: {
  dir: Vec3;
  aperture: number;
  uColor: string;
  negUColor: string;
  meshData: Mesh;
  elevation: number;
}) => {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meshData.vertices.flat()), 3));
    g.setIndex(meshData.indices);
    g.computeVertexNormals();
    return g;
  }, [meshData]);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uDir: { value: new THREE.Vector3(...dir).normalize() },
      uAperture: { value: aperture },
      uColorU: { value: new THREE.Color(uColor) },
      uColorNegU: { value: new THREE.Color(negUColor) },
      uElevation: { value: elevation },
    },
    vertexShader: `
      uniform float uElevation;
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        // Displace along surface normal for stacking height
        vec3 elevated = position + normal * uElevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(elevated, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uDir;
      uniform float uAperture;
      uniform vec3 uColorU;
      uniform vec3 uColorNegU;
      varying vec3 vPosition;
      void main() {
        // Use original position (before elevation) for cap region test
        vec3 posDir = normalize(vPosition);
        float dotU = dot(posDir, uDir);
        float dotNegU = dot(posDir, -uDir);
        float cosAperture = cos(uAperture);
        float edge = 0.015;
        float maskU = smoothstep(cosAperture - edge, cosAperture + edge, dotU);
        float maskNegU = smoothstep(cosAperture - edge, cosAperture + edge, dotNegU);
        float alpha = max(maskU, maskNegU) * 0.45;
        if (alpha < 0.01) discard;
        vec3 color = maskU >= maskNegU ? uColorU : uColorNegU;
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [dir, aperture, uColor, negUColor, elevation]);

  return (
    <mesh geometry={geometry} renderOrder={27 + elevation * 100}>
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

const STAMP_ELEVATION_STEP = 0.06;

const StampCapsLayer = ({ caps, meshData }: { caps: StampCapData[]; meshData: Mesh }) => (
  <group>
    {caps.map((cap, i) => (
      <MeshCapStamp
        key={cap.id}
        dir={cap.dir}
        aperture={cap.aperture}
        uColor={cap.uColor}
        negUColor={cap.negUColor}
        meshData={meshData}
        elevation={i * STAMP_ELEVATION_STEP}
      />
    ))}
  </group>
);

const DPad = ({ onKey }: { onKey: (key: keyof WASDState, pressed: boolean) => void }) => {
  const cell: React.CSSProperties = {
    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 9, color: 'rgba(255,255,255,0.88)', cursor: 'pointer',
    touchAction: 'none', userSelect: 'none',
  };

  const bind = (key: keyof WASDState) => ({
    style: cell,
    onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      onKey(key, true);
    },
    onPointerUp() { onKey(key, false); },
    onPointerLeave() { onKey(key, false); },
  });

  return (
    <div style={{ position: 'absolute', left: 10, bottom: 52, zIndex: 25, display: 'grid', gridTemplateColumns: '40px 40px 40px', gap: 4 }}>
      <div /><div {...bind('w')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div><div />
      <div {...bind('a')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div>
      <div style={{ ...cell, opacity: 0.15, cursor: 'default' }} />
      <div {...bind('d')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
      <div /><div {...bind('s')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div><div />
    </div>
  );
};

const AbstractUIBackground = ({ uColor, negUColor, aperture }: { uColor: string, negUColor: string, aperture: number }) => {
  const glowOpacity = useMemo(() => {
    const normalized = (aperture - 0.05) / (1.5 - 0.05);
    return 0.15 + normalized * 0.45;
  }, [aperture]);

  const alphaHex = Math.floor(glowOpacity * 255).toString(16).padStart(2, '0');

  const spread = useMemo(() => {
    const normalized = (aperture - 0.05) / (1.5 - 0.05);
    return 35 + normalized * 45;
  }, [aperture]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `
            radial-gradient(circle at 50% -20%, ${uColor}${alphaHex}, transparent ${spread}%),
            radial-gradient(circle at 50% 120%, ${negUColor}${alphaHex}, transparent ${spread}%)
          `
        }}
      />
      <div className="stipple-overlay" />
    </div>
  );
};

// --- View 2: Library (Theory & Abstract) ---
const LibraryView = () => (
  <div className="flex-1 min-h-0 bg-white p-12 overflow-y-auto text-left">
    <article className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">SEAM-VIZ Protocol</h1>
      <p className="text-base font-serif text-slate-500 italic mb-10 border-b border-slate-100 pb-10">
        Operationalizing Quotient Geometry Through Commutativity and Action
      </p>

      <div className="space-y-8 text-slate-700 leading-relaxed text-base">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Pedagogical Problem</h2>
          <p className="mb-4">
            Current pedagogy on quotient spaces and the real projective plane ℝP² relies on static diagrams,
            failing to operationalize how identification affects action and observation. Students learn the
            formal construction but cannot <em>interact</em> with the quotient map as a computational primitive.
          </p>
          <div className="p-8 bg-slate-50 rounded-2xl border-l-4 border-slate-900 italic text-slate-600">
            "The identification x ≡ −x simultaneously liberates computation and enforces observational symmetry."
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Information-Theoretic Framing</h2>
          <p className="mb-4">
            We present <strong>SEAM-VIZ</strong>, an interactive instrument that treats the quotient map
            π: S² → ℝP² as a computational transform exploiting commutativity rather than a geometric construction.
            The real projective plane emerges not from gluing, but from declaring an equivalence relation on
            the direction space.
          </p>
          <p className="mb-4">
            When we identify antipodal points u ≡ −u, we're making an <strong>information-theoretic commitment</strong>:
            orientation parity becomes unobservable. The quotient space ℝP² is the space of equivalence classes [u],
            where each class contains exactly two representatives that differ by sign.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Topology and Orientation Parity</h2>
          <p className="mb-4">
            The real projective plane ℝP² is <strong>non-orientable</strong>. This isn't a defect—it's the
            inevitable consequence of the antipodal identification. You cannot consistently assign "inside" and
            "outside" or define a continuous normal vector field across the entire space.
          </p>
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 mb-4">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Key Topological Properties of ℝP²</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>• Non-orientable:</strong> Cannot be embedded in ℝ³ without self-intersection</li>
              <li><strong>• Compact:</strong> Closed and bounded, with no boundary</li>
              <li><strong>• Fundamental group:</strong> π₁(ℝP²) ≅ ℤ₂ (detects the double cover)</li>
              <li><strong>• Euler characteristic:</strong> χ(ℝP²) = 1</li>
            </ul>
          </div>
          <p>
            The sphere S² is the <strong>universal cover</strong> of ℝP², with covering map π: S² → ℝP²
            defined by π(u) = π(−u) = [u]. This is a 2:1 covering, meaning each point in ℝP² has exactly
            two preimages in S².
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Drive Mode: Navigating the Quotient</h2>
          <p className="mb-4">
            The <strong>Drive Mode</strong> allows continuous navigation through the quotient space, making
            the fiber bundle structure π⁻¹([u]) visible as you traverse ℝP². Each position in the quotient
            space corresponds to a fiber of two antipodal points in S².
          </p>
          <p>
            As you drive, fiber bundles are drawn in your wake, creating a <strong>visual trace</strong> of
            the covering map. This operational approach transforms an abstract topological concept into an
            interactive, explorable mathematical object.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pedagogical Philosophy</h2>
          <p className="mb-4">
            SEAM-VIZ embodies a philosophy of <strong>honest mathematics</strong>: we don't hide the
            complexity, but we make it tractable through interaction. The projective plane isn't "simplified"
            into misleading diagrams—instead, we provide an instrument that reveals its true structure.
          </p>
          <div className="p-8 bg-slate-50 rounded-2xl border-l-4 border-slate-900 italic text-slate-600">
            "You cannot understand a quotient space by looking at it. You must <em>act</em> on it,
            query it, and observe how the identification constrains your observations."
          </div>
        </section>
      </div>
    </article>
  </div>
);

const MAX_FIBER_BUNDLES = 300;

const QuotientSymmetry: React.FC = () => {
  // Page navigation state
  const [page, setPage] = useState<'lab' | 'library'>('lab');

  const [shapeId, setShapeId] = useState<ShapeId>("sphere");
  const [halfAngle, setHalfAngle] = useState(0.4);
  const [currentDir, setCurrentDir] = useState<Vec3>([0, 1, 0]);
  const [uColor, setUColor] = useState("#00e5bc");

  // Antipodal color is always computed from uColor
  const negUColor = useMemo(() => getAntipodalColor(uColor), [uColor]);

  // Drive mode state — trace is on by default
  const [driveMode, setDriveMode] = useState(true);
  const [driveAntipode, setDriveAntipode] = useState(false); // false = drive u, true = drive -u
  const driveAntipodeRef = useRef(false);
  useEffect(() => { driveAntipodeRef.current = driveAntipode; }, [driveAntipode]);
  const [wasdKeys, setWasdKeys] = useState<WASDState>({
    w: false,
    a: false,
    s: false,
    d: false
  });

  // Fiber bundles state - tracks visualizations of π⁻¹([u])
  const [fiberBundles, setFiberBundles] = useState<Array<{
    quotientPoint: Vec3;
    representatives: [Vec3, Vec3];
    colors: [string, string];
    timestamp: number;
  }>>([]);
  const [stamps, setStamps] = useState<Array<{ dir: Vec3; color: string; id: number }>>([]);
  const [stampCaps, setStampCaps] = useState<StampCapData[]>([]);

  // Keyboard event handlers for drive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // ESC exits drive mode
      if (key === 'escape' && driveMode) {
        setDriveMode(false);
        return;
      }

      // WASD keys
      if (!driveMode) return;

      if (key === 'w') setWasdKeys(prev => ({ ...prev, w: true }));
      if (key === 'a') setWasdKeys(prev => ({ ...prev, a: true }));
      if (key === 's') setWasdKeys(prev => ({ ...prev, s: true }));
      if (key === 'd') setWasdKeys(prev => ({ ...prev, d: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!driveMode) return;

      const key = e.key.toLowerCase();
      if (key === 'w') setWasdKeys(prev => ({ ...prev, w: false }));
      if (key === 'a') setWasdKeys(prev => ({ ...prev, a: false }));
      if (key === 's') setWasdKeys(prev => ({ ...prev, s: false }));
      if (key === 'd') setWasdKeys(prev => ({ ...prev, d: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [driveMode]);

  // Callback when clicking quotient sphere - updates direction + stamps both representatives
  const handleQuotientClick = useCallback((dir: Vec3) => {
    const negDir: Vec3 = [-dir[0], -dir[1], -dir[2]];
    setCurrentDir(dir);

    const stampId = Date.now();
    setStamps((prev) => [
      ...prev.slice(-22),
      { dir, color: uColor, id: stampId },
      { dir: negDir, color: negUColor, id: stampId + 1 }
    ]);

    // Create a fiber visualization at the clicked equivalence class
    setFiberBundles(prev => [
      ...prev.slice(-(MAX_FIBER_BUNDLES - 1)),
      {
        quotientPoint: dir,
        representatives: [dir, negDir],
        colors: [uColor, negUColor],
        timestamp: stampId
      }
    ]);
  }, [uColor, negUColor]);

  // Manual stamp at current direction/aperture (for the Stamp button)
  const addStamp = useCallback(() => {
    const id = Date.now();
    setStampCaps(prev => [...prev, { dir: currentDir, aperture: halfAngle, uColor, negUColor, id }]);
  }, [currentDir, halfAngle, uColor, negUColor]);

  // Ref tracking currentDir for use inside pointer handlers (avoids stale closure)
  const currentDirRef = useRef<Vec3>(currentDir);
  useEffect(() => { currentDirRef.current = currentDir; }, [currentDir]);

  // Touch/pointer drag navigation for mobile drive mode
  const lastDrivePointerRef = useRef<{ x: number; y: number } | null>(null);

  const handleDrivePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    lastDrivePointerRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const handleDrivePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!lastDrivePointerRef.current) return;
    const dx = e.clientX - lastDrivePointerRef.current.x;
    const dy = e.clientY - lastDrivePointerRef.current.y;
    lastDrivePointerRef.current = { x: e.clientX, y: e.clientY };
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    const speed = 0.006;
    const flip = driveAntipodeRef.current;
    const drivePoint: Vec3 = flip ? Vec3.neg(currentDirRef.current) : currentDirRef.current;
    const newPoint = moveOnSphere(drivePoint, dx * speed, dy * speed);
    const newDir: Vec3 = flip ? Vec3.neg(newPoint) : newPoint;
    currentDirRef.current = newDir;
    setCurrentDir(newDir);
  }, []);

  const handleDrivePointerUp = useCallback(() => {
    lastDrivePointerRef.current = null;
  }, []);

  const meshData = useMemo(() => makeShapeMesh(shapeId, 64), [shapeId]);


  const leftPanelTitle = useMemo(() => {
    const planar = ["circle", "disk", "triangle", "square"];
    return planar.includes(shapeId) ? "STATE SPACE (ℝ²)" : "STATE SPACE (ℝ³)";
  }, [shapeId]);

  return (
    <div className="flex flex-col h-[100dvh] text-slate-800 font-sans antialiased" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {/* Universal Technical Header */}
      <header className="h-auto min-h-14 border-b border-slate-200 flex items-center justify-between px-2 sm:px-6 py-2 sm:py-0 shrink-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0 overflow-hidden">
          <Link to="/" className="text-slate-950 font-black tracking-tighter flex items-center gap-1 sm:gap-2 text-sm hover:opacity-75 transition-opacity shrink-0">
            <Icon.Laboratory /> <span>SEAM-VIZ</span>
          </Link>
          <span className="h-4 w-px bg-slate-200 hidden sm:block" />
          <nav className="flex gap-1 sm:gap-2 min-w-0 overflow-x-auto pr-1">
            {[
              { id: 'lab' as const, label: 'Laboratory', icon: <Icon.Laboratory /> },
              { id: 'library' as const, label: 'Library', icon: <Icon.Library /> }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPage(btn.id)}
                className={`px-2 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest transition-all whitespace-nowrap shrink-0 ${page === btn.id ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {btn.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="items-center gap-3 sm:gap-6 hidden sm:flex">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
             <div className={`w-1.5 h-1.5 rounded-full ${driveMode ? 'bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-slate-300'}`} />
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{driveMode ? 'Capturing' : 'Standby'}</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-300 hidden md:block">MOD: RP2_PROJ</div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col">
        {/* Laboratory View - The Core Visualization */}
        {page === 'lab' && (
          <div className="flex-1 flex flex-col relative overflow-visible md:overflow-hidden">
            <div className="flex justify-between items-start mb-4 px-4 pt-4 sm:mb-8 sm:px-8 sm:pt-8">
              <div className="text-left">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">Manifold Mapping Laboratory</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium hidden sm:block">Real-time projective identification: S² → ℝP²</p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setDriveAntipode(v => !v)}
                  title="Switch which antipode you are driving"
                  className={`px-2 py-2 sm:px-3 rounded text-[11px] font-black uppercase border transition-all ${driveAntipode ? 'bg-red-600 text-white border-red-600' : 'bg-teal-500 text-white border-teal-500'}`}
                >
                  {driveAntipode ? '−u' : 'u'}
                </button>
                <button
                  onClick={addStamp}
                  className="px-3 py-2 sm:px-5 rounded text-[11px] font-bold uppercase border transition-all bg-white text-slate-700 border-slate-300 hover:border-slate-900"
                >
                  Stamp
                </button>
                <button
                  onClick={() => { setDriveMode(v => { if (!v) setFiberBundles([]); return !v; }); }}
                  className={`px-3 py-2 sm:px-6 rounded text-[11px] font-bold uppercase border transition-all ${driveMode ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'}`}
                >
                  {driveMode ? 'Halt' : 'Resume'}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row p-2 gap-2 sm:p-8 sm:gap-8 overflow-visible md:overflow-hidden">
              {/* Object Space */}
              <section className="h-[280px] sm:h-[340px] md:h-full flex-1 relative rounded-[2.5rem] bg-white/40 border border-white/50 overflow-hidden shadow-inner">
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <div className="bg-black/55 backdrop-blur-sm px-2 py-1 rounded-md">
                    <h2 className="text-[9px] font-black text-white/90 uppercase tracking-widest">{leftPanelTitle}</h2>
                  </div>
                </div>
                <Canvas shadows dpr={[1, 2]}>
                  <PerspectiveCamera makeDefault position={[3.5, 2.5, 4.5]} fov={35} />
                  <OrbitControls makeDefault enableDamping rotateSpeed={0.6} />
                  <Environment preset="city" />
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                  <Center>
                    <ObjectMesh
                      meshData={meshData}
                      direction={currentDir}
                      angle={halfAngle}
                      uColor={uColor}
                      negUColor={negUColor}
                      onUpdate={(dir) => setCurrentDir(dir)}
                    />
                    <StampedDirections stamps={stamps} meshData={meshData} />
                    <StampCapsLayer caps={stampCaps} meshData={meshData} />
                  </Center>
                </Canvas>
              </section>

              {/* Identification Bridge — desktop only */}
              <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-20 pointer-events-none select-none gap-0">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">S²</span>
                <div className="w-px flex-1 min-h-[40px] bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md text-center">
                  <div className="text-base font-black text-slate-800 leading-none mb-1.5">π</div>
                  <div className="text-[9px] font-mono text-slate-400 leading-relaxed">
                    <div>π(u) =</div>
                    <div>π(−u)</div>
                    <div className="text-slate-300">=</div>
                    <div className="text-slate-600 font-bold">[u]</div>
                  </div>
                </div>
                <div className="w-px flex-1 min-h-[40px] bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ℝP²</span>
              </div>

              {/* Projective Selector */}
              <section className="h-[280px] sm:h-[340px] md:h-full flex-1 relative rounded-[2.5rem] bg-white shadow-xl overflow-hidden border border-slate-100/50">
                <div className="absolute top-3 right-3 z-10 text-right pointer-events-none">
                  <div className="inline-flex flex-col items-end gap-1">
                    <div className="bg-black/55 backdrop-blur-sm px-2 py-1 rounded-md">
                      <h2 className="text-[9px] font-black text-white/90 uppercase tracking-widest">QUOTIENT SPACE (ℝP²)</h2>
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      <span className="text-[8px] font-bold text-white/65 uppercase">{driveMode ? `Driving ${driveAntipode ? '−u' : 'u'}` : 'Click to choose [u]'}</span>
                    </div>
                  </div>
                </div>

                {/* Touch/drag capture overlay — intercepts pointer events in drive mode */}
                {driveMode && (
                  <div
                    className="absolute inset-0 z-20"
                    style={{ touchAction: 'none' }}
                    onPointerDown={handleDrivePointerDown}
                    onPointerMove={handleDrivePointerMove}
                    onPointerUp={handleDrivePointerUp}
                    onPointerLeave={handleDrivePointerUp}
                  />
                )}
                {/* D-pad — always visible for navigation */}
                <DPad onKey={(key, pressed) => setWasdKeys(prev => ({ ...prev, [key]: pressed }))} />

                {/* Drive mode status badge — small, non-blocking */}
                {driveMode && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-black/65 text-white px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-sm whitespace-nowrap">
                      <span className="hidden sm:inline">WASD · ESC to exit</span>
                      <span className="sm:hidden">Drag to navigate · Tap Halt</span>
                    </div>
                  </div>
                )}

                <Canvas dpr={[1, 2]}>
                  <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
                  <OrbitControls
                    enableDamping
                    rotateSpeed={0.5}
                    enablePan={false}
                    enableZoom={false}
                    enabled={!driveMode}
                  />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <Center>
                    <DriveController
                      active={driveMode}
                      keys={wasdKeys}
                      currentPosition={currentDir}
                      onPositionUpdate={setCurrentDir}
                      flipDir={driveAntipode}
                    />
                    <SelectorInstrument
                      direction={currentDir}
                      angle={halfAngle}
                      uColor={uColor}
                      negUColor={negUColor}
                      onUpdate={handleQuotientClick}
                      driveMode={driveMode}
                    />
                    <UDirectionMarkers direction={currentDir} uColor={uColor} negUColor={negUColor} />
                    <FiberBundles bundles={fiberBundles} maxBundles={5} />
                  </Center>
                </Canvas>
              </section>
            </div>

            {/* Metric Bar Overlay */}
            <div className="relative md:absolute mt-2 md:mt-0 left-0 md:left-1/2 md:bottom-4 lg:bottom-10 md:-translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-xl md:shadow-2xl flex divide-x divide-slate-100 overflow-x-auto max-w-[calc(100vw-1rem)] md:max-w-[calc(100vw-2rem)] z-10 mx-auto md:mx-0">
              {[
                { label: 'Covering Map', val: 'π: S² → ℝP²' },
                { label: 'Shape', val: shapeId, col: 'text-blue-600' },
                { label: 'Current u', val: `[${currentDir.map(v => v.toFixed(2)).join(', ')}]`, hideOnMobile: true }
              ].map((m, i) => (
                <div key={i} className={`px-4 sm:px-10 py-3 sm:py-4 flex flex-col items-center min-w-[80px] sm:min-w-[160px] shrink-0${m.hideOnMobile ? ' hidden sm:flex' : ''}`}>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</span>
                  <span className={`text-xs font-mono font-bold ${m.col || 'text-slate-900'}`}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Library View */}
        {page === 'library' && <LibraryView />}

        {/* Controls Footer - Only shown in Laboratory view */}
        {page === 'lab' && (
          <footer className="px-4 sm:px-10 py-3 sm:py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-start border-t border-slate-200/40 bg-white/90 backdrop-blur-md z-20">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Base Geometry</label>
              <select
                value={shapeId}
                onChange={(e) => setShapeId(e.target.value as ShapeId)}
                className="bg-white/90 border border-slate-200 rounded-xl p-3 font-bold text-[11px] uppercase cursor-pointer outline-none hover:border-slate-400 transition-all shadow-sm"
              >
                <optgroup label="PLANAR (ℝ²)">
                  <option value="circle">Circle (S¹)</option>
                  <option value="disk">Disk (D²)</option>
                  <option value="triangle">Triangle</option>
                  <option value="square">Square</option>
                </optgroup>
                <optgroup label="SPATIAL (ℝ³)">
                  <option value="sphere">Sphere (S²)</option>
                  <option value="cube">Cube</option>
                  <option value="pyramid">Pyramid</option>
                  <option value="torus">Torus</option>
                </optgroup>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Aperture θ</label>
                <span className="text-[10px] font-mono font-bold text-slate-600">{halfAngle.toFixed(2)} rad ({(halfAngle * 180 / Math.PI).toFixed(0)}°)</span>
              </div>
              <div className="py-1">
                <input
                  type="range" min="0.05" max="1.5" step="0.01"
                  value={halfAngle}
                  onChange={(e) => setHalfAngle(parseFloat(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>
            </div>

            <AntipodalColorPicker
              primaryColor={uColor}
              onPrimaryColorChange={setUColor}
              labels={{ primary: 'u', antipodal: '−u' }}
              showHint={true}
            />

            <div className="flex items-start pt-5">
              <button
                onClick={() => {
                  setCurrentDir([0,1,0]);
                  setHalfAngle(0.4);
                  setUColor("#00e5bc");
                  setFiberBundles([]);
                  setStamps([]);
                  setStampCaps([]);
                }}
                className="w-full px-4 py-2 bg-slate-800 text-white font-black text-[9px] uppercase rounded-full hover:bg-slate-700 transition-all shadow-lg active:scale-95"
              >
                Recalibrate
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* Telemetry Footer */}
      <footer className="h-10 border-t border-slate-100 bg-slate-50 hidden md:flex items-center px-6 justify-between text-[10px] font-bold text-slate-400 tracking-tight uppercase">
        <div className="flex gap-10 items-center">
          <span className="flex items-center gap-2 text-blue-600"><Icon.Pulse /> System Active</span>
          <span className="opacity-60">Invariant: w₁ Checked</span>
        </div>
        <div className="flex gap-8 items-center">
           <span className="font-mono text-slate-300 lowercase">path: [x, -x] ⊂ ℝP²</span>
           <span className="text-slate-900 tracking-tighter">Mayo Manifold v1.2.5</span>
        </div>
      </footer>
    </div>
  );
};

export default QuotientSymmetry;
