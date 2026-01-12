
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Center, Environment, OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Vec3, Mesh, makeShapeMesh, ShapeId } from './core';
import { AntipodalColorPicker } from './app/ui/AntipodalColorPicker';
import { getAntipodalColor } from './app/ui/colorUtils';

// --- Semantic Constants ---
const THEME_DARK = "#2D3436";
const INACTIVE_GRAY = "#E2E8F0"; 

// --- Shaders ---

const ObjectShader = {
  uniforms: {
    uDir: { value: new THREE.Vector3(0, 1, 0) },
    uAperture: { value: 0.4 },
    uColorU: { value: new THREE.Color("#00e5bc") },
    uColorNegU: { value: new THREE.Color("#6366f1") },
    uInactiveColor: { value: new THREE.Color(INACTIVE_GRAY) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-modelViewPosition.xyz);
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uDir;
    uniform float uAperture;
    uniform vec3 uColorU;
    uniform vec3 uColorNegU;
    uniform vec3 uInactiveColor;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      // Re-normalize interpolants
      vec3 n = normalize(vNormal);
      vec3 v = normalize(vViewDir);
      
      // We need world-space or local-space normal for direction check
      // For simplicity, assume the geometry is centered and unit-ish
      // We'll pass the light dir in view space or just use world-space logic
      // To keep it simple, we use the raw normal (local space) since 
      // the light direction is provided in local space too.
      // But we need to use the model's normal. 
      // Actually, passing the direction as a uniform and using the standard 'normal' is correct for local coords.
    }
  `
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

const SelectorInstrument = ({ 
  direction, 
  angle, 
  uColor,
  negUColor,
  onUpdate 
}: { 
  direction: Vec3, 
  angle: number, 
  uColor: string,
  negUColor: string,
  onUpdate: (dir: Vec3) => void 
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

const App: React.FC = () => {
  const [shapeId, setShapeId] = useState<ShapeId>("sphere");
  const [halfAngle, setHalfAngle] = useState(0.4);
  const [currentDir, setCurrentDir] = useState<Vec3>([0, 1, 0]);
  const [uColor, setUColor] = useState("#00e5bc");

  // Antipodal color is always computed from uColor
  const negUColor = useMemo(() => getAntipodalColor(uColor), [uColor]);

  const meshData = useMemo(() => makeShapeMesh(shapeId, 64), [shapeId]);

  const leftPanelTitle = useMemo(() => {
    const planar = ["circle", "disk", "triangle", "square"];
    return planar.includes(shapeId) ? "OBJECT IN ℝ² (embedded in ℝ³)" : "OBJECT IN ℝ³";
  }, [shapeId]);

  return (
    <div className="viewport-container overflow-hidden bg-[#F1F3F6]">
      <AbstractUIBackground uColor={uColor} negUColor={negUColor} aperture={halfAngle} />

      <main className="relative z-10 w-full max-w-7xl glass-card rounded-[3.5rem] overflow-hidden flex flex-col min-h-[85vh]">
        
        <header className="px-14 py-10 flex justify-between items-center border-b border-slate-200/40">
          <div className="flex flex-col">
             <span className="font-extrabold text-3xl tracking-tight text-slate-800 uppercase">SEAM</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1 italic">Projective Identification Instrument</span>
          </div>
          <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] hidden md:block">u ≡ −u</div>
        </header>

        <div className="flex flex-col md:flex-row flex-1 p-8 gap-8">
          {/* Object Space */}
          <section className="flex-[1.2] relative rounded-[2.5rem] bg-white/40 border border-white/50 overflow-hidden shadow-inner">
            <div className="absolute top-8 left-10 z-10 pointer-events-none">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{leftPanelTitle}</h2>
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
                  onUpdate={setCurrentDir}
                />
              </Center>
            </Canvas>
          </section>

          {/* Projective Selector */}
          <section className="flex-1 relative rounded-[2.5rem] bg-white shadow-xl overflow-hidden border border-slate-100/50">
            <div className="absolute top-8 right-10 z-10 text-right pointer-events-none">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">DIRECTION SPACE S²</h2>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[9px] font-bold text-slate-300 uppercase italic">Identification: u ≡ −u</span>
              </div>
            </div>
            <Canvas dpr={[1, 2]}>
              <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
              <OrbitControls enableDamping rotateSpeed={0.5} enablePan={false} enableZoom={false} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Center>
                <SelectorInstrument 
                  direction={currentDir} 
                  angle={halfAngle} 
                  uColor={uColor}
                  negUColor={negUColor}
                  onUpdate={setCurrentDir} 
                />
              </Center>
            </Canvas>
          </section>
        </div>

        <footer className="px-14 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-center border-t border-slate-200/40 bg-white/30 backdrop-blur-md">
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
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Aperture θ</label>
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

          <div className="flex justify-end items-center">
            <button
              onClick={() => { setCurrentDir([0,1,0]); setHalfAngle(0.4); setUColor("#00e5bc"); }}
              className="px-8 py-3 bg-slate-800 text-white font-black text-[9px] uppercase rounded-full hover:bg-slate-700 transition-all shadow-lg active:scale-95"
            >
              Recalibrate
            </button>
          </div>
        </footer>
      </main>

      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none opacity-20">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.8em]">S² / ± &bull; TOPOLOGICAL IDENTIFICATION INSTRUMENT</p>
      </div>
    </div>
  );
};

export default App;
