/**
 * Fiber Bundle Visualization Component
 *
 * Visualizes the fiber π⁻¹([u]) = {u, -u} when clicking on the quotient sphere.
 * This makes the covering map S² → ℝP² geometrically visible.
 *
 * Pedagogical concept: When you click [u] in quotient space, you're selecting
 * an equivalence class. The fiber bundles show both representatives in the
 * covering space (source manifold).
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../../core';

interface FiberBundleProps {
  /**
   * The quotient point [u] that was clicked
   */
  quotientPoint: Vec3;

  /**
   * The two representatives {u, -u} in the fiber
   */
  representatives: [Vec3, Vec3];

  /**
   * Colors for the two representatives
   */
  colors: [string, string];

  /**
   * Creation timestamp for time-based animation and expiry
   */
  timestamp: number;
}

export const FiberBundle: React.FC<FiberBundleProps> = ({
  quotientPoint,
  representatives,
  colors,
  timestamp
}) => {
  const [u, negU] = representatives;
  const [colorU, colorNegU] = colors;
  const startRadius = 1.02;
  const endRadius = 1.55;

  // Create fiber bundle geometry
  const fiberGeometry = useMemo(() => {
    // Draw each fiber from its own representative direction to avoid a single shared origin
    // Fiber 1: from representative u outward
    const fiber1Points = [
      new THREE.Vector3(u[0] * startRadius, u[1] * startRadius, u[2] * startRadius),
      new THREE.Vector3(u[0] * endRadius, u[1] * endRadius, u[2] * endRadius)
    ];

    // Fiber 2: from representative -u outward
    const fiber2Points = [
      new THREE.Vector3(negU[0] * startRadius, negU[1] * startRadius, negU[2] * startRadius),
      new THREE.Vector3(negU[0] * endRadius, negU[1] * endRadius, negU[2] * endRadius)
    ];

    return { fiber1Points, fiber2Points };
  }, [u, negU]);

  const group = useRef<THREE.Group>(null);

  // Animate appearance and fade-out based on wall-clock time
  useFrame(() => {
    if (group.current) {
      const age = Date.now() - timestamp;
      const animationProgress = Math.min(1, age / 500);
      const visible = age < 3000;
      group.current.visible = visible;

      group.current.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          const material = child.material as THREE.LineBasicMaterial;
          material.opacity = visible ? animationProgress * 0.8 : 0;
        }
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          material.opacity = visible ? animationProgress * 0.9 : 0;
        }
      });
    }
  });

  return (
    <group ref={group}>
      {/* Fiber bundle 1 (toward u) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={fiberGeometry.fiber1Points.length}
            array={new Float32Array(
              fiberGeometry.fiber1Points.flatMap(p => [p.x, p.y, p.z])
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={colorU}
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </line>

      {/* Fiber bundle 2 (toward -u) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={fiberGeometry.fiber2Points.length}
            array={new Float32Array(
              fiberGeometry.fiber2Points.flatMap(p => [p.x, p.y, p.z])
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={colorNegU}
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </line>

      {/* Endpoint markers for u */}
      <mesh
        position={[
          u[0] * endRadius,
          u[1] * endRadius,
          u[2] * endRadius
        ]}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={colorU} transparent opacity={0.9} />
      </mesh>

      {/* Endpoint markers for -u */}
      <mesh
        position={[
          negU[0] * endRadius,
          negU[1] * endRadius,
          negU[2] * endRadius
        ]}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={colorNegU} transparent opacity={0.9} />
      </mesh>

      {/* Base marker at quotient point */}
      <mesh position={quotientPoint}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Pulsing glow at base */}
      <mesh position={quotientPoint}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

/**
 * Container for multiple fiber bundles with staggered animations
 */
interface FiberBundlesProps {
  bundles: Array<{
    quotientPoint: Vec3;
    representatives: [Vec3, Vec3];
    colors: [string, string];
    timestamp: number;
  }>;
  maxBundles?: number;
}

export const FiberBundles: React.FC<FiberBundlesProps> = ({
  bundles,
  maxBundles = 5
}) => {
  return (
    <>
      {bundles.slice(-maxBundles).map((bundle) => (
        <FiberBundle
          key={bundle.timestamp}
          quotientPoint={bundle.quotientPoint}
          representatives={bundle.representatives}
          colors={bundle.colors}
          timestamp={bundle.timestamp}
        />
      ))}
    </>
  );
};
