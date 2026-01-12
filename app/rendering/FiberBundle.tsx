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
   * Whether to show the fiber bundles
   */
  visible: boolean;

  /**
   * Animation progress (0 to 1)
   */
  animationProgress?: number;
}

export const FiberBundle: React.FC<FiberBundleProps> = ({
  quotientPoint,
  representatives,
  colors,
  visible,
  animationProgress = 1
}) => {
  const [u, negU] = representatives;
  const [colorU, colorNegU] = colors;

  // Create fiber bundle geometry
  const fiberGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    // Each fiber is a line from the quotient point extending upward
    // We'll draw two bundles, one for each representative
    const bundleHeight = 1.5; // Height above the sphere

    // Fiber 1: from quotient point toward u
    const fiber1Points = [
      new THREE.Vector3(...quotientPoint),
      new THREE.Vector3(
        quotientPoint[0] + u[0] * bundleHeight * 0.3,
        quotientPoint[1] + u[1] * bundleHeight * 0.3 + bundleHeight,
        quotientPoint[2] + u[2] * bundleHeight * 0.3
      )
    ];

    // Fiber 2: from quotient point toward -u
    const fiber2Points = [
      new THREE.Vector3(...quotientPoint),
      new THREE.Vector3(
        quotientPoint[0] + negU[0] * bundleHeight * 0.3,
        quotientPoint[1] + negU[1] * bundleHeight * 0.3 + bundleHeight,
        quotientPoint[2] + negU[2] * bundleHeight * 0.3
      )
    ];

    return { fiber1Points, fiber2Points };
  }, [quotientPoint, u, negU]);

  const group = useRef<THREE.Group>(null);

  // Animate the appearance
  useFrame(() => {
    if (group.current) {
      group.current.children.forEach((child, idx) => {
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

  if (!visible) return null;

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
          quotientPoint[0] + u[0] * 0.45 + u[0] * 0.1,
          quotientPoint[1] + u[1] * 0.45 + 1.5 + u[1] * 0.1,
          quotientPoint[2] + u[2] * 0.45 + u[2] * 0.1
        ]}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={colorU} transparent opacity={0.9} />
      </mesh>

      {/* Endpoint markers for -u */}
      <mesh
        position={[
          quotientPoint[0] + negU[0] * 0.45 + negU[0] * 0.1,
          quotientPoint[1] + negU[1] * 0.45 + 1.5 + negU[1] * 0.1,
          quotientPoint[2] + negU[2] * 0.45 + negU[2] * 0.1
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
          opacity={0.2 * animationProgress}
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
  const animatedBundles = useMemo(() => {
    const now = Date.now();
    return bundles.slice(-maxBundles).map(bundle => ({
      ...bundle,
      age: now - bundle.timestamp,
      progress: Math.min(1, (now - bundle.timestamp) / 500) // 500ms animation
    }));
  }, [bundles, maxBundles]);

  return (
    <>
      {animatedBundles.map((bundle, idx) => (
        <FiberBundle
          key={bundle.timestamp}
          quotientPoint={bundle.quotientPoint}
          representatives={bundle.representatives}
          colors={bundle.colors}
          visible={bundle.age < 3000} // Visible for 3 seconds
          animationProgress={bundle.progress}
        />
      ))}
    </>
  );
};
