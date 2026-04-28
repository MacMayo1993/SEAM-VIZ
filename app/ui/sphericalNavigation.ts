/**
 * Spherical Navigation Utilities
 *
 * Provides functions for navigating on the surface of a unit sphere
 * using keyboard controls (WASD).
 */

import { Vec3 } from '../../core';

/**
 * Moves a point on the sphere using direct axis rotations — no spherical
 * coordinate conversion, so there is no pole singularity.
 *
 * A/D (deltaTheta): rotate around the world Y axis.
 * W/S (deltaPhi):   rotate around the world X axis.
 *
 * Both axes are fixed globals, so the operation is smooth everywhere
 * including at the north and south poles.
 */
export function moveOnSphere(
  current: Vec3,
  deltaTheta: number,
  deltaPhi: number
): Vec3 {
  let [x, y, z] = Vec3.normalize(current);

  // Rotate around Y axis (left/right)
  if (Math.abs(deltaTheta) > 1e-7) {
    const c = Math.cos(deltaTheta);
    const s = Math.sin(deltaTheta);
    [x, z] = [x * c + z * s, -x * s + z * c];
  }

  // Rotate around X axis (up/down, pole-crossing safe)
  if (Math.abs(deltaPhi) > 1e-7) {
    const c = Math.cos(deltaPhi);
    const s = Math.sin(deltaPhi);
    [y, z] = [y * c - z * s, y * s + z * c];
  }

  return Vec3.normalize([x, y, z]);
}

/**
 * WASD key state
 */
export interface WASDState {
  w: boolean; // Up
  a: boolean; // Left
  s: boolean; // Down
  d: boolean; // Right
}

/**
 * Computes the velocity vector based on WASD key state
 */
export function computeVelocity(
  keys: WASDState,
  speed: number = 2.0
): [number, number] {
  let deltaTheta = 0;
  let deltaPhi = 0;

  if (keys.a) deltaTheta -= speed;
  if (keys.d) deltaTheta += speed;
  if (keys.w) deltaPhi -= speed;
  if (keys.s) deltaPhi += speed;

  return [deltaTheta, deltaPhi];
}

/**
 * Updates position based on WASD input and elapsed time
 */
export function updatePositionFromWASD(
  current: Vec3,
  keys: WASDState,
  delta: number,
  speed: number = 2.0
): Vec3 {
  const [deltaTheta, deltaPhi] = computeVelocity(keys, speed);
  const scaledTheta = deltaTheta * delta;
  const scaledPhi = deltaPhi * delta;

  if (Math.abs(scaledTheta) < 0.0001 && Math.abs(scaledPhi) < 0.0001) {
    return current;
  }

  return moveOnSphere(current, scaledTheta, scaledPhi);
}
