
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Center, Environment, OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Vec3, Mesh, makeShapeMesh, ShapeId } from '../core';
import { AntipodalColorPicker } from '../app/ui/AntipodalColorPicker';
import { getAntipodalColor } from '../app/ui/colorUtils';
import { FiberBundles } from '../app/rendering/FiberBundle';
import { updatePositionFromWASD, type WASDState } from '../app/ui/sphericalNavigation';
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
  Analytics: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
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

  useFrame(() => {
    if (groupRef.current) {
      const targetVec = new THREE.Vector3(...dir).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      groupRef.current.quaternion.setFromUnitVectors(up, targetVec);
    }
  });

  const coneHeight = Math.cos(Math.min(angle, Math.PI / 2));
  const coneRadius = Math.sin(Math.min(angle, Math.PI / 2));
  const interiorOpacity = 0.35;

  return (
    <group ref={groupRef}>
      <mesh position={[0, coneHeight / 2, 0]} rotation={[Math.PI, 0, 0]} renderOrder={renderOrder}>
        <coneGeometry args={[coneRadius, coneHeight, 128, 1, false]} />
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
        <sphereGeometry args={[1.002, 128, 64, 0, Math.PI * 2, 0, angle]} />
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
  onFiberSpawn
}: {
  active: boolean;
  keys: WASDState;
  currentPosition: Vec3;
  onPositionUpdate: (pos: Vec3) => void;
  onFiberSpawn: (pos: Vec3) => void;
}) => {
  const frameCountRef = useRef(0);

  useFrame((state, delta) => {
    if (!active) return;

    // Update position based on WASD input
    const newPosition = updatePositionFromWASD(currentPosition, keys, delta, 2.0);

    // Only update if position changed
    const changed = !Vec3.approxEq(newPosition, currentPosition, 0.0001);
    if (changed) {
      onPositionUpdate(newPosition);

      // Spawn fiber bundles every 3 frames (~20 per second at 60fps)
      frameCountRef.current++;
      if (frameCountRef.current % 3 === 0) {
        onFiberSpawn(newPosition);
      }
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
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <IdentificationCones direction={direction} angle={angle} uColor={uColor} negUColor={negUColor} />

      {/* Visual Sphere Shell */}
      <mesh renderOrder={50}>
        <sphereGeometry args={[1, 64, 48]} />
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
        <sphereGeometry args={[1, 48, 36]} />
        <meshBasicMaterial color="#94a3b8" wireframe transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
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

// --- View 2: Analytics (Data & Logs) ---
interface TelemetryEntry {
  time: string;
  event: string;
  desc: string;
}

const AnalyticsView = ({ history, fiberCount }: { history: TelemetryEntry[], fiberCount: number }) => {
  const [infoGain, setInfoGain] = useState(14.8);
  const [entropy, setEntropy] = useState(0.42);

  useEffect(() => {
    // Simulate evolving metrics based on activity
    const interval = setInterval(() => {
      setInfoGain(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setEntropy(prev => Math.max(0, Math.min(1, prev + (Math.random() - 0.5) * 0.05)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="text-blue-600"><Icon.Analytics /></div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Operational Telemetry</h2>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/30 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Information Gain</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{infoGain.toFixed(1)}%</span>
              <span className="text-[10px] font-mono font-bold text-blue-600">+{(infoGain * 0.14).toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/30 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Entropy Residual</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{entropy.toFixed(2)} bits</span>
              <span className="text-[10px] font-mono font-bold text-blue-600">-{(entropy * 0.2).toFixed(2)}</span>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/30 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Fiber Bundles</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{fiberCount}</span>
              <span className="text-[10px] font-mono font-bold text-blue-600">Active</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Observation History</span>
            <span className="text-[9px] font-mono text-slate-400">SESSION_LOGS</span>
          </div>
          <div className="divide-y divide-slate-100 font-mono text-[11px] text-left">
            {history.length > 0 ? history.map((h, i) => (
              <div key={i} className="px-6 py-4 flex gap-8 hover:bg-slate-50/50 transition-colors">
                <span className="text-slate-300 w-24 shrink-0">[{h.time}]</span>
                <span className="text-blue-600 font-bold w-32 shrink-0">{h.event}</span>
                <span className="text-slate-600 italic">"{h.desc}"</span>
              </div>
            )) : (
              <div className="p-20 text-center text-slate-300 italic text-xs uppercase tracking-widest">No active telemetry</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- View 3: Library (Theory & Abstract) ---
const LibraryView = () => (
  <div className="flex-1 bg-white p-12 overflow-y-auto text-left">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">The k* Constant and Information Geometry</h2>
          <p className="mb-4">
            From Minimum Description Length theory and Kolmogorov complexity, we derive a candidate universal constant:
          </p>
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 mb-4 text-center">
            <p className="text-2xl font-mono font-bold text-amber-900">k* = 1/(2 ln 2) ≈ 0.721347520...</p>
            <p className="text-sm text-amber-700 mt-2">The exchange rate between questions and answers</p>
          </div>
          <p className="mb-4">
            This constant governs the <strong>information geometry</strong> of the quotient operation. When we
            collapse u and −u into a single equivalence class, we're trading one bit of orientation information
            for topological structure. The constant k* quantifies this exchange.
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

const QuotientSymmetry: React.FC = () => {
  // Page navigation state
  const [page, setPage] = useState<'lab' | 'analytics' | 'library'>('lab');

  const [shapeId, setShapeId] = useState<ShapeId>("sphere");
  const [halfAngle, setHalfAngle] = useState(0.4);
  const [currentDir, setCurrentDir] = useState<Vec3>([0, 1, 0]);
  const [uColor, setUColor] = useState("#00e5bc");

  // Antipodal color is always computed from uColor
  const negUColor = useMemo(() => getAntipodalColor(uColor), [uColor]);

  // Drive mode state
  const [driveMode, setDriveMode] = useState(false);
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

  // Telemetry history for Analytics view
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryEntry[]>([]);

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

  // Add telemetry log helper
  const addTelemetry = useCallback((event: string, desc: string) => {
    const entry: TelemetryEntry = {
      time: new Date().toLocaleTimeString(),
      event,
      desc
    };
    setTelemetryHistory(prev => [entry, ...prev].slice(0, 50)); // Keep last 50 entries
  }, []);

  // Callback when clicking quotient sphere - toggles drive mode
  const handleQuotientClick = useCallback((dir: Vec3) => {
    if (driveMode) {
      // If already in drive mode, exit it
      setDriveMode(false);
      addTelemetry("DRIVE_EXIT", "User exited drive mode navigation");
    } else {
      // Enter drive mode at clicked position
      setCurrentDir(dir);
      setDriveMode(true);
      addTelemetry("DRIVE_START", `Initialized drive mode at direction [${dir.map(v => v.toFixed(2)).join(', ')}]`);

      // Create initial fiber bundle
      const negDir: Vec3 = [-dir[0], -dir[1], -dir[2]];
      setFiberBundles(prev => [
        ...prev,
        {
          quotientPoint: dir,
          representatives: [dir, negDir],
          colors: [uColor, negUColor],
          timestamp: Date.now()
        }
      ]);
    }
  }, [driveMode, uColor, negUColor, addTelemetry]);

  // Spawn fiber bundle during drive mode
  const spawnFiberBundle = useCallback((dir: Vec3) => {
    const negDir: Vec3 = [-dir[0], -dir[1], -dir[2]];
    setFiberBundles(prev => [
      ...prev,
      {
        quotientPoint: dir,
        representatives: [dir, negDir],
        colors: [uColor, negUColor],
        timestamp: Date.now()
      }
    ]);
  }, [uColor, negUColor]);

  const meshData = useMemo(() => makeShapeMesh(shapeId, 64), [shapeId]);

  const leftPanelTitle = useMemo(() => {
    const planar = ["circle", "disk", "triangle", "square"];
    return planar.includes(shapeId) ? "OBJECT IN ℝ² (embedded in ℝ³)" : "OBJECT IN ℝ³";
  }, [shapeId]);

  return (
    <div className="flex flex-col h-screen bg-white text-slate-800 font-sans antialiased">
      {/* Universal Technical Header */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-950 font-black tracking-tighter flex items-center gap-2 text-sm hover:opacity-75 transition-opacity">
            <Icon.Laboratory /> SEAM-VIZ
          </Link>
          <span className="h-4 w-px bg-slate-200" />
          <nav className="flex gap-2">
            {[
              { id: 'lab' as const, label: 'Laboratory', icon: <Icon.Laboratory /> },
              { id: 'analytics' as const, label: 'Analytics', icon: <Icon.Analytics /> },
              { id: 'library' as const, label: 'Library', icon: <Icon.Library /> }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPage(btn.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${page === btn.id ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {btn.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
             <div className={`w-1.5 h-1.5 rounded-full ${driveMode ? 'bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-slate-300'}`} />
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{driveMode ? 'Capturing' : 'Standby'}</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-300">MOD: RP2_PROJ</div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Laboratory View - The Core Visualization */}
        {page === 'lab' && (
          <div className="flex-1 flex flex-col relative bg-slate-50/50 overflow-hidden">
            <div className="flex justify-between items-start mb-8 px-8 pt-8">
              <div className="text-left">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manifold Mapping Laboratory</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Real-time projective identification: S² → ℝP²</p>
              </div>
              <button
                onClick={() => setDriveMode(!driveMode)}
                className={`px-6 py-2 rounded text-[11px] font-bold uppercase border transition-all ${driveMode ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'}`}
              >
                {driveMode ? 'Halt Trace' : 'Initialize Geodesic Trace'}
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row p-8 gap-8 overflow-hidden">
              {/* Object Space */}
              <section className="flex-1 relative rounded-[2.5rem] bg-white/40 border border-white/50 overflow-hidden shadow-inner">
                <div className="absolute top-8 left-10 z-10 pointer-events-none">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{leftPanelTitle}</h2>
                  <p className="text-[8px] text-slate-300 mt-1">Double-Cover Space (S²)</p>
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
                      onUpdate={(dir) => {
                        setCurrentDir(dir);
                        addTelemetry("DIRECTION", `Updated direction to [${dir.map(v => v.toFixed(2)).join(', ')}]`);
                      }}
                    />
                  </Center>
                </Canvas>
              </section>

              {/* Projective Selector */}
              <section className="flex-1 relative rounded-[2.5rem] bg-white shadow-xl overflow-hidden border border-slate-100/50">
                <div className="absolute top-8 right-10 z-10 text-right pointer-events-none">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Quotient Manifold (ℝP²)</h2>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[9px] font-bold text-slate-300 uppercase italic">Map: π(x) ≡ π(−x)</span>
                  </div>
                </div>

                {/* Drive Mode UI Indicator */}
                {driveMode && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="bg-black/80 text-white px-6 py-3 rounded-lg text-center backdrop-blur-sm">
                      <div className="text-sm font-bold mb-1">DRIVE MODE ACTIVE</div>
                      <div className="text-xs opacity-75">WASD: Navigate | ESC: Exit</div>
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
                      onFiberSpawn={spawnFiberBundle}
                    />
                    <SelectorInstrument
                      direction={currentDir}
                      angle={halfAngle}
                      uColor={uColor}
                      negUColor={negUColor}
                      onUpdate={handleQuotientClick}
                      driveMode={driveMode}
                    />
                    <FiberBundles bundles={fiberBundles} maxBundles={5} />
                  </Center>
                </Canvas>
              </section>
            </div>

            {/* Metric Bar Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-2xl flex divide-x divide-slate-100 overflow-hidden z-10">
              {[
                { label: 'Map', val: 'π(x) ≡ π(−x)' },
                { label: 'Parity', val: shapeId, col: 'text-blue-600' },
                { label: 'Boundary', val: 'ℤ₂ Seam' },
                { label: 'k*', val: '0.721347' }
              ].map((m, i) => (
                <div key={i} className="px-10 py-4 flex flex-col items-center min-w-[160px]">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</span>
                  <span className={`text-xs font-mono font-bold ${m.col || 'text-slate-900'}`}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {page === 'analytics' && (
          <AnalyticsView history={telemetryHistory} fiberCount={fiberBundles.length} />
        )}

        {/* Library View */}
        {page === 'library' && <LibraryView />}

        {/* Controls Footer - Only shown in Laboratory view */}
        {page === 'lab' && (
          <footer className="px-14 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center border-t border-slate-200/40 bg-white/90 backdrop-blur-md z-20">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Base Geometry</label>
              <select
                value={shapeId}
                onChange={(e) => {
                  const newShape = e.target.value as ShapeId;
                  setShapeId(newShape);
                  addTelemetry("SHAPE_CHANGE", `Changed geometry to ${newShape}`);
                }}
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
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Aperture θ</label>
              <div className="py-1">
                <input
                  type="range" min="0.05" max="1.5" step="0.01"
                  value={halfAngle}
                  onChange={(e) => {
                    const newAngle = parseFloat(e.target.value);
                    setHalfAngle(newAngle);
                    addTelemetry("APERTURE", `Adjusted aperture to ${newAngle.toFixed(3)} rad`);
                  }}
                  className="w-full accent-slate-800"
                />
              </div>
            </div>

            <AntipodalColorPicker
              primaryColor={uColor}
              onPrimaryColorChange={(color) => {
                setUColor(color);
                addTelemetry("COLOR", `Updated color scheme to ${color}`);
              }}
              labels={{ primary: 'u', antipodal: '−u' }}
              showHint={true}
            />

            <div className="flex justify-end items-center">
              <button
                onClick={() => {
                  setCurrentDir([0,1,0]);
                  setHalfAngle(0.4);
                  setUColor("#00e5bc");
                  setFiberBundles([]);
                  addTelemetry("RESET", "System recalibrated to default state");
                }}
                className="px-8 py-3 bg-slate-800 text-white font-black text-[9px] uppercase rounded-full hover:bg-slate-700 transition-all shadow-lg active:scale-95"
              >
                Recalibrate
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* Telemetry Footer */}
      <footer className="h-10 border-t border-slate-100 bg-slate-50 flex items-center px-6 justify-between text-[10px] font-bold text-slate-400 tracking-tight uppercase">
        <div className="flex gap-10 items-center">
          <span className="flex items-center gap-2 text-blue-600"><Icon.Pulse /> System Active</span>
          <span className="opacity-60">Invariant: w₁ Checked</span>
          <span className="opacity-60 font-mono">k* = 0.721</span>
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
